# Session 01 리뷰 — 타입 시스템의 구멍과 회피

**판정: ✅ 통과** (보너스 포함 6/6 케이스, `tsc --noEmit` 통과)

## 잘한 것

- 경계에서 들어온 값(`JSON.parse`)을 `unknown`으로 받고, 컴파일러가 강제하는 narrowing을 끝까지 수행함
- `as { theme?: unknown; fontSize?: unknown }` — 값을 `unknown`으로 유지하는 **약한 단언**이라 모든 객체가 만족하며 틀릴 수 없고, 이후 검증 의무가 소멸하지 않음
- `theme`을 `typeof theme === "string"`이 아니라 리터럴 동등 비교(`=== "dark" || === "light"`)로 검사 — union 리터럴 타입까지 정확히 좁혀서 보너스 요건 충족
- 깨진 JSON을 try/catch로, 항목 없음을 null 체크로 각각 분리 처리

## 지적된 실수 (수정 완료)

1. **`defaultConfig`에 표기 대신 단언 사용** — `{ ... } as Config`는 "검사하지 말라"이고, `const c: Config = { ... }`는 "검사해달라"로 방향이 정반대. `{} as Config`는 컴파일되지만 `const c: Config = {}`는 에러다. 리터럴 + `as`는 AI 생성 코드의 단골 안티패턴이므로 코드 리뷰에서 반려할 것.
2. **`localStorage.getItem` 반환을 `as unknown`으로 넓힘** — 반환 타입은 이미 `string | null`로 정확하다. 불필요하게 넓히면 정보를 버리고, 그 탓에 도달 불가능한 `typeof raw !== "string"` 분기(죽은 코드)가 생겼다. `unknown`은 타입 시스템이 진짜 모르는 곳(`any` 반환)에만 쓴다.

## 세션 중 나온 질문과 답 (추가 수확)

- **Q. narrowing 전에 `as Config`를 쓰면 뭐가 다른가?**
  런타임 차이는 0 (둘 다 지워짐). 차이는 컴파일러가 이후 검증을 강제하는가이다. `as Config`는 "검증 완료" 주장이라 검증 코드를 지워도 조용히 컴파일되고, 실험 결과 런타임 케이스 3개가 실패했다. **`as`의 위험도는 단언이 주장하는 정보량에 비례한다**: `as unknown`(주장 없음, 안전) < `as { x?: unknown }`(객체 수준, 사실상 안전) < `as Config`(검증 완료 주장, 위험).
- **Q. fontSize 검사를 지워도 에러가 안 나던데?**
  난다 — `tsc`에서만 (`TS2322: unknown is not assignable to number`). **`bun run`(esbuild/swc/Vite 동일)은 타입을 벗겨내기만 하고 검사하지 않는다.** 타입 검사는 `bunx tsc --noEmit`으로 별도 강제해야 하며, CI에 이 단계가 없으면 타입 게이트는 사실상 없는 것이다.
- 덤: `JSON.parse(raw!)`에서 `raw`가 `null`이면 throw가 아니라 `"null"` 문자열로 강제변환되어 **`null`이 조용히 반환**된다. `!` 단언이 런타임에 아무것도 못 막는 산 증거.

## 기억할 원칙

- 경계(fetch, JSON.parse, localStorage, env, 사용자 입력)에서 오는 모든 값은 `unknown`이다.
- 표기(`: T`)는 검사 요청, 단언(`as T`)은 검사 거부. 기본은 표기.
- `as unknown as X`는 Rust의 `transmute`와 동급 — 무조건 반려.
- 실행기와 검사기는 분리되어 있다. 검사기를 돌리지 않으면 TS는 주석이다.
