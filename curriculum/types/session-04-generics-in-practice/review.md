# Session 04 리뷰 — 제네릭의 실용적 통제

**판정: ✅ 통과** (런타임 9/9, `tsc --noEmit` 통과 = `@ts-expect-error` 3건 충족)

## 잘한 것

- Part B: `K extends keyof T` + `T[K]` — 타입 파라미터 전부가 두 곳 이상에서 일하는 정석 형태
- Part C: return-only 제네릭 제거 + 약한 단언 가드. 단언 교체 이유를 주석으로 남김
- Part D: `for (const first of arr) return first` — 두 선택지 중 명세("빈 배열일 때만
  fallback")와 정확히 일치하는 쪽을 골랐고, length 체크가 안 통하는 이유
  (".length와 요소 존재의 상관관계를 컴파일러는 모델링하지 않는다")를 주석으로 정리함
- 안티패턴 원본을 주석으로 병치해 학습 기록으로 남긴 것 — 이 저장소 맥락에선 가치 있음

## 세션 중 나온 질문과 답 (추가 수확 — 이번 세션은 이게 본편)

- **Q. 장식 제네릭이 `unknown`과 "같다"는 게 무슨 뜻인가?**
  T가 시그니처에 1회만 등장하면 연결할 대상이 없으므로 `<T extends C>(v: T)` ≡ `(v: C)`.
  formatLog의 제약 유니언은 null/undefined/boolean을 우연히 거부하는 구멍이었고,
  본문이 타입 정보를 안 쓰므로 올바른 C는 `unknown`이었다.
  + `Record<K, V>` = 키 K, 값 V인 객체. `Record<OrderStatus, string>`처럼 리터럴 유니언
  키를 쓰면 데이터 차원의 exhaustiveness 강제가 된다. 제약엔 `Record<string, unknown>` 권장.
- **Q. 본문이 인터페이스 C의 메서드를 쓰면 unknown은 못 쓰지 않나?**
  맞다 — 그때는 `(v: C)`. 제네릭은 아직 아니다. 사다리: 연산 불필요 → `unknown` /
  C의 연산 필요 → `(v: C)` / 구체 타입이 반환·타 인자로 흘러감 → `<T extends C>`.
  TS 제네릭은 지워지므로(단형화 없음) 연결이 없으면 제네릭 쓸 이유가 0이다.
- **Q. 에디터만 에러를 낸다?** → 사실 tsc도 실패했음(저장 전 실행 추정). 단, 의심은
  정당: VSCode 내장 tsserver(TS 5.x)와 프로젝트 TS 7은 실제로 다른 검사기다.
  에디터를 TS 7로 맞추려면 TypeScript Native Preview 확장 필요.
- **TS5112**: 커맨드라인에 파일을 지정하면 tsconfig는 로드되지 않는다. TS 5는 조용히
  무시했고 TS 7은 명시적 에러로 승격. 표준 실행법은 `bunx tsc --noEmit` (파일 인자 없이).
- **Q. 가드 안에서 약한/강한 단언 — 검증 로직이 틀리면 어차피 둘 다 뚫리는 것 아닌가?**
  서명(`value is T`)이 신뢰 지점인 건 동일하나, 약한 단언은 "검증 없는 사용"이라는
  실수 카테고리를 컴파일 에러로 원천 봉쇄한다(실험: typeof 검사를 값 검사로 교체 시
  강한 단언은 침묵, 약한 단언은 TS18046). 사람이 보증할 면적을 서명 한 줄로 최소화.
- **Q. 강한 단언 판에서 host가 비문자열이면 startsWith에서 throw하니 결과적으로
  걸러지는 것 아닌가?** 아니다 — **false 반환과 throw는 다른 실패 모드다.** 가드의
  계약은 총함수(boolean)이고, throw는 호출부의 설계된 fallback 경로 대신 unhandled
  exception(Rust의 panic 격)으로 전파되어 프로그램 단위 장애가 된다. 게다가 `&&` 단락
  평가 탓에 데이터 조합에 따라 간헐적으로만 터진다. 잔여 위험(타입-검증 드리프트)은
  Session 5(Zod)의 주제.

## 기억할 원칙

- 타입 파라미터는 두 곳 이상에서 일해야 한다. 1회 등장이면 지워라.
- return-only 제네릭(`parseJson<T>`)은 `as`를 함수로 포장한 것 — `unknown` 반환이 정직하다.
- narrowing은 검사한 표현식 자체에만 적용된다 (`arr.length` 검사는 `arr[0]`을 못 좁힌다).
- 검증기는 절대 throw하지 않는 총함수여야 한다. 거부와 자폭은 다르다.
