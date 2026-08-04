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

- (비어 있음)
