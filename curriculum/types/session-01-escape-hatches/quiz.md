# Runbook Quiz #1 — 타입 시스템의 구멍과 회피

## [상황 부여]

AI가 생성한 아래 코드가 프로덕션에 배포되었다. 서버 응답이 가끔
`{ "error": "rate_limited" }` 형태로 오는데, 그때마다 프론트가 백화(white screen)된다.

```typescript
interface Config {
  theme: "dark" | "light";
  fontSize: number;
}

function loadConfig(): Config {
  const raw = localStorage.getItem("app-config");
  return JSON.parse(raw!) as Config;
}

const config = loadConfig();
document.body.style.fontSize = `${config.fontSize.toFixed(0)}px`;
```

## [요구사항]

`loadConfig`를 `answer.ts`에 리팩토링하라.

1. `as Config` 단언과 `!` 단언을 **모두 제거**할 것
2. `JSON.parse`의 결과를 `unknown`으로 받고, **수동 narrowing**(type guard)으로
   `Config` 여부를 검증할 것 (Zod는 아직 금지 — 고통을 먼저 느껴야 한다)
3. 검증 실패 시(항목 없음, JSON 깨짐, 스키마 불일치) 안전한 기본값
   `{ theme: "light", fontSize: 14 }`를 반환할 것
4. 보너스: `theme`이 정확히 `"dark" | "light"` 중 하나인지도 검증하면 가산점

제출: `answer.ts` 작성 후 튜터에게 리뷰 요청.
검증: `bun run curriculum/types/session-01-escape-hatches/answer.ts`
