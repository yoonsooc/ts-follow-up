# 카테고리: reading-quartz — Quartz v5 소스 분석 (실전)

실사용 중인 오픈소스 [Quartz](https://github.com/jackyzha0/quartz)의 메이저 버전(v5)
소스를 분석 가능한 레벨에 도달하는 것이 목표. types 커리큘럼의 지식을 실제
코드베이스 독해에 적용하는 실전 카테고리다.

**선행 관계** (경로 재배치됨): types S6(유틸리티 타입) 완료 후 착수. types S7
(조건부·매핑 타입과 `infer` 독해)은 세션 03(unified-ecosystem) 전까지만 이수하면
되며, 세션 01·02는 선행 없이 진행 가능.

참고 교재: Total TypeScript "Type Transformations" 영역,
[Type Challenges](https://github.com/type-challenges/type-challenges) easy 선별.

## 세션 목록 (구성안)

| # | 세션 | 주제 | 상태 |
|---|---|---|---|
| 01 | [project-topology](./session-01-project-topology/) | 프로젝트 지형 파악 — 빌드/설정/진입점, 의존성 지도, tsconfig 읽기 | 🔵 진행 중 |
| 02 | plugin-architecture | Quartz 제네릭 플러그인 시스템 독해 (types S4 판별 기준 실전 적용) | ⚪ 대기 |
| 03 | unified-ecosystem | unified/remark/rehype 생태계 — 라이브러리 제네릭·조건부 타입 실전 독해 | ⚪ 대기 |
| 04 | v5-major-diff | v5 브레이킹 체인지 추적 — 타입 변경이 소비 코드에 전파되는 경로 분석 | ⚪ 대기 |

상태: ⚪ 대기 / 🔵 진행 중 / ✅ 완료

## 백로그 (추가 검토 주제)

- (비어 있음)
