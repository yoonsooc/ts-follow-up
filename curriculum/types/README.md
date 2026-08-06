# 카테고리: 타입 (Types)

TS의 타입 시스템은 컴파일 타임에만 존재한다. 이 카테고리는 그 한계를 이해하고,
런타임 경계에서 방어적인 코드를 작성하는 훈련을 목표로 한다.

## 세션 목록

| # | 세션 | 주제 | 상태 |
|---|---|---|---|
| 01 | [escape-hatches](./session-01-escape-hatches/) | 타입 시스템의 구멍과 회피 (`any`, `unknown`, `as`) | ✅ 완료 |
| 02 | [enum-vs-as-const](./session-02-enum-vs-as-const/) | TS의 런타임 개입과 부작용 (enum의 문제점과 `as const`) | ✅ 완료 |
| 03 | [structural-typing](./session-03-structural-typing/) | 구조적 타이핑의 이해 (`interface` 선언 병합 vs `type`) | ✅ 완료 |
| 04 | [generics-in-practice](./session-04-generics-in-practice/) | 제네릭의 실용적 통제 (오버엔지니어링 방지) | ✅ 완료 |
| 05 | [runtime-validation](./session-05-runtime-validation/) | 런타임 방어선 구축 (Zod 스키마 검증과 실패 처리) | ✅ 완료 |
| 06 | [utility-types](./session-06-utility-types/) | 유틸리티 타입 실전 (파생으로 SSOT 유지) | ✅ 완료 |

상태: ⚪ 대기 / 🔵 진행 중 / ✅ 완료 (퀴즈 리뷰까지 통과해야 완료)

## 세션 디렉토리 구조

```
session-NN-<slug>/
  quiz.md      # Runbook 퀴즈 (상황 부여 + 요구사항)
  answer.ts    # 학습자 답안 작성 파일 (bun으로 실행/타입체크 가능)
  review.md    # 튜터 리뷰 (제출 후 작성됨)
```

## 참고 자료

- [type-cheatsheet.html](./type-cheatsheet.html) — 세션 1~5의 키워드 요약 치트시트 (브라우저로 열기). 공식 [Cheat Sheets](https://www.typescriptlang.org/cheatsheets/)의 한글 커리큘럼판.

## 백로그 (추가 검토 주제)

실무 안티패턴이나 신규 기능이 발견되면 여기에 적고, 세션으로 승격한다.
현재 최상위 목표는 **Quartz v5 소스 분석 가능 레벨** — 백로그 우선순위도 이 기준으로 매긴다.

### 승격 대기 (우선순위순)

| 우선 | 주제 | 내용 | 비고 |
|---|---|---|---|
| ~~1~~ | ~~유틸리티 타입 실전~~ | → **Session 06으로 승격** | |
| 2 | 조건부·매핑 타입과 `infer` 독해 | 유틸리티 타입이 만들어지는 원리. 목표는 제작이 아니라 **라이브러리 `.d.ts`와 에러 메시지 독해** | **Quartz 선행 필수**. [Type Challenges](https://github.com/type-challenges/type-challenges) easy 선별 병행 |
| 3 | `satisfies` 연산자 | 표기(`: T`) / 단언(`as T`) / `satisfies` 삼자 비교 — "검사는 받되 추론된 좁은 타입 유지"라는 제3의 선택지 | S2 스캐폴드에서 잠깐 등장 |
| 4 | 템플릿 리터럴 타입 | `` `GET ${string}` `` 같은 문자열 패턴 타입 | |
| 5 | Result 패턴 직접 설계 | throw 없는 에러 처리 아키텍처 — S4(총함수)·S5(safeParse) 논의의 일반화 | [error-handling](../error-handling/) 카테고리와 관점 분담 |

우선순위 1·2 완료가 [reading-quartz](../reading-quartz/) 카테고리(Quartz v5 소스 분석)의 착수 조건이다.
