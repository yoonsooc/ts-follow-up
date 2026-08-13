# Q1. 실행 사슬 추적

> 판정: ✅ 통과 (리뷰 완료)

1. package.json
package.json의 bin 필드에는 npx 실행 시 node_modules/.bin/에 symlink된 실행 파일 목록이 작성되어있음(scripts 필드는 npm run 전용)
`"quartz": "./quartz/bootstrap-cli.mjs",`는 npx quartz 실행 시 bootstrap-cli.mjs를 실행하라는 뜻.

2. quartz/bootstrap-cli.mjs
우선 mjs는 package.json 설정과 무관하게 ES Module로 처리된다. 
내부적으로 yargs를 사용하는데, yargs는 Node.js에서 명령줄 인자 및 명령어를 처리하기 위한 라이브러리이다. command 함수를 사용하면 이 파일을 실행(ex. node bootstrap-cli.mjs)할 때 수행할 동작을 추가 명령줄 인자(Arguments)로 넘길 수 있다. add, config, check등이 정의되어있고 line 101에 build가 정의되어있다.
이를 통해 npx quartz build를 입력했을 때 실제 수행할 동작이 매핑된다.
결론적으로 `async (argv) => { await handleBuild(argv) }` 가 실행되고 handleBuilld는 `quartz/cli/handlers.js`에 정의되어있다.

3. quartz/cli/handlers.js
코드를 보면 esbuild 라이브러리를 직접 호출해 quartz 코어를 직접 트랜스파일링/빌드하는 것으로 보인다.
esbuild 컨텍스트(ctx)를 정의하고, mutex를 사용해 빌드가 병렬로 일어날 때 동시성 처리를 한다.

esbuild를 사용한 빌드 로직은 line 403부터 정의되어있는데, 실제 빌드 수행은 line 417의 ctx.rebuild()를 통해 실행되는 것으로 보인다. esbuild 컨텍스트 함수들은 node_modules/esbuild/lib/main.d.ts에 선언되어있는데 이는 esbuild 라이브러리의 빌드 결과물로서, 세부 구현 로직은 같은 디렉토리의 main.js로 보인다.

다시 handlers.js로 돌아와서, quartz TS 코어의 번들 결과는 ctx 객체의 outfile 필드로 설정된 `./quartz/.quartz-cache/transpiled-build.mjs`에 저장된다.

4. ./quartz/.quartz-cache/transpiled-build.mjs
앞선 handlers.js에서 파악하던 build 함수의 마지막(line 439)에서 동적 import를 통해 default 함수를 가져와서 실행되는 것을 볼 수 있다.(JS 런처 -> TS 코어 번들 -> 번들 결과JS 실행)
참고로 default는 `quartz/build.ts`에 원본 소스가 작성되어있음.

위 build 함수는 handlers.js에서 serve 모드 여부에 따라 서버로서 동작하냐, 단일 빌드를 수행하냐로 갈리게 된다.

## 부록: watch 모드의 재번들과 캐시 무력화 트릭 (튜터 문답 요약)

watch 모드의 사슬은 세 단계가 분업한다:

1. **변경 감지**: `chokidar.watch(...).on("change", () => build(...))` — handlers.js:599-602
2. **재번들**: `ctx.rebuild()`가 `transpiled-build.mjs`를 디스크에 다시 씀 — handlers.js:417
3. **새 번들 다시 읽기**: `await import(\`../../${cacheFile}?update=${randomUUID()}\`)` — handlers.js:439

3단계의 쿼리 스트링이 "캐시 무력화 트릭"이다. Node의 ESM 로더는 `import()`를 **URL
단위로 캐시**하므로 같은 경로는 파일이 바뀌어도 헌 모듈을 돌려주고, ESM에는 캐시
무효화 API가 없다(CJS의 `delete require.cache`에 해당하는 것이 없음). 그래서 매번
다른 UUID를 붙여 **URL 정체성을 바꿔 "처음 보는 모듈"로 위장**시키는 것 — 쿼리
스트링은 파일 경로 해석에 영향을 주지 않으면서 캐시 키만 바꾸는 가장 값싼 노브다.
(Java의 핫 리로드가 새 클래스로더로 같은 클래스를 다시 읽는 것과 같은 발상:
"캐시를 비울 수 없으면 정체성을 바꾼다")

대가: 캐시를 우회할 뿐 비우지 않으므로 **이전 버전 모듈이 메모리에 계속 쌓인다**
(수정 100번 = 번들 사본 100개). 개발 루프 전용이라 수용한 실용적 타협.
