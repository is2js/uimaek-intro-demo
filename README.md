# 의맥전기 인트로 데모 · 데이터 교체 가이드

의료진의 치유와 모험을 소개하는 정적 웹사이트입니다. PVP 원본의 Jinja 템플릿·CSS·native ES module을 사용하며 게임 서버, 로그인, 데이터베이스 없이 실행합니다.

**공개 데모: https://is2js.github.io/uimaek-intro-demo/** · 저장소는 공개이며 main push 시 검증 후 Pages에 자동 배포합니다.

이 README의 독립 수정 절차는 **PVP 원본 저장소가 없는 사용자**를 위한 것입니다. 저장소를 clone하거나 ZIP으로 내려받으면 문구·이미지·기존 항목의 데이터를 교체할 수 있습니다. 코드·원화의 제3자 재배포 허용 여부는 소유자에게 확인해야 하며, 이 가이드가 자산 사용권을 부여하지는 않습니다.

## 다른 프로젝트로 재사용하는 순서

1. 아래 로컬 실행 절차로 원본 데모가 정상 빌드되는지 확인합니다.
2. **`data/content.json`**에서 브랜드·섹션 제목·기존 카드의 문구를 바꿉니다.
3. 새 자산을 `assets/custom/`에 넣고 JSON의 `/assets/...` 경로를 교체합니다.
4. 아래 예제로 직접 검토한 파일만 manifest에 등록합니다.
5. `build.py --check` → `build.py` → `verify.py`를 실행하고 PC·모바일에서 확인합니다.

현재 템플릿은 **11개 섹션·9개 메뉴와 기존 콘텐츠 개수**를 유지합니다. 문구·그림·기존 항목의 메타데이터는 데이터로 바꿀 수 있습니다. 섹션 추가·삭제·순서 변경·인물 수 변경은 템플릿·스키마·코드도 수정해야 합니다. `site.sectionOrder`만 바꿔도 HTML 배치 순서가 바뀌지는 않습니다.

## 사이트 구성

| 주소의 해시 | 내용 |
| --- | --- |
| `#visual` | 낮·밤 풍경, 의료진, 방향별 몬스터 걷기→공격, 프롤로그 |
| `#universe` | 새남해3 R35f 실제 플레이와 사계절 원화 |
| `#character` | 마을 인연 8명과 거점별 몬스터 아종 10종 |
| `#features` | 전투·성장·준비·동료·진료실의 다섯 이야기 |
| `#gamefeatures` | 300·400 의료진의 의술과 실제 도구·효과 |
| `#sect` | 파티·길드·공성 및 길드전의 동료 소개 |
| `#skill` | 불·물·바람·땅과 실제 선행 관계·효과·스킬 프레임 영상 |
| `#clinic` | 플레이 좌상단과 연동되는 실제 진료 타이머 캡처 |
| `#guide` | 주인공 원화와 첫 모험·치유 안내 |
| `#media` | 원화/플레이 갤러리, 확대, 다운로드 |
| `#access` | 마지막 모험 시작 안내 |

게임 시작·로그인·진료실·현황판은 **“준비 중입니다.”**를 표시합니다. 슬라이더·드래그·인물 선택·원화 확대·프롤로그·스킬 영상·환경음·이미지 다운로드는 실제 작동합니다. 실시간 게임이나 진료 데이터를 제공하는 데모는 아닙니다.

## 로컬 실행

Python 3.10 이상과 Node.js 18 이상(모듈 문법 검사)을 사용합니다. 런타임에는 CDN이나 npm 패키지가 필요하지 않습니다.

```powershell
git clone https://github.com/is2js/uimaek-intro-demo.git
cd uimaek-intro-demo
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe tools/build.py --check
.venv/Scripts/python.exe tools/build.py
.venv/Scripts/python.exe tools/verify.py
.venv/Scripts/python.exe tools/preview.py --port 8080
```

검토 주소: `http://127.0.0.1:8080/`. 중지는 터미널에서 Ctrl+C입니다. ES module을 사용하므로 HTML 파일을 직접 여는 대신 HTTP 미리보기를 사용하세요.

