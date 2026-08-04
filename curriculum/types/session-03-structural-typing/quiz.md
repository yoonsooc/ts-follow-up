# Runbook Quiz #3 — 구조적 타이핑의 이해 (interface 선언 병합 vs type)

## [상황 부여]

**Part A.** 결제 서비스에서 사고가 났다. `UserId`와 `OrderId`를 각각 타입으로
선언해뒀는데도, 유저 ID가 주문 취소 API에 그대로 들어가서 엉뚱한 주문이
취소되었다. AI가 생성했던 코드는 이렇다:

```typescript
type UserId = string;
type OrderId = string;

function cancelOrder(orderId: OrderId) { /* ... */ }

const userId: UserId = "user-123";
cancelOrder(userId); // 컴파일 통과. TS는 아무 불만이 없다.
```

**Part B.** 외부 분석 라이브러리의 `AnalyticsEvent` 타입에는 `name` 필드만
있다. 우리 서비스는 모든 이벤트에 `timestamp`를 실어 보내야 하는데,
`node_modules` 안의 라이브러리 코드는 수정할 수 없다.

## [요구사항]

`answer.ts`에 작성하라.

### Part A — branded type

1. `UserId`와 `OrderId`를 **branded type**으로 재정의하여, 서로(그리고 생
   `string`과) 혼용하면 컴파일 에러가 나게 만들 것
2. 생성 함수 `asUserId(raw: string): UserId`, `asOrderId(raw: string): OrderId`를
   구현할 것 — 이 함수 내부의 `as` 단언이 왜 정당한 사용인지 주석으로 한 줄 설명할 것
3. 스캐폴드의 `@ts-expect-error` 검증 블록(수정 금지)이 통과해야 한다:
   구현 전에는 "에러가 나야 하는데 안 났다"(TS2578)로 tsc가 실패한다

### Part B — 선언 병합

4. "라이브러리 영역"(수정 금지)의 `interface AnalyticsEvent`에 필드
   `timestamp?: number`가 존재하도록, **라이브러리 코드를 건드리지 않고**
   같은 이름의 interface를 추가 선언하여 병합시킬 것
5. 아래 서술형 질문 두 개에 answer.ts 주석으로 답할 것 (리뷰에서 확인)
   - Q1. 라이브러리가 `type AnalyticsEvent = { name: string }`으로 선언했다면
     같은 방법이 가능한가? 왜 그런가?
   - Q2. 선언 병합이 실무에서 **위험**해지는 상황을 하나 들어 설명하라.

제출: `answer.ts` 작성 후 튜터에게 리뷰 요청.
검증: `bun run curriculum/types/session-03-structural-typing/answer.ts`
     + `bunx tsc --noEmit` (이번 퀴즈의 핵심 검증은 tsc 쪽이다)
