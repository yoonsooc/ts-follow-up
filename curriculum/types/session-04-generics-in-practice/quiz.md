# Runbook Quiz #4 — 제네릭의 실용적 통제 (오버엔지니어링 방지)

## [상황 부여]

AI에게 "유틸리티 함수 만들어줘"라고 시킨 결과물이 코드베이스에 쌓였다.
전부 제네릭으로 화려하게 장식돼 있지만 — 셋 중 둘은 제네릭이 아무 일도
하지 않거나, 오히려 타입 안전을 **해치고** 있다.

```typescript
// 1. 제약만 요란하고 타입 파라미터가 하는 일이 없다
function formatLog<T extends Record<string, any> | string | number>(value: T): string { ... }

// 2. key가 obj와 무관하다 — 오타 키도 통과하고 반환은 any
function getProperty<T extends Record<string, any>, K extends string>(obj: T, key: K): any { ... }

// 3. return-only 제네릭 — 호출자가 타입을 "선언"하면 그대로 믿는다
function parseJson<T>(text: string): T { ... }
```

## [요구사항]

`answer.ts`에 작성하라. 스캐폴드의 검증 블록(수정 금지)이 컴파일 게이트다.

1. **Part A** — `formatLog`의 제네릭을 제거하고 어떤 값이든 받게 재작성할 것
   (힌트: Session 1 — "모르는 값"의 올바른 타입)
2. **Part B** — `getProperty`를 고칠 것: `key`는 `obj`에 실제 존재하는 키만
   허용되고, 반환 타입은 해당 프로퍼티의 타입이어야 한다
3. **Part C** — `parseJson<T>`가 왜 "`as`를 함수로 포장한 것"인지 주석 1~2줄로
   설명하고, `unknown` 반환으로 수정할 것. 이어서 `isServerConfig` type guard를
   구현해 호출부가 narrowing 후에만 접근 가능하게 할 것
4. **Part D** — 제네릭이 **정당한** 함수 `firstOrDefault<T>(arr, fallback)`를
   구현할 것. 빈 배열이면 fallback 반환. `noUncheckedIndexedAccess` 옵션 때문에
   `arr[0]`의 타입이 `T | undefined`라는 점과 싸우게 될 것이다 — `!` 금지.

제출: `answer.ts` 작성 후 튜터에게 리뷰 요청.
검증: `bun run curriculum/types/session-04-generics-in-practice/answer.ts`
     + `bunx tsc --noEmit` (구현 전에는 tsc가 실패하는 게 정상 — 에러 목록이 곧 작업 목록)