macOS/Linux에서는 `.venv/Scripts/python.exe`를 `.venv/bin/python`으로 바꿉니다. `build.py --check`는 입력·해시 검사, `build.py`는 `dist/` 생성, `verify.py`는 생성 HTML·경로·모듈 검사입니다. **데이터 수정 후에도 다시 빌드해야 화면에 반영됩니다.** `dist/`를 직접 고치지 않습니다.

GitHub 프로젝트 경로를 미리 확인할 때는 다음을 사용합니다.

```powershell
.venv/Scripts/python.exe tools/build.py --base-path /uimaek-intro-demo/
.venv/Scripts/python.exe tools/verify.py --base-path /uimaek-intro-demo/
.venv/Scripts/python.exe tools/preview.py --port 8080 --base-path /uimaek-intro-demo/
```

주소: `http://127.0.0.1:8080/uimaek-intro-demo/`. `dist/`는 재생성 결과이며 Git에 포함하지 않습니다.

## 데이터와 이미지 수정

- [전체 데이터·이미지 가이드](docs/data-guide.ko.md): 섹션별 필드, 자산 규격, 의료·원소 모션과 영상 구간.
- `data/content.json`: 게임 서버 의존을 해소한 최종 v5 데이터. 독립 빌드는 이 파일을 입력으로 사용합니다.
- `data/authored/`: PVP의 사이트·섹션별 JSON 스냅샷. 수정할 원본 위치를 확인하는 용도입니다.
- `schema/schema.json`: 필수 필드와 구조 계약.
- `export-manifest.json`: 출처 커밋, 원본·결과 해시, 선택된 자산 목록과 방향 추출 내역.

독립 사용자에게 **빌드 입력은 `data/content.json` 한 파일**입니다. `data/authored/`는 참고 스냅샷이며 독립 빌드가 읽거나 자동 합성하지 않습니다. PVP 유지보수자는 아래 원본 갱신 절차를 사용합니다. 독립 수정본에 원본 exporter를 다시 실행하면 JSON·README·공유 코드가 덮어써지므로 별도 브랜치/커밋으로 보관하고 변경을 병합하세요.

JSON은 UTF-8·큰따옴표를 사용하며 주석·마지막 쉼표·중복 키는 허용하지 않습니다. 경로는 `/assets/custom/scene.webp`처럼 저장소 기준 URL로 씁니다. `C:\...`, `file://`, 외부 CDN URL이나 `/uimaek-intro-demo/` 접두사를 데이터에 넣지 않습니다.

### 실제 편집 위치와 필요한 자산

다음 경로는 모두 `data/content.json` 내부입니다. 기존 항목의 ID·필수 필드·개수를 유지하면서 값을 바꾸는 방법으로 시작하세요.

| 섹션 | 표시 데이터 / 함께 맞출 복사본 | 준비할 자산 |
| --- | --- | --- |
| 첫 화면 | `sections.visual.copy/assets`, `brand`와 `site.brand`, `heroMonsters` 3종 | 낮·밤 하늘/무대/전경, 투명 주인공·로고·부제, 걷기/공격 시트 |
| 세계관 | `universe` 5개와 `sections.universe.items` | 실제 플레이 1장+풍경 4장. `originalImage`, `caption`, `alt`도 변경 |
| 인연 | `actors` 8명, `monsters` 10종, `characterScene`, `sections.character` | 마을 배경, 단독 초상화, NPC 전신, 대기/공격 시트, 아종 초상화·거점명 |
| 게임 특징 | `features` 5개와 `sections.features.items` | 가로 원화와 프레임 밖으로 나오는 투명 전신 |
| 의술 | `medical.skills` 8개, `sections.gamefeatures` | 아이콘, 선택 수행자 몸/도구 시트, self/target 효과 |
| 동료 | `guild` 3개와 `sections.sect.items` | 배경과 `motionActors[].sprite`의 대기 모션 |
| 원소 | `elements` 4계열×6스킬, `sections.skill` | 원소/스킬 아이콘, 효과, 계열별 WebM·포스터 |
| 진료실 | `sections.clinic.assets.capture/copy/background` | 타이머 캡처와 배경 원화. 개인정보 없는 예시 화면 |
| 가이드 | `guide.protagonist/stories` 2개와 `sections.guide` | 투명 주인공, 우측 카드 가로 그림 2장 |
| 미디어 | `gallery` 6개와 `sections.media.items` | 원화·캡처와 확대/다운로드용 `originalImage` |
| 마지막 CTA | `sections.access`, `site.actions` | 제목·버튼 주변이 비어 있는 원화 |

