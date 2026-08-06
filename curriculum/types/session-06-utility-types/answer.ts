/**
 * Runbook Quiz #6 — 답안 파일
 * 문제: ./quiz.md
 * 실행: bun run curriculum/types/session-06-utility-types/answer.ts
 * 검사: bunx tsc --noEmit  (구현 전에는 실패하는 게 정상)
 *
 * "수정 금지" 표시된 블록은 건드리지 말 것.
 */


// ---- 원본 모델 (수정 금지 — 단일 진실 공급원) ---------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: number;
}
// ------------------------------------------------------------------------

// ═══ Part A: 손으로 쓴 사본 → 파생 타입 ═════════════════════════════════

// TODO: User에서 파생시켜 재정의하라. (interface 선언을 유지할 수 없을 것이다 — 왜인지 생각해볼 것)
// export interface PublicUser {
//   id: string;
//   name: string;
//   email: string;
// }
// export interface UserPatch {
//   name?: string;
//   email?: string;
// }
type PublicUser = Omit<User, "password">
type UserPatch = Readonly<Partial<Omit<User, "id" | "createdAt">>>

// ---- Part A 검증 (수정 금지) -------------------------------------------
// 컴파일 타임 검증은 호출되지 않는 함수 안에 격리한다
// (타입 세계의 값을 런타임 코드가 참조하면 ReferenceError — 두 세계는 분리되어 있다)
function _partACheck(pub: PublicUser): void {
  const _driftFixed: number = pub.createdAt; // 손 사본이 누락했던 필드가 복구되어야 한다
  // @ts-expect-error — PublicUser에 password는 없어야 한다
  pub.password;
}

const okPatch: UserPatch = { password: "new-hash" }; // password 변경은 patch의 정당한 용도
// @ts-expect-error — id는 불변이어야 한다
const badPatch: UserPatch = { id: "u-2" };
// @ts-expect-error — createdAt도 불변이어야 한다
const badPatch2: UserPatch = { createdAt: 0 };
// ------------------------------------------------------------------------

// ═══ Part B: 남의 함수에서 타입 추출 ════════════════════════════════════

// ---- 외부 SDK 영역 (수정 금지 — 반환 타입을 export해주지 않는다) --------
async function fetchUserFromApi(id: string, opts?: { timeout: number }) {
  return {
    user: { id, name: "yoonsoo", email: "y@example.com", password: "hash", createdAt: 1700000000 } satisfies User,
    fetchedAt: 1700000001,
  };
}
// ------------------------------------------------------------------------

// TODO: 유틸리티 타입으로 추출하라.
// export type FetchResult = unknown; // Awaited + ReturnType
export type FetchResult = Awaited<ReturnType<typeof fetchUserFromApi>>
// export type FetchArgs = unknown[]; // Parameters
export type FetchArgs = Parameters<typeof fetchUserFromApi>

// TODO: 인자를 그대로 전달하는 캐시 래퍼. 같은 인자로 두 번 부르면 fetch는 한 번만.
const cache = new Map<string, FetchResult>();
export async function cachedFetchUser(...args: FetchArgs): Promise<FetchResult> {
  // return undefined as never; // TODO
  const id = args[0]
  // if (id && cache.has(id)) { // 잘못된 표현 -> 빈 문자열 ""가 falsy로 걸러져서 캐시를 우회하게 됨.
    /* 
      조건문에서 has(id) 검사를 했음에도 불구하고 cache.get(id)의 결과 타입에서 ts 컴파일러는 undefined를 제외하지 않는다.
       즉 narrowing은 검사를 수행한 표현식 범위에만 해당되고 그 다음 표현식과 의미적 연결을 이루어주지 않음.
       마치 arr.length === 0 조건문 검사가 arr[0] !== undefined를 보장하지 않듯이)
    */
    //return cache.get(id) as never // -> 컴파일을 통과하게 하여 실제 검사를 무력화하는 단언...
  // }
  const cached = cache.get(id)
  if (cached !== undefined) { // 타입 검사에서 즉시 값 비교로 좁힘 
    return cached
  }
  const fetchResult = await fetchUserFromApi(...args)
  // 여기서는 id값 캐시 키로 사용, 즉 opts.timeout 이 달라도 같은 캐시를 반환한다.
  // timeout 값까지 포함시키려면 키에 인자 전체를 직렬화시킬 수 있음

  // Q) 키 타입으로 FetchArgs를 사용할 수는 없는지?
  // Map의 키 비교는 SameValueZero(참조동등성) 방식으로, 배열 값이 같아도 서로 다른 객체면 다른 키이다.
  // 현재 함수(cachedFetchUser)는 호출될 때마다 새 args 배열을 받으므로, 구조적으로 캐시 조회가 성립할 수 없음
  // FetchArgs 라는 타입으로 키의 모양에만 제약을 걸고 값 기반 동등성을 가진 string으로 직렬화하여 키 비교를 수행하는 것.
  cache.set(id, fetchResult)
  return fetchResult
}

