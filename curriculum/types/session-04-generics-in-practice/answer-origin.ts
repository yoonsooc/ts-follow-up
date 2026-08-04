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
export function formatLog<T extends Record<string, any> | string | number>(value: T): string {
  return `[LOG] ${JSON.stringify(value)}`;
}

// ---- Part A 검증 (수정 금지) -------------------------------------------
formatLog(null); // 어떤 값이든 받아야 한다
formatLog(undefined);
formatLog([1, 2, 3]);
// ------------------------------------------------------------------------

// ═══ Part B: 입력과 무관한 제약 ═════════════════════════════════════════

// TODO: key는 obj의 실제 키만, 반환 타입은 해당 프로퍼티 타입이 되게 고쳐라.
export function getProperty<T extends Record<string, any>, K extends string>(obj: T, key: K): any {
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
// TODO 2: 제네릭을 제거하고 unknown을 반환하게 수정하라.
export function parseJson<T>(text: string): T {
  return JSON.parse(text);
}

interface ServerConfig {
  port: number;
  host: string;
}

// TODO 3: type guard를 구현하라 (Session 1의 수동 narrowing).
export function isServerConfig(value: unknown): value is ServerConfig {
  return false;
}

// ---- Part C 검증 (수정 금지) -------------------------------------------
// @ts-expect-error — 호출자가 타입 인자만으로 결과 타입을 조작할 수 없어야 한다
const forged: ServerConfig = parseJson<ServerConfig>('{"anything": true}');
// ------------------------------------------------------------------------

// ═══ Part D: 정당한 제네릭 ══════════════════════════════════════════════

// TODO: 구현하라. 빈 배열이면 fallback을 반환한다. `!` 단언 금지.
export function firstOrDefault<T>(arr: readonly T[], fallback: T): T {
  return fallback;
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
