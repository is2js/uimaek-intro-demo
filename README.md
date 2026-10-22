# 의맥전기 인트로 데모

의료진의 치유와 모험을 소개하는 정적 웹사이트입니다. PVP 원본의 Jinja 템플릿·CSS·native ES module을 사용하며 게임 서버, 로그인, 데이터베이스 없이 실행합니다.

**현재 비공개 검토 단계입니다. GitHub Pages는 배포하지 않았습니다.** 이 저장소에는 배포 workflow가 없습니다.

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
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe tools/build.py --check
.venv/Scripts/python.exe tools/build.py
.venv/Scripts/python.exe tools/verify.py
.venv/Scripts/python.exe tools/preview.py --port 8080
```

검토 주소: `http://127.0.0.1:8080/`. 중지는 터미널에서 Ctrl+C입니다. ES module을 사용하므로 HTML 파일을 직접 여는 대신 HTTP 미리보기를 사용하세요.

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

지속적인 변경은 **PVP 원본**에서 진행합니다. 데모 저장소의 생성물만 고치면 다음 내보내기에서 덮어씌워집니다. 독립 실험은 `data/content.json`을 수정해 빌드할 수 있으며 최종 채택할 내용은 원본 JSON과 코드에 먼저 반영하세요. 자산 무결성 검사는 manifest와 다른 이미지 변경을 알려줍니다.

## 원본에서 갱신

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

Pages 설정, `gh-pages` 브랜치, 배포 workflow, 커스텀 도메인은 만들지 않습니다. 후속 공개 요청이 있을 때 저장소 공개 범위와 출처를 검토하고 배포 설정을 별도로 적용합니다. 이번 코드 업로드는 사이트 공개를 실행하지 않습니다.
