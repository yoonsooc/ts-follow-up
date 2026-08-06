# Session 06 리뷰 — 유틸리티 타입 실전

**판정: ✅ 통과** (런타임 5/5, `tsc --noEmit` 통과 = `@ts-expect-error` 8건 충족)

## 잘한 것

- `Omit` / `Partial`+`Omit` 조합 / `Awaited<ReturnType<typeof f>>` / `Parameters` 전부 정확
- `ActiveStatus = Exclude<OrderStatus, FinishedStatus>` — 리터럴 재나열 대신 파생의 파생.
  SSOT 사슬을 한 단계 연장한 모범 답안
- Part D: rest 구조 분해로 값·타입 동시 omit + "`return user`가 컴파일되는 이유
  (구조적 타이핑) / 그래도 틀린 이유(타입은 값을 바꾸지 않음)" 주석 정확
- `as never` 교정 과정을 잘못된 버전과 병치해 주석으로 기록 — 학습 저장소다운 흔적

## 지적된 실수 (수정 완료)

1. **`cache.get(id) as never`** — `has()` 검사 후에도 `get()`은 `| undefined`
   (S4의 `arr.length`/`arr[0]`와 동일: narrowing은 검사한 표현식에만, has/get의 의미
   연결은 모델링되지 않음). `as never`가 컴파일된 이유: `never`는 공집합이라 **모든
   타입에 대입 가능** — 존재하는 값에 대한 가장 극단적 거짓말이며 반환 위치에선 `as any`급
   무력화다. 해법은 값을 꺼내 직접 좁히기(`const cached = ...; if (cached !== undefined)`).
2. **`if (id && ...)`** — 빈 문자열 id가 falsy로 걸러져 캐시 우회 (S2 falsy 함정 재현).
   값 검사 패턴으로 전환하며 자연 해소.
3. 수정 금지 러너 영역에 디버그 `console.log` 삽입 — 제거.
4. **`Readonly` 사용 근거 정정** — 검증 주석의 "id 불변"은 잉여 속성 검사로 확인되는
   **존재 축**(Omit이 담당)이지 재대입 축(readonly)이 아니다. patch 객체 자체의 생성 후
   불변이라는 별도 근거로는 유지 가능. `Readonly`는 얕고, 타입 세계 전용(런타임 상대는
   `Object.freeze` — 역시 얕음).

## 세션 중 나온 질문과 답 (추가 수확)

- **Q. Pick/Omit 두 번째 인자의 `""`는 필수인가? 정확한 정의는?**
  그 자리는 문자열 목록이 아니라 **리터럴 타입들의 유니언(타입 하나)**. 따옴표 없이 쓰면
  타입 이름 참조가 된다. 정의: `Pick<T, K extends keyof T>` vs `Omit<T, K extends keyof any>` —
  **Omit은 오타를 침묵으로 통과시킨다**(없는 키 제외 = no-op). 민감 필드 제외 용도로는
  Pick(allowlist)이 이중으로 방어적: 새 필드 자동 비노출 + 오타 검출.
- **Q. 캐시 키 타입으로 FetchArgs(튜플)를 쓸 수 없나?**
  타입은 컴파일되지만 Map 키 비교는 SameValueZero(객체는 참조 동등성) — 호출마다 새
  배열이라 영원히 미스. 타입 세계는 키의 모양만, 동등성 판정은 런타임 의미론.
  해법은 값 기반 동등성 타입으로 투영(`JSON.stringify(args)` 등).
- interface로는 파생을 표현할 수 없다 — 타입 연산식 결과에 이름을 붙이는 건 `type` 별칭뿐.

## 기억할 원칙

- 파생 타입을 손으로 쓰지 마라 — 사본은 드리프트한다. 유틸리티 타입은 "원본에 대한 수식"이다.
- `Omit`은 타입에서만 지운다. 값에서 지우는 건 rest 구조 분해 — 구조적 타이핑 때문에
  `return user`는 컴파일되지만 password는 런타임에 그대로 유출된다.
- `as never` = "이 값은 존재할 수 없다"는 항상-거짓 주장. never는 어디에나 대입되므로
  최악의 검사 무력화다.
- Pick=allowlist, Omit=denylist — S2의 그 트레이드오프가 타입 파생에서 재등장한다.
