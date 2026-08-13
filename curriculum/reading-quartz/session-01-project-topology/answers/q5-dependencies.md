# Q5. 의존성 지도 (중추 5개)

> 판정: ✅ 통과 (리뷰 완료)

`package.json`의 dependencies(79개) 중 **빌드 파이프라인의 중추** 5개를 골라
각각의 역할을 한 줄로 설명하라. 최소한 unified 계열 2개 이상을 포함할 것.
(힌트: quartz/plugins/types.ts 상단 import에 등장하는 unified, vfile, hast가 중추의 강력한 후보이고, 각각이 빌드 파이프라인의 어느 단계(마크다운 파싱, 파일 표현, HTML 트리)를 담당하는지 package.json과 실제 사용처를 오가며 한 줄씩 채우시면 됩니다.)


| 패키지 | 역할 | 앵커 |
|---|---|---|
| esbuild | ts -> js 트랜스파일링, 번들링 (코어 자기 번들링 + 파이프라인 내 인라인 스크립트 처리) | quartz/cli/handlers.js:3, quartz/processors/parse.ts:1 |
| unified | unified는 콘텐츠를 구문 트리로 컴파일하고, 트리를 다시 콘텐츠로 문자열화시키기 위한 '프로세싱 인터페이스'를 제공함(parse -> transform -> stringify). 그리고 콘텐츠 종류별로 인터페이스를 구현하기 위한 생태계(md, html, text 등)가 존재한다. | quartz/plugins/types.ts:1(PluggableList import) |
| vfile | md 파일 파싱을 위해 VFile을 사용해 가상 파일 형태로 읽어들인다. | quartz/plugins/types.ts:12(VFile import) |
| hast-util-to-jsx-runtime | hast 트리를 JSX 런타임(preact)으로 넘겨 렌더링 가능하게 하는 다리. hast 자체는 HTML AST **명세**로, 런타임 코드 없는 순수 타입 패키지(@types/hast, devDeps)로 제공된다. | quartz/util/jsx.tsx:1, quartz/plugins/types.ts:13(Root import) |
| remark-parse | md -> mdast 파싱 | quartz/processors/parse.ts:2 |
| remark-rehype | mdast -> hast 변환 | quartz/processors/parse.ts:3 |
| preact + preact-render-to-string | hast/JSX -> 최종 HTML | quartz/components/types.ts:1 |

> `remark-parse` (md -> mdast) => `remark-rehype` (mdast -> hast) -> `preact` (hast -> HTML)