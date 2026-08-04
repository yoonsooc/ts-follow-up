# Runbook Quiz #5 — 런타임 방어선 구축 (Zod)

## [상황 부여]

Session 1의 그 설정 코드가 돌아왔다. 이번엔 요구사항이 자랐다: `features` 배열이
추가됐고, `fontSize`는 8~32 정수만 유효하며, 설정은 API 응답 봉투(envelope)로도
내려온다:

```jsonc
{ "status": "ok", "data": { "theme": "dark", "fontSize": 16, "features": ["beta"] } }
// 또는
{ "status": "error", "message": "quota exceeded" }
```

Session 1처럼 수동 가드로 막으려니 필드마다 typeof 사다리가 자라나고,
Session 4에서 확인했듯 타입 정의와 검증 로직이 서로 드리프트한다.
이제 Zod로 단일 진실 공급원을 세울 때다.

## [요구사항]

`answer.ts`에 작성하라. **수동 `interface`/`type` 선언 금지 — 모든 타입은
스키마에서 `z.infer`로 파생시킬 것.** (`ConfigResult`는 스캐폴드 제공)

1. **Part A — 스키마와 파생 타입**
   `AppConfigSchema`: `theme`은 `"dark" | "light"`, `fontSize`는 8~32 범위의
   정수, `features`는 문자열 배열. `AppConfig`는 `z.infer`로 파생.
2. **Part B — `loadConfig(raw: string | null): AppConfig`**
   JSON 깨짐 / null / 스키마 불일치 → `DEFAULT_CONFIG` 반환.
   스키마 검증에는 **`safeParse`만 사용** (`parse` + try/catch 금지 —
   Session 4에서 결론 낸 "검증기는 throw하지 않는 총함수" 원칙).
   단, `JSON.parse`의 throw 격리는 예외적으로 try/catch 허용.
3. **Part C — API 봉투**
   `ApiResponseSchema`를 **`z.discriminatedUnion("status", [...])`**으로 정의
   (ok면 `data`에 AppConfigSchema 중첩, error면 `message: string`).
   `handleResponse(payload: unknown): ConfigResult`를 구현:
   - `status: "ok"` + 유효한 data → `{ ok: true, config }`
   - `status: "error"` → `{ ok: false, reason: message }`
   - 그 외 전부 (이상한 status, ok인데 깨진 data 등) → `{ ok: false, reason: 자유 }`
4. **서술형 (주석으로)**
   - Q1. `safeParse`의 반환 타입은 Rust의 `Result<T, E>`와 어떤 점이 같고,
     어떤 점이 다른가? (힌트: 소비하는 문법)
   - Q2. Session 4의 수동 type guard 대비, "타입-검증 드리프트"가 왜 구조적으로
     불가능해졌는지 한 줄로 설명하라.

제출: `answer.ts` 작성 후 튜터에게 리뷰 요청.
검증: `bun run curriculum/types/session-05-runtime-validation/answer.ts` + `bunx tsc --noEmit`
