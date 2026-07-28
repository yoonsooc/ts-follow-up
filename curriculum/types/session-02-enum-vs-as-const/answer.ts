/**
 * Runbook Quiz #2 — 답안 파일
 * 문제: ./quiz.md
 * 실행: bun run curriculum/types/session-02-enum-vs-as-const/answer.ts
 * 검사: bunx tsc --noEmit
 *
 * 아래 레거시 코드를 요구사항에 맞게 리팩토링할 것.
 * 테스트 러너는 수정하지 말 것.
 */

// ---- 여기부터 리팩토링 --------------------------------------------------

const OrderStatus = {
  Pending: "PENDING",
  Paid: "PAID",
  Shipped: "SHIPPED",
  Cancelled: "CANCELLED",
} as const;


export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// 아래는 이제 불필요(기존 OrderStatusEnum을 OrderStatus로 개명)
// export const OrderStatus = {
//   Pending: "PENDING",
//   Paid: "PAID",
//   Shipped: "SHIPPED",
//   Cancelled: "CANCELLED",
// } satisfies Record<string, OrderStatus>; // TODO: 이 줄도 as const 방식으로 재구성 가능

export function isActionable(status: OrderStatus): boolean {
  // return true; // TODO
  return OrderStatus.Cancelled !== status;
}

export function statusLabel(status: OrderStatus): string {
  // return ""; // TODO: switch + never exhaustiveness check
  switch (status) {
    case OrderStatus.Pending:
      return "결제 대기";
    case OrderStatus.Paid:
      return "결제 완료";
    case OrderStatus.Shipped:
      return "배송 중";
    case OrderStatus.Cancelled:
      return "취소됨";
    default:
      const _exhaustiveCheck: never = status;
      return _exhaustiveCheck;
  }
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  // return false; // TODO (보너스)
  return typeof value === "string" && (Object.values(OrderStatus) as readonly string[]).includes(value);
  // return typeof value === "string" && new Set<string>(Object.values(OrderStatus)).has(value);
  // return typeof value === "string" && Object.values(OrderStatus).some(v => v === value);
}

// ---- 테스트 러너 (수정 금지) -------------------------------------------
let failed = 0;
function check(name: string, actual: unknown, expected: unknown): void {
  if (Object.is(actual, expected)) {
    console.log(`✅ ${name}`);
  } else {
    failed++;
    console.log(`❌ ${name} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

check("서버 계약: Pending은 문자열 'PENDING'", OrderStatus.Pending, "PENDING");
check("Pending 주문은 처리 가능 (falsy 버그 수정)", isActionable(OrderStatus.Pending), true);
check("Paid 주문은 처리 가능", isActionable(OrderStatus.Paid), true);
check("Shipped 주문은 처리 가능 (명세: Cancelled만 불가)", isActionable(OrderStatus.Shipped), true);
check("Cancelled 주문은 처리 불가", isActionable(OrderStatus.Cancelled), false);
check("라벨: Pending", statusLabel(OrderStatus.Pending), "결제 대기");
check("라벨: Paid", statusLabel(OrderStatus.Paid), "결제 완료");
check("라벨: Shipped", statusLabel(OrderStatus.Shipped), "배송 중");
check("라벨: Cancelled", statusLabel(OrderStatus.Cancelled), "취소됨");
check("[보너스] 유효한 상태 문자열", isOrderStatus("SHIPPED"), true);
check("[보너스] 무효한 상태 문자열", isOrderStatus("REFUNDED"), false);
check("[보너스] 문자열 아님", isOrderStatus(2), false);

console.log(
  failed === 0
    ? "\n모든 케이스 통과. bunx tsc --noEmit 까지 확인한 뒤 튜터에게 리뷰를 요청하라."
    : `\n${failed}개 실패.`,
);
// ----------------------------------------------------------------------
