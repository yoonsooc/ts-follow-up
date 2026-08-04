// [스냅샷] 최초 생성된 퀴즈 스캐폴드 원본 (tsc 검사 제외 대상)
/**
 * Runbook Quiz #5 — 답안 파일
 * 문제: ./quiz.md
 * 실행: bun run curriculum/types/session-05-runtime-validation/answer.ts
 * 검사: bunx tsc --noEmit  (구현 전에는 실패하는 게 정상)
 *
 * "수정 금지" 표시된 블록은 건드리지 말 것.
 */
import { z } from "zod";

// ═══ Part A: 스키마 = 단일 진실 공급원 ══════════════════════════════════

// TODO: theme("dark"|"light"), fontSize(8~32 정수), features(string[])
export const AppConfigSchema = z.object({});

// 타입은 선언하지 않는다 — 스키마에서 파생시킨다.
export type AppConfig = z.infer<typeof AppConfigSchema>;

// ---- 수정 금지: 스키마가 올바르면 이 기본값이 컴파일된다 ----------------
export const DEFAULT_CONFIG: AppConfig = { theme: "light", fontSize: 14, features: [] };
// ------------------------------------------------------------------------

// ═══ Part B: loadConfig ═════════════════════════════════════════════════

// TODO: JSON 깨짐 / null / 스키마 불일치 → DEFAULT_CONFIG.
//  스키마 검증은 safeParse만. (JSON.parse의 throw 격리에만 try/catch 허용)
export function loadConfig(raw: string | null): AppConfig {
  return DEFAULT_CONFIG;
}

// ═══ Part C: API 봉투 (discriminated union) ═════════════════════════════

// TODO: z.discriminatedUnion("status", [...])
export const ApiResponseSchema = z.object({});
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// ---- 수정 금지: 결과 타입 (직접 만든 미니 Result) ----------------------
export type ConfigResult =
  | { readonly ok: true; readonly config: AppConfig }
  | { readonly ok: false; readonly reason: string };
// ------------------------------------------------------------------------

// TODO: safeParse로 payload를 판정해 ConfigResult로 변환하라.
export function handleResponse(payload: unknown): ConfigResult {
  return { ok: false, reason: "TODO" };
}

// TODO: 서술형 답변
// Q1.
// Q2.

// ---- 테스트 러너 (수정 금지) -------------------------------------------
let failed = 0;
function check(name: string, actual: unknown, expected: unknown): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`✅ ${name}`);
  } else {
    failed++;
    console.log(`❌ ${name} — expected ${e}, got ${a}`);
  }
}

const VALID = { theme: "dark", fontSize: 16, features: ["beta"] };

check("B: 정상 설정", loadConfig(JSON.stringify(VALID)), VALID);
check("B: null → 기본값", loadConfig(null), DEFAULT_CONFIG);
check("B: JSON 깨짐 → 기본값", loadConfig("{oops"), DEFAULT_CONFIG);
check("B: 잘못된 theme → 기본값", loadConfig('{"theme":"blue","fontSize":16,"features":[]}'), DEFAULT_CONFIG);
check("B: 문자열 fontSize → 기본값", loadConfig('{"theme":"dark","fontSize":"16","features":[]}'), DEFAULT_CONFIG);
check("B: 범위 밖 fontSize → 기본값", loadConfig('{"theme":"dark","fontSize":7,"features":[]}'), DEFAULT_CONFIG);
check("B: 소수 fontSize → 기본값", loadConfig('{"theme":"dark","fontSize":16.5,"features":[]}'), DEFAULT_CONFIG);
check("B: 오염된 features → 기본값", loadConfig('{"theme":"dark","fontSize":16,"features":["a",1]}'), DEFAULT_CONFIG);

const okRes = handleResponse({ status: "ok", data: VALID });
check("C: ok 봉투 → config 추출", okRes.ok ? okRes.config : null, VALID);
const errRes = handleResponse({ status: "error", message: "quota exceeded" });
check("C: error 봉투 → message가 reason", errRes.ok ? "?" : errRes.reason, "quota exceeded");
check("C: ok인데 깨진 data → 실패", handleResponse({ status: "ok", data: { theme: "blue" } }).ok, false);
check("C: 정체불명 status → 실패", handleResponse({ status: "loading" }).ok, false);
check("C: 봉투 자체가 쓰레기 → 실패", handleResponse("<!DOCTYPE html>").ok, false);

console.log(
  failed === 0
    ? "\n런타임 케이스 통과. bunx tsc --noEmit 까지 통과해야 제출 기준 충족."
    : `\n${failed}개 실패.`,
);
// ------------------------------------------------------------------------
