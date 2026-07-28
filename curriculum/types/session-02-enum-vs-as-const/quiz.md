# Runbook Quiz #2 — TS의 런타임 개입과 부작용 (enum vs as const)

## [상황 부여]

AI가 생성한 주문 상태 코드가 레거시로 굴러다닌다. 두 가지 버그가 보고되었다:
(1) 결제 대기(Pending) 주문에서 "주문 처리" 버튼이 비활성화된다.
(2) 서버 API는 `"PENDING"` 같은 문자열 상태를 기대하는데 숫자가 전송되어 400이 떨어진다.

```typescript
enum OrderStatus {
  Pending,    // 0
  Paid,       // 1
  Shipped,    // 2
  Cancelled,  // 3
}

function isActionable(status: OrderStatus): boolean {
  if (!status) return false; // (1)의 원인
  return status !== OrderStatus.Cancelled;
}

function toApiPayload(status: OrderStatus) {
  return { status }; // (2)의 원인: { status: 0 }이 전송됨
}
```

## [요구사항]

`answer.ts`에 리팩토링하라.

1. `enum`을 **완전히 제거**하고, `as const` 객체 + 파생 유니언 타입으로 대체할 것.
   서버 계약에 맞게 값은 `"PENDING" | "PAID" | "SHIPPED" | "CANCELLED"` 문자열이어야 한다.
2. `isActionable`의 falsy 버그를 수정할 것 (Cancelled만 false)
3. `statusLabel(status)` 함수를 `switch`로 작성하되, **`never`를 이용한
   exhaustiveness check**를 포함할 것 — 나중에 상태가 하나 추가되면
   런타임이 아니라 **컴파일 타임에** 에러가 나야 한다.
   라벨: 결제 대기 / 결제 완료 / 배송 중 / 취소됨
4. 보너스: 외부 입력(예: URL 쿼리스트링)을 검증하는 type guard
   `isOrderStatus(value: unknown): value is OrderStatus`를 작성할 것.
   상태 목록을 하드코딩으로 나열하지 말고 `as const` 객체에서 파생시킬 것.

제출: `answer.ts` 작성 후 튜터에게 리뷰 요청.
검증: `bun run curriculum/types/session-02-enum-vs-as-const/answer.ts`
     + `bunx tsc --noEmit` (Session 1에서 배웠듯 bun은 타입 검사를 하지 않는다)
