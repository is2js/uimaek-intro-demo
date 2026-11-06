const instances = new WeakMap();

/** Poster-first host adapter. The Three.js bundle is imported only after Start. */
export function mountStandaloneFloorplan(container, config = {}) {
  instances.get(container)?.destroy();
  const doc = container.ownerDocument;
  const win = doc.defaultView;
  const button = container.querySelector('[data-fp-start]');
  const poster = container.querySelector('[data-fp-poster]');
  const host = container.querySelector('[data-fp-mount]');
  const message = container.querySelector('[data-fp-message]');
  if (!button || !poster || !host || !message) throw new Error('Standalone floorplan requires poster, start, message and mount elements.');
  const abort = new AbortController();
  let handle = null, loading = null, disposed = false, raf = 0, visible = true;
  let pageActive = true, manuallyPaused = false, running = false, attempts = 0;
  const ready = () => !disposed && pageActive && !manuallyPaused && visible && !doc.hidden && container.isConnected;
  const stopFrame = () => { if (raf) win.cancelAnimationFrame(raf); raf = 0; };
  const tick = time => {
    raf = 0;
    if (!handle || !ready()) { sync(); return; }
    handle.frame(time);
    raf = win.requestAnimationFrame(tick);
  };
  function sync() {
    if (!handle) return;
    if (ready()) {
      if (!running) { handle.resume(); running = true; }
      if (!raf) raf = win.requestAnimationFrame(tick);
    } else {
      stopFrame();
      if (running) handle.pause();
      running = false;
    }
  }
  async function start() {
    if (disposed) return null;
    if (handle) { sync(); return handle; }
    if (loading) return loading;
    button.disabled = true;
    message.textContent = '공간 체험을 준비하고 있습니다…';
    loading = (async () => {
      try {
        const attempt = ++attempts;
        const runtimeUrl = new URL('./playground.js', import.meta.url);
        if (attempt > 1) runtimeUrl.searchParams.set('fp-retry', String(attempt));
        const runtime = await (config.loadRuntime ? config.loadRuntime(attempt) : import(runtimeUrl.href));
        if (disposed) return null;
        const next = await runtime.mountFloorplanPlayground(host, {
          sceneUrl: config.sceneUrl || new URL('./scene.json', import.meta.url).href,
          assetBaseUrl: config.assetBaseUrl,
          profile: config.profile || 'explore', scheduler: 'external', theme: config.theme,
        });
        if (disposed) { next.destroy(); return null; }
        handle = next;
        host.hidden = false; poster.hidden = true; button.hidden = true;
        message.textContent = '';
        sync();
        return handle;
      } catch (error) {
        if (!disposed) {
          host.replaceChildren(); host.hidden = true; poster.hidden = false;
          button.hidden = false; button.textContent = '공간 체험 다시 시도';
          message.textContent = `공간 체험을 시작하지 못했습니다. 미리보기는 계속 볼 수 있습니다. ${error instanceof Error ? error.message : ''}`;
        }
        return null;
      } finally {
        loading = null;
        if (!disposed) button.disabled = false;
      }
    })();
    return loading;
  }
  const observer = typeof win.IntersectionObserver === 'function' ? new win.IntersectionObserver(entries => {
    for (const entry of entries) if (entry.target === container) visible = entry.isIntersecting;
    sync();
  }) : null;
  observer?.observe(container);
  const on = (target, name, listener) => target.addEventListener(name, listener, { signal: abort.signal });
  on(button, 'click', () => { void start(); });
  on(doc, 'visibilitychange', sync);
  on(win, 'pagehide', event => {
    if (event.persisted) { pageActive = false; sync(); }
    else adapter.destroy();
  });
  on(win, 'pageshow', () => { pageActive = true; sync(); });
  const adapter = {
    start,
    pause() { manuallyPaused = true; sync(); },
    resume() { manuallyPaused = false; sync(); },
    getState() { return handle?.getState() || { loading: Boolean(loading), started: false, disposed }; },
    destroy() {
      if (disposed) return;
      disposed = true; abort.abort(); observer?.disconnect(); stopFrame();
      handle?.destroy(); handle = null; running = false;
      host.replaceChildren(); host.hidden = true; poster.hidden = false;
      button.hidden = false; button.disabled = true;
      if (instances.get(container) === adapter) instances.delete(container);
    },
  };
  button.hidden = false; button.disabled = false; poster.hidden = false; host.hidden = true;
  button.textContent = '공간 체험 시작'; message.textContent = '';
  instances.set(container, adapter);
  return adapter;
}

if (typeof document !== 'undefined') for (const container of document.querySelectorAll('[data-floorplan-standalone]')) {
  const query = new URLSearchParams(location.search);
  mountStandaloneFloorplan(container, { profile: query.get('profile') === 'editable' ? 'editable' : 'explore' });
}