// ---- Part B 검증 (수정 금지) -------------------------------------------
function _partBCheck(fr: FetchResult): void {
  const _frUser: User = fr.user;
  const _frAt: number = fr.fetchedAt;
}

const goodArgs: FetchArgs = ["u-1", { timeout: 1000 }];
const goodArgs2: FetchArgs = ["u-1"]; // opts는 optional
// @ts-expect-error — 첫 인자는 string이어야 한다
const badArgs: FetchArgs = [42];
// ------------------------------------------------------------------------

// ═══ Part C: 유니언에서 파생 ════════════════════════════════════════════

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "CANCELLED" | "REFUNDED";

// TODO: Extract / Exclude로 파생하라.
// export type FinishedStatus = unknown;
export type FinishedStatus = Extract<OrderStatus, "CANCELLED" | "REFUNDED">
// export type ActiveStatus = unknown;
export type ActiveStatus = Exclude<OrderStatus, FinishedStatus>

// ---- Part C 검증 (수정 금지) -------------------------------------------
const fin: FinishedStatus = "REFUNDED";
// @ts-expect-error — 진행 중 상태는 Finished가 아니다
const badFin: FinishedStatus = "PAID";
const act: ActiveStatus = "PENDING";
// @ts-expect-error — 종결 상태는 Active가 아니다
const badAct: ActiveStatus = "CANCELLED";
// ------------------------------------------------------------------------

// ═══ Part D: 타입은 지워진다, 값은 남는다 ═══════════════════════════════

// TODO: as 금지. 반환된 "런타임 객체"에도 password 키가 없어야 한다.
// 함정: return user; 는 컴파일된다 — 왜 컴파일되는지, 왜 그래도 틀렸는지 주석으로 설명하라.
export function toPublicUser(user: User): PublicUser {
  // return { id: user.id, name: user.name, email: user.email }; // TODO
  const { password, ...rest } = user
  return rest  
  // return user; 가 컴파일되는 이유는 ts는 구조적 타이핑을 사용하므로 User타입 user는 PublicUser에서 검사하는
  // 필드 목록을 전부 갖고 있으므로 타입 검사에서 걸러지지 않음.
  // 그리고 이 함수가 PublicUser를 반환하지만 user의 값 자체를 바꾸지 않기 않기 때문에 password 필드를 그대로 유지한 채로 값이 반환된다.
}

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

const SECRET_USER: User = {
  id: "u-1", name: "yoonsoo", email: "y@example.com", password: "super-secret-hash", createdAt: 1700000000,
};

const pubUser = toPublicUser(SECRET_USER);
check("D: password가 런타임 객체에서도 제거됨", "password" in pubUser, false);
check("D: createdAt은 유지됨", (pubUser as { createdAt?: unknown }).createdAt, 1700000000);
check("D: 직렬화해도 유출 없음", JSON.stringify(pubUser).includes("super-secret"), false);

const r1 = await cachedFetchUser("u-9", { timeout: 500 });
const r2 = await cachedFetchUser("u-9", { timeout: 500 });
check("B: 래퍼가 인자를 그대로 전달", (r1 as { user?: User } | undefined)?.user?.id, "u-9");
check("B: 같은 인자는 캐시에서 (동일 참조)", r1 !== undefined && r1 === r2, true);

console.log(
  failed === 0
    ? "\n런타임 케이스 통과. bunx tsc --noEmit 까지 통과해야 제출 기준 충족."
    : `\n${failed}개 실패.`,
);
// ------------------------------------------------------------------------
