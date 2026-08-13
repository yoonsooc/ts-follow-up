# Q3. 컴파일러 계약 비교

> 판정: ✅ 통과 (리뷰 완료)
>
> 리뷰 특기사항: 최초 답안의 moduleResolution "nodenext"는 분석 중 본인이 가한
> 로컬 수정(미커밋)을 근거로 삼은 오류였다. git status / git show HEAD:로 판별 후
> 원복. 교훈: 분석 대상 저장소는 읽기 전용으로 다루고, 실험했다면 관찰 전에
> 원복한다. 부수 소득: nodenext로 바꾸면 TS2835(상대 import 확장자 강제)가 651개
> 발생한다는 실험으로, quartz가 구식 "node" 해석을 유지하는 이유(실제 해석은
> esbuild 담당)를 실증함.

| 옵션 | quartz-blog | ts-follow-up | 읽기에 주는 의미 |
|---|---|---|---|
| moduleResolution | node | bundler | 'bundler'는 Vite, Webpack, Rollup, esbuild 같은 현대 번들러용으로, package.json의 exports, imports를 지원하고 상대 경로의 확장자 생략을 허용한다. 반면 node는 node 구 버전용이고, 이에 맞게 quartz에서는 ts 모듈 해석을 esbuild가 담당한다(확장자 없는 경로 스스로 해석). ts-follow-up에서는 bun을 사용하고 있다. |
| types | - | ["bun"] | ts-follow-up에서는 최신 TS7(tsgo)을 사용하고, node_modules/@types를 자동 포함하지 않으므로 "types": ["bun"]을 통해, 포함할 타입 패키지를 명시한다. 반면 "typescript": "^5.9.3"인 quartz-blog에서는 자동 포함한다. |
| noEmit | true | check(package.json의 script) | ts가 타입 검사만 수행하고 js 선언 파일과 같은 출력파일을 생성하지 않도록 하는 noEmit 옵션은 기본값이 false 이다. ts-follow-up에서는 bun을 사용했고, 빠른 번들링을 위해 컴파일타임 타입 검사를 제외하고, tsc를 사용하지 않는다. 대신 bunx tsc --noEmit을 별도로 수행하거나 IDE의 LSP, CI 스테이지의 검사 스크립트 설정을 통해 별도 타입 검사단계를 분리할 수 있다. quartz에서는 package.json의 'check' 스크립트를 통해 tsc --noEmit를 수행한다. |
| noUncheckedIndexedAccess(누락된 정답 추가) | - | true | quartz에는 이 옵션이 없어서 `arr[0]` 타입이 `T \| undefined`가 아닌 `T`로 보인다. 즉 undefined 가능성을 숨기고 있어서 코드를 읽는 사람이 알아서 숙지해야 함 |
