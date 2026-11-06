// Small host adapter only. The Three.js module is loaded after explicit opt-in.
export function createFloorplanExperience(section, assets, {
  loadModule = url => import(url),
  loadStyles,
  requestFrame = () => {},
} = {}) {
  if (!section || !assets) return null;
  const doc = section.ownerDocument;
  const button = section.querySelector('[data-floorplan-start]');
  const stage = section.querySelector('[data-floorplan-stage]');
  const cover = section.querySelector('[data-floorplan-cover]');
  const status = section.querySelector('[data-floorplan-status]');
  if (!button || !stage || !cover || !status) return null;
  let handle = null, pending = false, dead = false, attempts = 0, disposeStyle = null;
  let visible = false, hidden = false, overlayOpen = false, running = false;
  const resolveAsset = value => {
    const url = new URL(value, doc.baseURI);
    if (url.origin !== new URL(doc.baseURI).origin || !/\/(?:assets)\//.test(url.pathname)
      || !['http:', 'https:'].includes(url.protocol)) throw new Error('체험 자산 경로를 확인해 주세요.');
    return url;
  };
  const styles = loadStyles || (url => new Promise((resolve, reject) => {
    const link = doc.createElement('link'); link.rel = 'stylesheet'; link.href = url;
    link.onload = () => resolve(() => link.remove());
    link.onerror = () => { link.remove(); reject(new Error('체험 스타일을 불러오지 못했습니다.')); };
    doc.head.append(link);
  }));
  function sync(next = {}) {
    if ('visible' in next) visible = next.visible;
    if ('hidden' in next) hidden = next.hidden;
    if ('overlayOpen' in next) overlayOpen = next.overlayOpen;
    const active = !dead && !!handle && visible && !hidden && !overlayOpen;
    if (active !== running) {
      running = active;
      if (active) { handle.resume(); requestFrame(); }
      else handle?.pause();
    }
  }
  async function start() {
    if (dead || pending || handle) return;
    pending = true; attempts++; button.disabled = true; button.setAttribute('aria-busy', 'true');
    status.textContent = '가상 한의원 공간을 준비하고 있습니다.';
    try {
      const runtimeUrl = resolveAsset(assets.runtime);
      const sceneUrl = resolveAsset(assets.scene);
      const cssUrl = resolveAsset(assets.css);
      if (attempts > 1) runtimeUrl.searchParams.set('retry', String(attempts));
      if (!disposeStyle) {
        const dispose = await styles(cssUrl.href);
        if (dead) { dispose(); return; }
        disposeStyle = dispose;
      }
      const module = await loadModule(runtimeUrl.href);
      if (dead) return;
      stage.hidden = false;
      const prepared = await module.mountFloorplanPlayground(stage, {
        sceneUrl: sceneUrl.href, assetBaseUrl: new URL('.', sceneUrl).href,
        profile: 'explore', scheduler: 'external',
      });
      if (dead) { prepared.destroy(); return; }
      handle = prepared; cover.hidden = true; stage.hidden = false;
      handle.pause();
      section.dataset.floorplanState = 'ready';
      status.textContent = '가상 공간 체험입니다. 화면을 누른 뒤 이동키를 사용하고, 모바일에서는 조이스틱으로 이동하세요.';
      sync(); if (visible && !hidden && !overlayOpen) stage.focus({ preventScroll: true }); requestFrame();
    } catch (error) {
      if (!dead) {
        stage.replaceChildren(); stage.hidden = true; cover.hidden = false;
        section.dataset.floorplanState = 'failed'; button.textContent = '다시 불러오기';
        status.textContent = '공간을 불러오지 못했습니다. 미리보기는 계속 볼 수 있으며 다시 시도할 수 있습니다.';
      }
    } finally {
      pending = false;
      if (!dead) { button.disabled = false; button.removeAttribute('aria-busy'); }
    }
  }
  button.addEventListener('click', start);
  return {
    start, sync,
    frame(time) { if (!running || dead) return false; handle.frame(time); return true; },
    destroy() {
      if (dead) return; dead = true; running = false;
      button.removeEventListener('click', start); handle?.destroy(); handle = null;
      disposeStyle?.(); disposeStyle = null; stage.replaceChildren(); stage.hidden = true;
      cover.hidden = false; button.disabled = false; button.removeAttribute('aria-busy');
      section.dataset.floorplanState = 'poster';
    },
    getState() { return { ready: !!handle, pending, running, dead }; },
  };
}
