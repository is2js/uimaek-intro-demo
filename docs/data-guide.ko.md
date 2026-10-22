# 의맥전기 인트로 데이터 작성 가이드

이 문서는 **독립 데모 사용자**와 **PVP 원본 유지보수자**의 입력 위치를 구분합니다. 독립 사용자는 데모 README의 실행·교체 예제부터 시작하세요.

## 독립 데모: PVP 없이 수정하기

| 목적 | 데모 저장소에서 편집할 곳 |
| --- | --- |
| 브랜드·메타·메뉴·CTA 안내 | `data/content.json`의 `site`, `brand` |
| 섹션 제목·설명·배경 | `sections.<id>.heading/background/copy/assets` |
| 세계관·게임 특징·동료·갤러리 | 상위 `universe`, `features`, `guild`, `gallery` 배열 |
| 가이드 | `guide.protagonist`, `guide.stories` |
| 인물·몬스터·모션·스킬 | `actors`, `monsters`, `heroMonsters`, `characterScene`, `medical`, `elements` |
| 실제 파일 | `assets/` 아래, URL은 `/assets/...` |
| 자산 무결성·변경 이력 | `export-manifest.json` |

독립 빌드는 **`data/content.json`만 읽습니다.** `data/authored/`는 원본의 작성 파일 스냅샷이며 자동 합성하지 않습니다. `sections.*.items`와 상위 배열, `site.navigation[].entries`, 갤러리에 이미 복사된 이름·이미지를 함께 맞춰야 합니다. 카드의 `name/title`, `tag/eyebrow`도 함께 바꿉니다. `contentRef`는 PVP 원본에서 합성할 때의 참조이며 독립 빌드가 다시 해결하지 않습니다.

현재 11개 섹션 ID·9개 메뉴·기존 항목 수는 고정 계약입니다. 문구·자산 교체는 데이터로 가능하지만 섹션 추가·삭제·순서 변경은 템플릿/스키마/코드도 수정해야 합니다. 모바일 크롭은 대부분 CSS가 정하므로 임의의 JSON 필드를 추가해도 동작하지 않습니다.

문구만 바꾸는 예:

```python
data["sections"]["features"]["heading"]["title"] = "우리만의 모험"
data["sections"]["features"]["background"] = "/assets/custom/courtyard.webp"
```

배경 파일을 실제로 넣고 README의 `register_changes.py` 예제로 **해당 파일만** manifest에 등록합니다. `data/content.json`은 파일 목록 해시 대상이 아니지만 `contentRevision/contentSha256`도 갱신하면 기록이 맞습니다. 기존 이미지·CSS·README·템플릿은 파일 해시 대상입니다. 원본의 `sourceCommit/sourceSha256`는 수출 당시 이력으로 보존하고, 자신의 변경 결과 해시와 출처를 별도로 기록합니다. 전체 파일 해시를 무조건 재승인하지 않습니다.

```powershell
.venv/Scripts/python.exe tools/build.py --check
.venv/Scripts/python.exe tools/build.py --base-path /uimaek-intro-demo/
.venv/Scripts/python.exe tools/verify.py --base-path /uimaek-intro-demo/
.venv/Scripts/python.exe tools/preview.py --port 8080 --base-path /uimaek-intro-demo/
```

의술 수행자 슬롯·프레임/발 기준점·장비 시간은 함께 유지합니다. 원소 영상의 스킬 구간 길이는 `max(castDurationMs, effectStartMs + effectDurationMs) + 1100ms`이며 앞 스킬의 길이를 더해 시작점을 정합니다. 현재 별도의 `start/end` JSON 필드는 읽지 않으므로 교체 영상도 같은 순서와 시간으로 제작합니다. 새로운 한글은 subset 서체에 없을 수 있어 UI/시스템 폰트로 대체됩니다. 전체 브랜드 변경은 로고·부제 이미지와 템플릿의 일부 고정 안내도 확인합니다.