모든 섹션의 제목·설명·배경은 `sections.<id>.heading/background`에 있습니다. 카드는 **이미 해석된 상위 배열**(`features`, `universe`, `guild`, `gallery`, `guide`)이 실제 표시 데이터입니다. 독립 빌드는 `sections.*.items`의 `contentRef`를 다시 해석하지 않습니다. 반복된 이름·이미지는 메뉴 `site.navigation[].entries`, `name/title`, `tag/eyebrow`, 갤러리에도 맞춥니다. 아래 예제는 같은 문자열을 함께 바꿉니다.

| 이미지 역할 | 권장 규격 | 모바일 구도 |
| --- | --- | --- |
| 배경·풍경 | 16:9, 약 1672×941 이상, WebP/JPEG | 피사체를 중앙에 두고 제목 자리에 여백 |
| 특징·가이드 카드 | 16:9 가로 원화 | 좌우가 잘려도 핵심 인물·행동이 보이게 |
| 전경·초상화 | 세로 2:3, 약 1024×1536, 투명 RGBA WebP/PNG | 얼굴·손·발 포함, 투명 여백은 과도하지 않게 |
| 로고·부제 | 기존 투명 캔버스 비율 유지 | 축소해도 읽히는 선 굵기 |
| 플레이·타이머 캡처 | 기존 캡처 비율 유지, 읽을 수 있는 해상도 | 확대 가능, 캡처 글자를 변형하지 않기 |
| 아이콘 | 정사각형 PNG/WebP | 작은 크기에서도 구별되는 실루엣 |
| 모션·효과 시트 | 기존 셀 크기×프레임 수, 투명 RGBA·무손실 | 발 기준점·장비 좌표 유지 |
| 스킬 영상 | WebM, 현재 960×540·24fps | 인라인·확대 화면을 모두 확인 |

현재 대부분의 모바일 크롭은 CSS가 정합니다. 임의의 `mobileFocus` JSON 필드를 추가해도 자동 적용되지 않습니다. 기존 이미지와 구도를 맞추거나 해당 CSS를 조정합니다.

### 예제 1: 문구만 바꾸기

다음 코드를 루트의 `customize.py`로 저장해 `.venv/Scripts/python.exe customize.py`로 실행합니다. PVP 원본 도구가 필요하지 않습니다.

```python
import json
from pathlib import Path

path = Path("data/content.json")
data = json.loads(path.read_text(encoding="utf-8"))
changes = {
    data["features"][0]["name"]: "함께 여는 모험",
    data["features"][0]["description"]: "동료와 만나 새로운 여정을 시작하세요.",
}
def replace(value):
    if isinstance(value, dict):
        return {key: replace(item) for key, item in value.items()}
    if isinstance(value, list):
        return [replace(item) for item in value]
    return changes.get(value, value) if isinstance(value, str) else value
data = replace(data)
data["revision"] = data["site"]["revision"] = "custom-001"
data["site"]["metadata"]["title"] = "청연기 · 새로운 모험"
data["site"]["metadata"]["description"] = "동료와 함께하는 동양 판타지 이야기"
for brand in (data["brand"], data["site"]["brand"]):
    brand.update(name="청연기", primary="청연", secondary="기", hanja="青緣記")
data["sections"]["visual"]["copy"]["lead"] = "당신의 손길로 시작되는 이야기"
data["sections"]["features"]["heading"]["title"] = "우리의 모험을 소개합니다"
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
```

