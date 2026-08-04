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
export type UserId = string & { readonly __brand: unique symbol };
export type OrderId = string & { readonly __brand: unique symbol };

// TODO: 생성 함수를 구현하라. 내부의 as 단언이 왜 정당한지 주석 한 줄 필수.
/*
as 단언의 정당성
1. __brand는 런타임에 실제로 사용하지 않는 가상의 표식(필드), 아무도 읽지 않으므로 꺠질 코드가 없음
2. as UserId 라는 단언이 거짓일 지언정, 아래 생성 함수라는 통제된 경계에만 '격리'되어있음
  1) 런타임  
  : 컴파일 과정에서 타입 단언(as UserId)는 사라지게 되어 있다(as 는 Runtime no-op). 즉, `return raw` 만 남음
  2) 타입
  : 그러나 컴파일러는 장부에 UserId, OrderId 타입의 __brand 유니크 필드를 기록하고 있기 때문에, 
    컴파일 시점에서 **두 타입이 충돌(ex. UserId 위치에 OrderId가 올 경우)하는 것을 걸러낼 수 있다.**
  
  그렇다면 raw(__brand가 없는 string)을 인자로 전달하여 생성하는 아래 uid(line 42) 변수는 uid.__brand를 갖게 될까?
  No. 결과는 Undefined이다. -> **타입 쳬계와 런타임 동작이 다른 부분이 존재한다.**
  그러나 전체 코드에서 __brand를 실제로 사용하는 비즈니스 로직이 없기 때문에 안전하다.
  즉, 타입 충돌을 걸러내기 위해 컴파일러 호환성 판정에만 참여하는 일종의 '표식' 이다.
*/
export function asUserId(raw: string): UserId {
  return raw as UserId;
}
export function asOrderId(raw: string): OrderId {
  return raw as OrderId;
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
interface AnalyticsEvent {
  timestamp?: number;
}

// TODO: 서술형 답변을 주석으로 작성하라.
// Q1. type은 같은 스코프에서 중복 선언을 허용하지 않기 때문에 불가능
// Q2. 프로젝트의 다른 엔지니어가 created: Date 필드를 갖는 AnalyticsEvent를 선언했다.
//  기존에 AnalyticsEvent 인터페이스 구조를 따르는 객체 선언에서 에러가 발생한다.

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
