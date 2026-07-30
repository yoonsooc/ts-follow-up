/**
 * Runbook Quiz #4 — 답안 파일
 * 문제: ./quiz.md
 * 실행: bun run curriculum/types/session-04-generics-in-practice/answer.ts
 * 검사: bunx tsc --noEmit  (구현 전에는 실패하는 게 정상)
 *
 * "수정 금지" 표시된 블록은 건드리지 말 것.
 */

// ═══ Part A: 아무 일도 하지 않는 제네릭 ══════════════════════════════════

// TODO: 제네릭을 제거하고, 어떤 값이든 받을 수 있게 재작성하라.
export function formatLog(value: unknown): string {
  return `[LOG] ${JSON.stringify(value)}`;
}

// ---- Part A 검증 (수정 금지) -------------------------------------------
formatLog(null); // 어떤 값이든 받아야 한다
formatLog(undefined);
formatLog([1, 2, 3]);
// ------------------------------------------------------------------------

// ═══ Part B: 입력과 무관한 제약 ═════════════════════════════════════════

// TODO: key는 obj의 실제 키만, 반환 타입은 해당 프로퍼티 타입이 되게 고쳐라.
export function getProperty<T extends Record<string, any>, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// ---- Part B 검증 (수정 금지) -------------------------------------------
const config = { retries: 3, verbose: true };

// @ts-expect-error — 오타 키는 컴파일 에러여야 한다
getProperty(config, "retrys");

// @ts-expect-error — 반환 타입이 정확하다면 number는 string 자리에 못 들어간다
const wrongType: string = getProperty(config, "retries");
// ------------------------------------------------------------------------

// ═══ Part C: return-only 제네릭 — as를 함수로 포장한 것 ═════════════════

// TODO 1: 이 함수의 문제를 주석 1~2줄로 설명하라.
/*
  Generic 타입 T를 제거하고 unknown 타입을 반환하도록 하는 것과 차이가 없음
  오히려 T를 본문에서 사용하지 않고, parseJson을 호출할 때 generic 타입을 정의하게 되면 JSON.parse(text)결과와
  타입이 일치하지 않아 에러가 날 수 있음
*/
// export function parseJson<T>(text: string): T {
//   return JSON.parse(text);
// }
// TODO 2: 제네릭을 제거하고 unknown을 반환하게 수정하라.
export function parseJson(text: string): unknown {
  return JSON.parse(text);
}

interface ServerConfig {
  port: number;
  host: string;
}

// TODO 3: type guard를 구현하라 (Session 1의 수동 narrowing).
export function isServerConfig(value: unknown): value is ServerConfig {
  if (value !== null && typeof value === "object") {
    // const { port, host } = value as ServerConfig; -> '검증 전' 좁혀버리는 단언. 아래처럼 unknown으로 약한 단언을 사용하자.
    const { port, host } = value as { port?: unknown, host?: unknown};
    return typeof port === 'number' && typeof host === 'string'
  }
  return false
}

// ---- Part C 검증 (수정 금지) -------------------------------------------
// @ts-expect-error — 호출자가 타입 인자만으로 결과 타입을 조작할 수 없어야 한다
const forged: ServerConfig = parseJson<ServerConfig>('{"anything": true}');
// ------------------------------------------------------------------------

// ═══ Part D: 정당한 제네릭 ══════════════════════════════════════════════

// TODO: 구현하라. 빈 배열이면 fallback을 반환한다. `!` 단언 금지.
export function firstOrDefault<T>(arr: readonly T[], fallback: T): T {
  // return arr.length === 0 ? fallback : arr[0];
  //  => 에러) arr.length가 0이 아닌 것과, arr[0]이 undefined인 것의 상관관계를 타입 검사(tsc)에서는 고려하지 않는다
  for (const first of arr) return first
  return fallback

  // 아래는 동작은 하지만, undefined라는 값이 정상이어야 하는 경우에도 fallback을 반환시킴.
  // const first = arr[0];               // T | undefined
  // return first !== undefined ? first : fallback;  // 값 자체를 좁힘 → T
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

check("Part A: 문자열", formatLog("hi"), '[LOG] "hi"');
check("Part A: null도 받는다", formatLog(null), "[LOG] null");
check("Part B: 값 반환", getProperty(config, "retries"), 3);

const cfgRaw = parseJson('{"port":8080,"host":"localhost"}');
check("Part C: 유효한 설정 통과", isServerConfig(cfgRaw), true);
check("Part C: 가드 통과 후에만 접근", isServerConfig(cfgRaw) ? cfgRaw.port : -1, 8080);
check("Part C: 타입 불일치 거부", isServerConfig(parseJson('{"port":"8080","host":"x"}')), false);
check("Part C: null 거부", isServerConfig(null), false);
check("Part D: 첫 요소", firstOrDefault([1, 2, 3], 0), 1);
check("Part D: 빈 배열이면 fallback", firstOrDefault([] as string[], "none"), "none");

console.log(
  failed === 0
    ? "\n런타임 케이스 통과. bunx tsc --noEmit 까지 통과해야 제출 기준 충족."
    : `\n${failed}개 실패.`,
);
// ------------------------------------------------------------------------