**이미지에 그려진 로고는 이름 텍스트만으로 바뀌지 않습니다.** 투명 로고·부제도 다음 절차로 교체하세요. 일부 고정 안내·접근성 문구는 템플릿/JS에 있으므로 전체 브랜드 변경 시 `rg "의맥전기" templates src data`로 남은 문구를 확인합니다.

### 예제 2: 새 이미지와 해시 등록

1. 새 그림을 `assets/custom/feature-battle.webp`에 저장합니다.
2. `data/content.json`에서 첫 특징 카드의 기존 `image` 경로를 새 `/assets/custom/feature-battle.webp`로 교체합니다. 같은 그림을 사용하는 메뉴·갤러리·원본 링크도 바꾸려면 기존 경로 전체를 치환합니다. 첫 카드만 바꾸려면 `features[0].image`와 `sections.features.items[0].image`만 수정합니다.
3. 아래 코드를 `register_changes.py`로 저장하고 실행합니다. **직접 검토한 파일만** `reviewed_files`에 적습니다. 문구만 수정했다면 빈 배열 `[]`로 두어 콘텐츠 이력만 갱신합니다.

```python
import hashlib
import json
from pathlib import Path

root = Path.cwd().resolve()
manifest_path = root / "export-manifest.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
files = {row["path"]: row for row in manifest["files"]}
reviewed_files = ["assets/custom/feature-battle.webp"]
for relative in reviewed_files:
    path = (root / relative).resolve()
    if not path.is_relative_to(root) or not path.is_file():
        raise ValueError(f"Missing or unsafe file: {relative}")
    content = path.read_bytes()
    row = files.setdefault(relative, {"path": relative})
    row.update(bytes=len(content), sha256=hashlib.sha256(content).hexdigest())
    row["customization"] = "독립 교체본; 원본 출처 필드는 이전 수출 이력"
    row.pop("width", None)  # 크기가 달라졌다면 과거 이미지 치수를 남기지 않음
    row.pop("height", None)
content = (root / "data/content.json").read_bytes()
data = json.loads(content.decode("utf-8"))
manifest["files"] = [files[key] for key in sorted(files)]
manifest["assetBytes"] = sum(row["bytes"] for row in files.values()
                             if row["path"].startswith("assets/"))
manifest["contentSha256"] = hashlib.sha256(content).hexdigest()
manifest["contentRevision"] = data["revision"]
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
                         encoding="utf-8")
```

이미지뿐 아니라 README·CSS·템플릿도 manifest에 있으므로 수정했다면 해당 경로를 명시합니다. `sourceCommit/sourceSha256`는 수출 당시 원본 이력으로 보존하고 결과 `sha256/bytes`만 갱신합니다. 시트 자체를 교체했다면 과거 `pixelExact/sourceRow` 기록도 새 제작 이력과 구분하세요. **전체 파일의 해시를 일괄 재생성하지 않습니다.** 변경하지 않은 파일의 손상 검사가 유지되어야 합니다.

```powershell
.venv/Scripts/python.exe register_changes.py
.venv/Scripts/python.exe tools/build.py --check
.venv/Scripts/python.exe tools/build.py
.venv/Scripts/python.exe tools/verify.py
.venv/Scripts/python.exe tools/preview.py --port 8080
```

이전 이미지는 자동 삭제되지 않습니다. 참조가 남은 파일을 지우면 빌드가 실패합니다. 빌드 후 390px·1440px 및 낮은 창 높이에서 제목·인물 잘림·메뉴·드래그·확대·Escape·초점 복귀를 확인하세요.

### 모션·원소·글꼴·서비스 변경 기준

