# Session 05 리뷰 — 런타임 방어선 구축 (Zod)

**판정: ✅ 통과** (런타임 13/13, `tsc --noEmit` 통과) — **types 커리큘럼 5개 세션 완주.**

## 잘한 것

- 스키마에 타입 제약과 값 제약(`.int().min(8).max(32)`)을 한 곳에 모으고, 타입은 전부
  `z.infer` 파생 — 수동 선언 0개. `DEFAULT_CONFIG: AppConfig`가 컴파일된다는 것
  자체가 파생 타입의 올바름 증명
- try/catch를 `JSON.parse` 격리에만 한정, 스키마 판정은 `safeParse`로 일관
- `z.discriminatedUnion` + 중첩 `AppConfigSchema` 정확. `handleResponse`를 조기 반환으로
  재구성해 넓히기 문제를 근본 제거
- Session 1의 같은 문제(loadConfig)를 typeof 사다리 없이 3줄 검증으로 해결 —
  커리큘럼 수미상관 완성

## 지적된 실수 (수정 완료)

1. **`let result` (표기 없는 let) → 넓히기 재발** — 대입된 리터럴 `ok: true`가
   `boolean`으로 넓혀져 discriminated union의 태그 계약(`ok: true` 리터럴)을 만족하지
   못함(TS2322). 교훈: **태그의 리터럴성이 무너지면 discriminated union은 성립하지
   않는다.** 해법은 표기(`let r: ConfigResult`) 또는 조기 반환(반환 타입이 문맥이 되어
   넓히기 자체가 없음) — 후자로 수정.
2. **죽은 분기** — payload 원시값 검사 후 대입만 하고 반환하지 않아 항상 덮어써짐.
   원시값 거부는 스키마의 일이므로 블록 삭제.
3. **Q2 방향 반대** — "검증이 타입에서 나온다"(Rust/serde 방향)로 답했다가 교정:
   TS 타입은 지워지므로 검증의 재료가 될 수 없고, **값(스키마)이 SSOT, 타입이 파생 사본.**
   사람이 고칠 두 번째 원본이 없으므로 드리프트라는 사건 자체가 불가능.
4. 자동완성 사고(`zod/v4/locales/da.cjs` import), 디버그 `console.log` 소음,
   `console.err` 오타(런타임 TypeError로 발견 — tsc였다면 TS2339로 사전에 잡혔음. 실행기 ≠ 검사기 최종 복습).

## 세션 중 나온 질문과 답 (추가 수확)

- **Q. Zod 이전에는 어떻게 검증했나? `변수: 타입` 표기?**
  표기는 컴파일 타임 검사일 뿐 런타임 검증이 아니다 — `const u: User = JSON.parse(x)`는
  `any` 때문에 무조건 통과. 실제 역사: ① 안 함(사고 대기) ② 수동 가드/클래스+데코레이터
  (class-validator = Java Bean Validation 이식) ③ 스키마 라이브러리 계보: joi/ajv(검증만,
  타입 무관=드리프트 내장) → io-ts(타입 파생 아이디어 대중화) → Zod(인체공학으로 승리).
  Zod의 발명품은 검증이 아니라 "검증기를 타입의 SSOT로 만드는 것을 쉽게" 한 것.
- **Q. 리터럴 유니언은 왜 z.union이 아닌 z.enum인가?**
  둘 다 같은 타입을 파생하지만, 값의 세계에서는 검사 방법이 다르다: union은 후보 순차
  시도(느림, 에러 장황), enum은 멤버십 검사 단발(빠름, 에러 한 줄) + `.options`/`.enum`
  등 부가 API. discriminatedUnion도 같은 철학(태그 선판정)의 전용 조합자.
  z.enum은 TS enum 키워드와 무관 — 오히려 그 대체물.
- **구조 분해와 discriminated union**: `const { success, data } = result` 후 `if (success)`로
  data가 좁혀지는 것은 TS 4.4+의 특례(한 문장 const 분해 판별자 추적). 기본형은
  분해 없이 `result.success` 검사.

## 기억할 원칙

- 값(스키마)이 단일 진실 공급원, 타입은 `z.infer`로 파생된 사본 — 드리프트 원천 봉쇄.
- 경계에서 `safeParse` 한 번, 내부는 타입 신뢰. Zod는 관세청이지 내부 검문소가 아니다.
- `parse`(throw)는 실패=버그인 지점(기동 시 env)에만. 실패가 일상인 곳은 `safeParse`.
- 표기 없는 `let` + 객체 리터럴 = 넓히기. discriminated union을 만들 때는 반환 문맥
  (조기 반환)이나 표기로 리터럴을 지켜라.
