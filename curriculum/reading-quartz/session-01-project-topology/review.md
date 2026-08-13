# reading-quartz 01 리뷰 — 프로젝트 지형 파악

**판정: ✅ 통과** (Q1~Q6 전 문항, 문항별 상세는 `answers/` 각 파일의 판정·리뷰 노트 참조)

types 커리큘럼과 달리 이 세션의 산출물은 코드가 아니라 "검증된 관찰"이다.
학습자가 확보한 관찰의 양과 질 모두 첫 실전 세션으로는 기대 이상이었다.

## 방법론 수확 (이 카테고리의 본편)

- **근거 병기 규율**: 모든 주장에 파일:줄 앵커. 리뷰에서 앵커 오기(esbuild 행의
  복붙 오류)와 오염된 근거(아래)까지 걸러냄.
- **관찰 오염 사건 (Q3)**: 분석 중 본인이 바꾼 quartz-blog tsconfig(미커밋)를
  프로젝트의 사실로 인용. `git status` / `git show HEAD:경로`로 판별하고 원복.
  교훈: **분석 대상 저장소는 읽기 전용, 실험했으면 관찰 전에 원복.** 기준선
  커밋이 있었기에 판별이 가능했다.
- **소스 먼저, 문서 나중의 이점**: 문서는 의도, 소스는 현실. 소스를 먼저 읽은
  상태에서 문서를 읽으면 의도-현실 드리프트를 잡는 검증자가 된다.
- **멈춤 신호**: "상세 분석이 시간 낭비 같다"는 감각은 해당 문항의 요구 깊이를
  지난 것(Q5). 지형 파악은 "누가 중추인가"까지만.

## 기술 수확 (types 커리큘럼 개념의 실전 회수)

- **부트스트랩 문제**: TS를 실행 가능하게 만드는 층(JS 런처)은 TS로 쓸 수 없다.
  실행 사슬: bin → bootstrap-cli.mjs → handlers.js(esbuild 자기 번들) →
  동적 import → build.ts. watch 모드의 ESM 캐시 무력화(`?update=UUID`) 포함.
- **경계 무검증의 해부 (Q2)**: `YAML.parse(raw) as` + `as unknown as
  GlobalConfiguration`(겹침 부족 우회). v4(설정=TS코드, 컴파일타임 검증) →
  v5(YAML, 편집타임 JSON Schema)로 검증 층이 이동했고 런타임만 비어 있음.
- **드리프트 표본 수집 (누적 3건)**: ① JSON Schema ↔ TS 타입의 양방향 드리프트
  (schema.json:167, PR #2485), ② 코어 types.ts ↔ @quartz-community/types 사본
  2벌(구조적 타이핑이 다리, utils는 재export 단일 소스인 것과 비대칭),
  ③ Analytics 소비 코드의 exhaustiveness 미수확(11/11 커버는 현재의 우연,
  강제 장치 없음 + null의 침묵과 사고의 침묵이 경로 공유).
- **discriminated union의 안전 2층론 (Q6)**: narrowing은 자동, exhaustiveness는
  소비자 옵트인. Quartz는 절반만 수확 중.
- **파이프라인 지도 (Q5)**: remark-parse(md→mdast) → remark-rehype(mdast→hast)
  → preact(hast→HTML), 전체가 unified 인터페이스 위에서 vfile을 흘려보냄.

## 세션 중 문답 (glossary.md 및 각 답안 부록에 기록)

겹침 부족(TS2352)과 이중 단언의 출생 경위 / 암묵적 인덱스 시그니처와 interface
제외 이유(선언 병합=열린 타입) / 필수 프로퍼티는 `?` 부재가 기본 / npx는 bin,
npm run은 scripts / Map 키는 참조 동등성 / explicit-publish 필터가 docs 404의
원인(조용한 필터링) / 파일 감시기가 두 프로세스를 잇는 다리(Warp 사건).

## upstream 기여 후보 (세션 04 이후 검토)

1. config 경계의 런타임 검증 — Zod SSOT에서 TS 타입 + JSON Schema + 검증 파생
   (양방향 드리프트 원천 봉쇄, Q2-3 의사코드의 상위 버전)
2. `GlobalConfiguration`의 type 전환 (병합 사용처 0곳 확인됨)
3. 레이아웃 컴포넌트 경로(:780)만 defaultOptions 병합 누락 — 의도 여부 확인
4. Analytics 소비의 exhaustiveness 옵트인 (switch+never 또는 핸들러 테이블)

## 세션 02 출발 과제

- `componentRegistry.instantiate` 내부 확인 (defaultOptions 비대칭 검증)
- 코어 types.ts ↔ @quartz-community/types 사본 diff
- 플러그인 타입 계층 전체 지도 (S4 제네릭 판별 기준으로 팩토리 시그니처 평가)
- 예습: docs-ko 브랜치의 한글판 making plugins.md / creating components.md