- 모션은 `src`, `frameWidth/Height`, `frames`, `rows/row`, `frameMs`, `originX/Y`, `displayWidth`를 함께 바꿉니다. 시트 크기는 `frameWidth × frames`, `frameHeight × rows`여야 합니다. 방향 이름만 바꿔도 그림이 회전하지 않습니다. 추출 시트는 `rows: 1`, `row: 0`입니다.
- 의술은 `performerIndex`가 가리키는 `performers/performerTools` 슬롯을 함께 유지합니다. 비선택 `null` 슬롯을 삭제해 인덱스를 당기지 않습니다. self/target anchor와 몸·도구·효과 시간을 함께 확인합니다.
- 원소의 `prerequisites/links`는 같은 원소의 `growthNodeId`를 연결합니다. 영상은 `elements[].videoSrc/videoPoster`와 `sections.skill.assets.videos/videoPoster`를 함께 교체합니다. 현재 임의의 `start/end` 필드를 읽지 않습니다. 각 스킬 구간은 `max(castDurationMs, effectStartMs + effectDurationMs) + 1100ms`이며 앞 스킬의 구간 합이 시작점입니다. 영상 순서·시간도 맞춰 제작해야 합니다.
- IntroSerif는 기존 문구의 subset입니다. 새 한글은 UI/시스템 서체로 대체될 수 있습니다. 모든 글자를 같은 서체로 쓰려면 사용권이 있는 전체 한글 WOFF2와 폰트 CSS를 교체·등록합니다. subset 재생성 도구는 PVP 원본에 있습니다.
- `site.actions.<id>.label`은 기본 버튼 문구, `.demoMessage`는 클릭 안내입니다. 개별 버튼은 `sections.*.copy/actions[].label`을 쓰기도 합니다. 액션 ID `play/login/clinic/staffBoard/logout/admin`은 유지합니다. 독립 빌드는 **항상 demo·익명으로 고정**하므로 `href`만 바꿔도 실제 서비스로 이동하지 않습니다.

### 자주 생기는 문제

| 오류·현상 | 해결 |
| --- | --- |
| `Asset changed without re-export` | 검토한 변경 파일만 예제 2의 목록에 등록 |
| `Content asset is not in the exported closure` | 새 파일을 manifest에 등록 |
| `Missing intro asset` / 경로 대소문자 오류 | JSON URL·파일명·확장자·대소문자 일치 확인 |
| 수정한 문구가 안 보임 | `data/content.json`을 수정했는지, 다시 빌드했는지 확인 |
| 카드·메뉴·확대 그림이 다름 | 상위 배열·메뉴 entries·갤러리·`originalImage` 복사본 동기화 |
| 필수 필드·개수 오류 | 기존 ID·필드·콘텐츠 수 유지 |
| 250,000바이트 예산 초과 | 본문 축약. base64·제작 원본 메타를 JSON에 넣지 않기 |
| 모션 발·장비 위치가 어긋남 | 셀·프레임 순서·원점·재생 시간 확인 |
| 영상 탐색이 안 됨 | 영상 구간 일치 및 HTTP Range(206) 지원 서버 사용 |

다른 저장소명으로 재사용하려면 빌드·검증·미리보기에 같은 `--base-path /my-intro/`를 전달합니다. 주소는 `http://127.0.0.1:8080/my-intro/`입니다. 도메인 루트는 `/`를 사용합니다. 이는 로컬 검사이며 Pages를 활성화하지 않습니다.

## 원본에서 갱신

이 절은 PVP 원본 유지보수자용이며 독립 사용자에게 필수가 아닙니다.

원본: https://github.com/is2js/pvp

PVP 체크아웃에서:

```powershell
.venv/Scripts/python.exe -m pip install -r tools/rpg_intro_demo/requirements.txt
.venv/Scripts/python.exe -X utf8 tools/build_rpg_intro_catalog.py
.venv/Scripts/python.exe -X utf8 tools/build_rpg_intro_catalog.py --check
# 이번 변경만 검사하고 선별 커밋한 뒤 내보냅니다.
.venv/Scripts/python.exe -X utf8 tools/export_rpg_intro_demo.py --output ../uimaek-intro-demo
.venv/Scripts/python.exe -X utf8 ../uimaek-intro-demo/tools/build.py --check
.venv/Scripts/python.exe -X utf8 ../uimaek-intro-demo/tools/build.py --base-path /uimaek-intro-demo/
.venv/Scripts/python.exe -X utf8 ../uimaek-intro-demo/tools/verify.py --base-path /uimaek-intro-demo/
```