독립 사용자 수정본은 별도 커밋/브랜치로 보관합니다. PVP exporter를 재실행하면 생성 JSON·공유 코드·문서를 덮어쓰므로 원본 갱신과 병합 절차를 분리합니다. 아래 내용은 **PVP 원본에서 작성·합성·재내보내는 경우**의 기준입니다.

## PVP 원본: 작성 데이터

원본의 문구·이미지·메뉴는 `data/rpg-intro/`에서 작성합니다. 게임 모션·스킬은 기존 게임 카탈로그에서 선별한 값으로 합칩니다. 원본의 `assets/rpg/ui/intro/v1/content.json`은 생성 결과이므로 직접 편집하지 않습니다.

## 파일과 데이터 흐름

```text
data/rpg-intro/site.json                 공통 브랜드·메뉴·서비스 액션
data/rpg-intro/sections/<section-id>.json 섹션별 문구·배경·소개 카드
data/rpg-intro/schema.json               작성 데이터 + 런타임 schemaVersion 5
                     ↓
tools/build_rpg_intro_catalog.py         기존 게임 자산·의술·원소 메타 선별
tools/rpg_intro_content.py               앱 의존 없는 조립·검증
                     ↓
assets/rpg/ui/intro/v1/content.json       기존 배열 + site + sections
                     ↓
templates/rpg-intro.html / src/rpg/intro.mjs
```

`tools/rpg_intro_content.py`는 FastAPI·SQLAlchemy·게임 서버를 불러오지 않습니다. 정적 데모에서도 이 모듈과 복사한 JSON Schema로 검증할 수 있습니다. 실제 서버 요청에서는 기존 `app/services/rpg_intro.py`가 생성 결과만 캐시하여 읽습니다. 섹션 JSON이나 게임 전체 카탈로그를 요청마다 다시 조립하지 않습니다.

## 공통 site.json

| 필드 | 작성 내용 |
| --- | --- |
| `schemaVersion` | 현재 `5` 고정 |
| `revision` | 배포 식별 문자열. 내용 변경 시 갱신 |
| `sectionOrder` | 기존 11개 앵커를 순서대로 한 번씩 포함 |
| `metadata` | 문서 제목·설명·언어·테마색 |
| `brand` | 이름·부제·로고, 텍스트 로고의 `primary`, `secondary`, `hanja` |
| `navigation` | PC 메가메뉴와 모바일 서랍이 함께 쓰는 9개 그룹 |
| `actions` | 로그인·플레이·진료실 등 서비스 경로와 버튼 문구 |
| `serviceBar`, `footer` | 공통 안내와 하단 서비스 목록 |
| `theme`, `audio` | 기본 낮/밤 상태, 전환 안내, 선택 재생 환경음 |
| `copy` | 서랍 안내 등 공통 문구 |

메뉴의 `source`는 `universe`, `features`, `medical.skills`, `guild`, `elements`, `gallery` 중 하나입니다. 조립 시 실제 배열 순서대로 이름과 ID만 추출합니다. 이름과 의료 모션을 메뉴에 중복 작성하지 않습니다. 직접 링크가 필요한 메뉴는 `entries`에 `target` 또는 `actionId`를 작성합니다. 인연 메뉴는 `value: "actors"`와 `"monsters"`를 유지합니다.

```json
{
  "id": "features",
  "label": "게임특징",
  "kind": "carousel",
  "carousel": "features",
  "source": "features"
}
```

서비스 액션의 표준 키는 `play`, `login`, `clinic`, `staffBoard`, `logout`, `admin`입니다. 링크는 액션 정의 한 곳에서 관리하고 카드·메뉴에는 `actionId`를 씁니다. `logout.method`는 실제 서비스의 POST 동작을 보존해야 합니다. 관리자 액션은 `visibility: "operator"`를 유지합니다. 정적 데모는 액션 ID를 기준으로 `demoMessage: "준비 중입니다."`를 표시하며 실제 로그인·게임·진료실·로그아웃 요청을 보내지 않습니다.

