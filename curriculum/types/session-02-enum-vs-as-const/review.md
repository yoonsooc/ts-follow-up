# Session 02 리뷰 — TS의 런타임 개입과 부작용 (enum vs as const)

**판정: ✅ 통과** (보너스 포함 12/12 케이스, `tsc --noEmit` 통과)

## 잘한 것

- 스캐폴드에 있던 중복 객체 두 벌을 `as const` 단일 진실 공급원 하나로 통합하고, 값/타입 동명(`OrderStatus`) 관용구를 정확히 적용함
- `switch` + `never` exhaustiveness check 올바르게 구현 — 상태가 추가되면 컴파일 타임에 잡힌다
- `includes`의 TS2345를 `as readonly string[]` **넓히기 단언**으로 해결하고, 대안(`Set`, `.some`)을 주석으로 비교해 둠

## 지적된 실수 (수정 완료)

1. **테스트는 초록인데 명세 위반** — `isActionable`을 허용 목록(Pending, Paid만 true)으로 작성해서, 명세("Cancelled만 false")와 달리 Shipped가 처리 불가가 됨. 테스트 러너에 Shipped 케이스가 없어서(러너의 커버리지 구멍) 통과처럼 보였다. **테스트 통과 ≠ 명세 충족.** 러너에도 해당 케이스를 보강함.
   - 부가 논점: 허용 목록은 새 상태 추가 시 조용히 false, 차단 목록(`!== Cancelled`)은 조용히 true가 된다. 컴파일러가 "새 상태에 대해 결정하라"고 강제하게 하려면 이 함수도 exhaustive switch로 쓸 것.

## 세션 중 나온 질문과 답 (추가 수확)

- **Q. `as const`가 없으면 파생 타입은 어떻게 되나?**
  객체 타입은 `{ Pending: string; ... }`으로 넓혀지고(widening), 인덱스 접근 결과는 `string | string ... = string`으로 무너진다. `as const`는 이 패턴의 필수 조건이다. 키(`keyof`)는 넓히기 대상이 아니라 `as const` 없이도 정확하다 — 넓혀지는 것은 언제나 값이다.
- **Q. `Object.values(...)`를 `as OrderStatus[]`로 단언하면 좁히기인가 넓히기인가?**
  둘 다 아닌 **제자리 단언(no-op)** — 타입 별칭은 이름일 뿐, 벗기면 단언 전후가 같은 집합이라 TS2345도 그대로 남는다. 에러의 원인은 배열이 아니라 인자(`string`이 요소 타입보다 넓음)였으므로, 요소 타입을 `readonly string[]`으로 **넓혀야** 풀린다.
  - `as` 방향 판정법: 부분집합→상위집합(넓히기, 항상 안전) / 같은 집합(제자리, 무의미) / 상위집합→부분집합(좁히기, 위험).
  - `string[]`이 아닌 `readonly string[]`으로 넓히는 이유: 쓰기 가능하게 넓히면 `push`로 원본 타입과 모순을 만들 수 있다.
- 에디터의 빨간 줄(ts(2345))은 `tsc`와 동일한 검사기(tsserver)다 — `bun run`만 통과한 상태는 제출 기준 미달.

## 기억할 원칙

- `enum`은 타입이 아니라 런타임 코드 생성이다. 언어의 방향(`erasableSyntaxOnly`, Node type stripping)도 enum 배제 쪽이다.
- 상수 명단은 `as const` 객체 + `(typeof X)[keyof typeof X]` 파생 유니언 — Go의 const 블록처럼 "값을 선언하고 타입을 파생"한다.
- 리터럴 타입 = 값 하나짜리 집합. 유니언으로 묶으면 enum의 역할을 문법 추가 없이 해낸다.
- 분기 소진 후 남는 타입은 `never` — default에 `never` 대입으로 Rust `match`의 exhaustiveness를 강제할 수 있다.