변경분과 manifest를 확인하고 이 데모 저장소의 관련 변경만 커밋·푸시합니다. 내보내기는 `.intro-export.json`으로 소유가 확인된 디렉터리만 갱신합니다. 이전 manifest에 있고 더 이상 참조하지 않는 자산 중 해시가 그대로인 파일만 정리합니다. 별도 사용자 파일과 수정한 자산은 자동 삭제하지 않습니다.

## 자산과 실행 원칙

선택한 원화·캡처·초상화·모션·효과·글꼴만 포함합니다. 다방향 스프라이트는 필요한 행을 PNG로 무손실 추출했으며 RGBA 픽셀·발 기준점·장비 배치·재생 시간은 원본을 유지합니다. 작은 원소 효과 미리보기와 영상은 각각 실제 효과 시트와 실제 스킬 프레임을 사용합니다. 스킬 영상은 프레임 조합 시연이며 실시간 플레이 녹화와 구분합니다.

폰트 라이선스는 해당 `assets/.../fonts/` 또는 `assets/rpg/fonts/web/LICENSE.txt`에 보존합니다. 화면 구성과 상호작용 참고 사이트는 https://dokkaebi.kakaogames.com/ 이며 그 사이트의 브랜드·캐릭터·영상은 데모 자산으로 배포하지 않습니다.

단일 RAF, 이미지 큐 2개, 가시성 기반 준비를 사용합니다. 숨김 탭·모달 뒤·화면 밖의 반복 연출은 중단하고 동작 줄이기에서는 정지 화면을 제공합니다. 전체 약 70MB는 저장소의 선택 자산 용량 추산이며 최초 페이지 다운로드 용량이 아닙니다.

## 배포 상태

비공개 저장소에서도 공개 Pages를 만들 수 있습니다. 개인은 GitHub Pro, 조직은 Team·Enterprise 등 비공개 저장소의 Pages를 지원하는 요금제가 필요하며 Free에서는 공개 저장소가 필요합니다. 저장소와 사이트의 공개 범위는 별개입니다. 공개 사이트에 포함된 이미지·JSON·JS는 방문자가 내려받을 수 있습니다. [지원 요금제](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [비공개 저장소의 공개 사이트 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

이 데모의 Pages 주소는 **https://is2js.github.io/uimaek-intro-demo/** 입니다. Pages를 선택한 저장소에서는 `.github/workflows/pages.yml`이 main push 또는 수동 실행 시 데이터·해시 검사→정적 빌드→경로 검사→`dist/` 업로드→배포를 수행합니다. [배포 실행 기록](https://github.com/is2js/uimaek-intro-demo/actions/workflows/pages.yml)에서 성공 여부를 확인합니다. API·DB·인증은 배포하지 않습니다. `gh-pages` 브랜치와 커스텀 도메인은 사용하지 않습니다.

PVP 원본에서 처음 배포용으로 내보낼 때는 `tools/export_rpg_intro_demo.py --output ../uimaek-intro-demo --pages`를 사용합니다. 선택은 `.intro-export.json`의 `pagesEnabled`에 저장되며 이후 일반 내보내기에서도 workflow와 README 상태를 유지합니다. 새 대상에 일반 내보내기만 실행하면 배포 workflow를 만들지 않습니다. 내보내기 자체가 GitHub 설정을 바꾸거나 push하지는 않습니다.

공개 저장소의 Settings → Pages에서 Source를 **GitHub Actions**로 설정한 경우에 배포됩니다. 새로 복사한 프로젝트는 저장소 설정과 workflow를 확인한 뒤 배포하세요. main에 push하면 현재 공개 사이트가 갱신되므로 작업 브랜치에서 먼저 로컬 검증하고 병합합니다. 실패 시 사이트는 이전 정상 배포를 유지하며, 이전 정상 커밋을 새 커밋으로 복원해 다시 배포할 수 있습니다. API 키나 비공개 데이터를 JSON·자산에 넣지 않습니다.