```json
{
  "play": {
    "href": "/play",
    "label": "게임 시작",
    "method": "GET",
    "demoMessage": "준비 중입니다."
  }
}
```

## 섹션별 작성 위치

모든 섹션은 `schemaVersion`, `id`, `heading`, `background`, `assets`, `copy`, `actions`를 갖습니다. `heading`은 `number`, `eyebrow`, `title`, `description`의 문자열 네 개이며, 사용하지 않는 값은 빈 문자열입니다. 여러 줄 제목은 `\n`으로 구분합니다. `background`는 이미지 URL 문자열이며 별도 배경이 없으면 빈 문자열입니다.

| JSON 파일·앵커 | 주요 필드 | 이미지와 구성 |
| --- | --- | --- |
| `visual.json` / `#visual` | `assets.layers.day/night`, `assets.healers`, `copy`, `sequence` 4개, `heroCopy` | 하늘·무대·전경은 같은 구도의 원본 층. 현재 약 1672×941, 무대·전경 RGBA. 의료진 합성 원화는 1254×1254 RGBA |
| `universe.json` / `#universe` | `items` 5개 | 실제 플레이 1장과 계절 원화 4장. 가로 이미지 권장. 캡처는 `gameplayCapture`, `originalImage`, `caption`, `alt` 유지 |
| `character.json` / `#character` | 마을 `background`, `actorCopy` 8명, 안내 `copy` | 배경은 1600×900 마을 원화. 의료진 단독 초상화는 각각 1024×1536 RGBA. 마을의 실제 발좌표·무기·NPC 애니메이션은 별도 기존 manifest가 권위 |
| `features.json` / `#features` | `items` 5개, 각 `foreground`·`actionId` | 가로 원화와 투명 전신 전경. 전경은 남녀 의료진·NPC·의료진 2인 원화 재사용. 배경과 전경은 독립 자산 |
| `gamefeatures.json` / `#gamefeatures` | 의술 소개 heading·copy·background | 약장 원화 1672×941 RGB. 의술 8종 이름·설명·수행자·도구·이펙트는 게임 자료에서 자동 선별 |
| `sect.json` / `#sect` | `items` 3개, 각 `foreground`·`actionId`·`motionActorIds` | 파티·길드·공성 소개 원화. 투명 전경과 실제 인물의 대기 모션을 별도 지정 |
| `skill.json` / `#skill` | `assets.videos.fire/water/wind/earth`, `assets.videoPoster`, `copy` | 약초 정원 1672×941 RGB, 원소별 실제 프레임 시연 WebM 4개. 스킬 6개 순서·연계·설명은 게임 자료에서 자동 선별 |
| `clinic.json` / `#clinic` | `assets.capture`, `copy`, 서비스 `actions` | 호출 원화 배경 1672×941. 실제 PLAY 캡처 1534×1056. 캡처는 예시 데이터임을 설명하고 변형하지 않음 |
| `guide.json` / `#guide` | `assets.protagonist`, `copy`, `stories` 2개 | 주인공 단독 투명 원화와 우측 이야기 카드. 가로 카드 원화 2장 |
| `media.json` / `#media` | `items` 6개, `copy` | 다른 소개 카드의 원화는 `contentRef`로 재사용. 선택 원본 이미지와 캡처 출처 유지 |
| `access.json` / `#access` | 마무리 heading·background·`actions` | 아침 한의원 원화 1672×941 RGB. 중앙 제목과 CTA 주변 여백 확보 |

위 치수는 현재 사용하는 자산의 실제 크기입니다. 같은 역할의 대체 이미지는 동일한 구도와 충분한 해상도를 권장하지만 강제 규격은 아닙니다. 원본 아트·GLB·게임 바인딩을 이 문서의 편집으로 교체하지 않습니다. 투명 전경은 배경이 없는 RGBA를 사용하고 발끝·얼굴이 잘리지 않도록 합니다. 손실 WebP를 쓸 때에도 원본 alpha는 보존하고, 원본과 파생 변환 정보는 해당 자산 manifest에 남깁니다.

