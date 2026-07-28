/**
 * Runbook Quiz #1 — 답안 파일
 * 문제: ./quiz.md
 * 실행: bun run curriculum/types/session-01-escape-hatches/answer.ts
 *
 * Bun에는 localStorage가 없으므로 아래 스텁을 사용한다.
 * 스텁과 테스트 러너는 수정하지 말고, loadConfig만 리팩토링할 것.
 */

// ---- 스텁 (수정 금지) -------------------------------------------------
const storage = new Map<string, string>();
const localStorage = {
  getItem: (key: string): string | null => storage.get(key) ?? null,
  setItem: (key: string, value: string): void => void storage.set(key, value),
  removeItem: (key: string): void => void storage.delete(key),
};
// ----------------------------------------------------------------------

interface Config {
  theme: "dark" | "light";
  fontSize: number;
}

// TODO: 여기를 리팩토링하라. (as, ! 사용 금지 / unknown + 수동 narrowing)
function loadConfig(): Config {
  const raw = localStorage.getItem("app-config");
  return JSON.parse(raw!) as Config;
}

// ---- 테스트 러너 (수정 금지) -------------------------------------------
const DEFAULT: Config = { theme: "light", fontSize: 14 };

const cases: Array<{ name: string; setup: () => void; expected: Config }> = [
  {
    name: "정상 값",
    setup: () => localStorage.setItem("app-config", JSON.stringify({ theme: "dark", fontSize: 18 })),
    expected: { theme: "dark", fontSize: 18 },
  },
  {
    name: "항목 없음 (null)",
    setup: () => localStorage.removeItem("app-config"),
    expected: DEFAULT,
  },
  {
    name: "JSON 깨짐",
    setup: () => localStorage.setItem("app-config", "{oops"),
    expected: DEFAULT,
  },
  {
    name: "스키마 불일치 (서버 에러 응답이 저장됨)",
    setup: () => localStorage.setItem("app-config", JSON.stringify({ error: "rate_limited" })),
    expected: DEFAULT,
  },
  {
    name: "fontSize가 문자열",
    setup: () => localStorage.setItem("app-config", JSON.stringify({ theme: "dark", fontSize: "18" })),
    expected: DEFAULT,
  },
  {
    name: "[보너스] theme이 유효하지 않은 문자열",
    setup: () => localStorage.setItem("app-config", JSON.stringify({ theme: "blue", fontSize: 18 })),
    expected: DEFAULT,
  },
];

let failed = 0;
for (const c of cases) {
  c.setup();
  let actual: Config | undefined;
  let threw: unknown;
  try {
    actual = loadConfig();
  } catch (e) {
    threw = e;
  }
  const pass =
    actual != null &&
    typeof actual === "object" &&
    actual.theme === c.expected.theme &&
    actual.fontSize === c.expected.fontSize;
  if (pass) {
    console.log(`✅ ${c.name}`);
  } else {
    failed++;
    console.log(`❌ ${c.name} — expected ${JSON.stringify(c.expected)}, got ${threw ? `throw: ${threw}` : JSON.stringify(actual)}`);
  }
}
console.log(failed === 0 ? "\n모든 케이스 통과. 튜터에게 리뷰를 요청하라." : `\n${failed}개 실패.`);
// ----------------------------------------------------------------------
