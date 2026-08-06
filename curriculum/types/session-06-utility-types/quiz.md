# Runbook Quiz #6 — 유틸리티 타입 실전

## [상황 부여]

유저 도메인을 다루는 레거시 코드다. 원본 모델 `User`는 멀쩡한데, AI가 파생
타입들을 전부 **손으로 복제**해 놨다 — 그리고 예상대로 드리프트가 진행 중이다:

```typescript
interface User {
  id: string; name: string; email: string; password: string; createdAt: number;
}

// 손으로 쓴 사본들 — 이미 어긋나 있다
interface PublicUser { id: string; name: string; email: string; }  // createdAt 누락
interface UserPatch  { name?: string; email?: string; }            // password 변경 불가능해짐
```

추가로: 외부 SDK의 `fetchUserFromApi`는 반환 타입을 export해주지 않고,
응답 직렬화 코드에서 `password`가 클라이언트로 **유출되는 사고**가 있었다.

## [요구사항]

`answer.ts`에 작성하라. `User`가 단일 진실 공급원 — **파생 타입을 손으로
다시 쓰는 것 금지, 전부 유틸리티 타입으로 파생시킬 것.**

1. **Part A — 사본 제거**
   - `PublicUser`: `User`에서 `password`만 뺀 타입 (`Omit`)
   - `UserPatch`: `id`/`createdAt`을 제외한 나머지를 전부 optional로 (`Partial` + `Omit` 조합)
2. **Part B — 남의 함수에서 타입 추출**
   수정 금지 영역의 `fetchUserFromApi`(반환 타입 미export)에서:
   - `FetchResult`: Promise를 벗긴 반환 타입 (`Awaited` + `ReturnType`)
   - `FetchArgs`: 매개변수 튜플 (`Parameters`)
   - `cachedFetchUser(...args: FetchArgs)`: 인자를 그대로 전달하는 캐시 래퍼 구현
3. **Part C — 유니언에서 파생**
   `OrderStatus` 유니언에서 `FinishedStatus`(`"CANCELLED" | "REFUNDED"`)는
   `Extract`로, `ActiveStatus`(나머지)는 `Exclude`로 파생
4. **Part D — 타입은 지워진다, 값은 남는다**
   `toPublicUser(user: User): PublicUser` 구현. **`as` 금지**, 그리고 반환값의
   **런타임 객체에도** `password` 키가 없어야 한다(러너가 검사한다).
   함정: `return user;`는 컴파일된다 — 왜 컴파일되는지, 왜 그래도 틀렸는지
   주석 1~2줄로 설명할 것.

제출: `answer.ts` 작성 후 튜터에게 리뷰 요청.
검증: `bun run curriculum/types/session-06-utility-types/answer.ts` + `bunx tsc --noEmit`
     (구현 전에는 tsc 실패가 정상 — 에러 목록이 작업 목록)