## 카드·참조 작성 예

카드의 `id`는 파일 내부에서 고유하고 변경 후에도 안정적으로 유지합니다. `title`과 `eyebrow`는 기존 런타임 호환을 위해 각각 `name`과 `tag`에서 조립합니다.

```json
{
  "id": "battle",
  "name": "전투의 순간",
  "description": "나만의 장비와 스킬로 펼치는 실시간 전투.",
  "image": "/assets/rpg/ui/generated-previews/16-battle-clinic-action-center-20260628.webp",
  "tag": "BATTLE",
  "actionId": "play",
  "foreground": {
    "image": "/assets/rpg/ui/intro/v1/portrait-medical-male.webp",
    "kind": "portrait",
    "side": "right"
  }
}
```

`foreground.kind`는 `portrait`, `npc`, `pair` 중 하나이며, 실제 의술 캐릭터의 body·도구와 관계없는 소개 원화입니다. 정적 데모의 선택 자산 목록에도 전경 파일이 포함되어야 합니다.

동료 카드의 `motionActorIds`에는 현재 `actors`의 ID를 순서대로 씁니다. 현재 파티와 공성 카드는 `["medical-male", "medical-female"]`, 길드 카드는 `["portrait-n017"]`입니다. 조립된 `guild[].motionActors`는 `{id, name, sprite}` 배열이며, `sprite`는 해당 인물의 실제 `encounter.idle.sprite`를 그대로 사용합니다. 무기 overlay나 placement는 포함하지 않습니다. 알 수 없는 ID나 대기 모션이 없는 인물은 조립 시 거절합니다.

미디어가 기존 카드와 같은 원화를 보여주면 파일 경로와 설명을 반복하지 않습니다.

```json
{
  "id": "media-02",
  "contentRef": "features:battle",
  "tag": "GALLERY",
  "type": "image"
}
```

`contentRef`는 `universe:<id>`, `features:<id>`, `guild:<id>`를 참조합니다. 원본 카드의 이름·설명·이미지와 `originalImage`를 가져오고, 현재 카드에 명시한 필드가 우선합니다. 프롤로그 `sequence`는 `spriteRef`로 선택된 실제 프레임을 참조합니다. 지원 형식은 `actor:<id>`, `hero:<id>`, `medical:<growthNodeId>:<performerIndex>`입니다. 프레임 경로나 타이밍을 소개 JSON에 복사하지 않습니다.

## 모션·의술·원소·영상

- `actors`, `monsters`, `heroMonsters`, `heroSprites`, `medical`, `elements`, `characterScene`의 실제 프레임 자료는 기존 authoring builder가 만듭니다. 현재 작성 파일로 옮긴 것은 소개 문구·배경·서비스 액션입니다.
- 의료진 logical 100/200의 실제 외형은 활성 appearance 정책의 300/400입니다. 몸과 도구를 같은 시계로 재생하고 `originX/Y`, 실제 방향 행, 프레임 수, 지속시간을 보존합니다. `frameMs`는 실제 320ms/9프레임처럼 소수일 수 있습니다.
- 의술은 8종의 실제 설명과 모션을 사용합니다. `performerIndex`가 선택한 수행자, 해당 주사 도구, self/target anchor를 유지합니다. 정적 export에서는 사용하지 않는 다른 수행자 슬롯만 `null`로 줄일 수 있습니다. 선택한 슬롯이나 선택한 도구를 제거하면 검증이 실패합니다.
- 원소는 불·물·바람·땅 각각 실제 연계 6개입니다. `prerequisites`, `links`, `castMode`, 효과 시작·지속시간은 게임 권위 데이터입니다. 소개 문구 JSON으로 바꾸지 않습니다.
- `heroSequence`는 히어로 전용 걷기→공격 연계이며 마을의 idle/hover와 별개입니다. 현재 방향·정지 프레임과 원본 메타를 그대로 씁니다.
- 동영상은 `v6-showcase/manifest.json`에 출처와 6개 chapter를 남긴 오프라인 프레임 합성물입니다. 각 960×540·24fps·약 14.292초입니다. **실제 인게임 캡처가 아니라 실제 스킬 프레임 시연 영상**으로 표시합니다. 스킬 메타를 변경한 경우 영상도 별도로 다시 검증·제작합니다.
- 스크롤 연출, RAF, 자동 재생, reduced motion, 키보드·모달 수명은 JS/CSS 코드가 담당합니다. 스타일 코드나 임의 스크립트를 JSON에 넣지 않습니다.

