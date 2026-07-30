/**
 * Runbook Quiz #3 — 답안 파일
 * 문제: ./quiz.md
 * 실행: bun run curriculum/types/session-03-structural-typing/answer.ts
 * 검사: bunx tsc --noEmit  ← 이번 퀴즈의 핵심 검증은 이쪽
 *
 * "수정 금지" 표시된 블록은 건드리지 말 것.
 */

// ═══ Part A: branded type ═══════════════════════════════════════════════

// TODO: 아래 두 별명 타입을 branded type으로 재정의하라.
export type UserId = string;
export type OrderId = string;

// TODO: 생성 함수를 구현하라. 내부의 as 단언이 왜 정당한지 주석 한 줄 필수.
export function asUserId(raw: string): UserId {
  return raw;
}
export function asOrderId(raw: string): OrderId {
  return raw;
}

function cancelOrder(orderId: OrderId): string {
  return `cancelled:${orderId}`;
}

// ---- Part A 컴파일 타임 검증 (수정 금지) -------------------------------
const uid = asUserId("user-123");
const oid = asOrderId("order-456");

// @ts-expect-error — UserId는 OrderId 자리에 들어갈 수 없어야 한다
cancelOrder(uid);

// @ts-expect-error — 생 string도 OrderId 자리에 들어갈 수 없어야 한다
cancelOrder("order-789");
// ------------------------------------------------------------------------

// ═══ Part B: 선언 병합 ══════════════════════════════════════════════════

// ---- 외부 라이브러리 영역 (수정 금지 — node_modules라고 생각할 것) ----
interface AnalyticsEvent {
  name: string;
}
function track(event: AnalyticsEvent): AnalyticsEvent {
  return event;
}
// ------------------------------------------------------------------------

// TODO: 라이브러리 코드를 수정하지 않고 AnalyticsEvent에
// timestamp?: number 필드가 존재하게 만들어라.

// TODO: 서술형 답변을 주석으로 작성하라.
// Q1.
// Q2.

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

check("Part A: cancelOrder 정상 동작", cancelOrder(oid), "cancelled:order-456");
check("Part A: brand는 런타임에 존재하지 않는다 (그냥 string)", typeof uid, "string");

const evt = track({ name: "page_view", timestamp: 1234 });
check("Part B: name 유지", evt.name, "page_view");
check("Part B: timestamp 병합됨", evt.timestamp, 1234);

console.log(
  failed === 0
    ? "\n런타임 케이스 통과. bunx tsc --noEmit 까지 통과해야 제출 기준 충족."
    : `\n${failed}개 실패.`,
);
// ------------------------------------------------------------------------