## 검증과 교체 순서

1. 해당 `sections/<id>.json` 또는 `site.json`만 수정합니다. 자산은 먼저 파일로 준비하고 `/assets/...` 경로를 작성합니다.
2. 이미지의 표시 범위·알파·원본 출처를 확인합니다. 실제 캡처는 개인정보 없는 예시 데이터여야 합니다. 게임 스프라이트의 원본 행이나 anchor를 미술 편집으로 변경하지 않습니다.
3. 생성 명령을 실행하고 이어서 읽기 전용 재현 검사를 실행합니다.

```powershell
.venv/Scripts/python.exe tools/build_rpg_intro_catalog.py
.venv/Scripts/python.exe tools/build_rpg_intro_catalog.py --check
.venv/Scripts/python.exe -m unittest discover -s test -p test_rpg_intro_content.py -v
```

4. 실제 템플릿을 렌더하여 해당 구간과 PC/모바일을 확인합니다. 제목·본문에 새 문자가 생겼다면 인트로 전용 글꼴 subset도 확인합니다. 기존 `tools/build_rpg_intro_serif.py --check`가 현재 문자 집합을 검사합니다.
5. 작업 파일을 명시한 `npm run check:changed -- --files ... --dry-run`으로 선택 검사를 확인한 뒤 실제 검사를 실행합니다. 생성 카탈로그의 예산은 UTF-8 pretty JSON 250,000바이트 이하입니다.

검증기는 실제 JSON Schema Draft 2020-12와 추가 참조 검사를 사용합니다. 필수 항목·타입·11개 섹션·카드 수·중복 JSON 키/ID·없는 actionId/contentRef/spriteRef·없는 자산·자산 폴더 밖으로 나가는 URL·시트 밖 row/staticFrame을 거부합니다. `logout`의 POST와 선택 의료 수행자/도구도 확인합니다. 생성 결과는 검증이 모두 끝난 뒤에만 저장합니다. `--check`는 파일을 쓰지 않습니다.

정적 데모의 빌드 후 URL은 상대 경로나 Pages 하위 경로일 수 있으므로 런타임 스키마는 이를 허용합니다. 작성용 JSON은 프로젝트의 실제 `/assets/` 경로만 사용합니다. export 시 선택된 프레임 행을 원본 RGBA 그대로 추출했다면 `rows: 1`, `row: 0`으로 투영하고, 원본 메타·해시·추출 작업은 export manifest에 남깁니다. 출처 필드는 export manifest로 옮길 수 있으며 런타임에서 `sourceManifest` 자체는 필수가 아닙니다. 게임 저장소의 원본 프레임·타이밍은 바꾸지 않습니다.

정적 데모를 배포할 때는 작성 JSON·schema·템플릿·JS/CSS·선택 자산과 원본 기준 commit/hash를 함께 추적합니다. 데모가 서버 API나 실제 인증·진료 데이터에 의존하지 않도록 서비스 액션을 데모 메시지로 연결하고, 큰 영상·스프라이트의 전체 선로딩을 피합니다.
