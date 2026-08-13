# Q2. 설정의 여정

> 판정: ✅ 통과 (리뷰 완료)

1. YAML 읽기/파싱: 
esbuild의 진입점(entrypoint)인 quartz/build.ts에서 root의 quartz.ts를 import(line11)하고 있으므로 번들 안에 인라인된다. quartz.ts에서는 `const config = await loadQuartzConfig()` top-level await 즉 함수 호출이 아닌, 모듈 평가 시점에 loadQuartzConfig 함수를 통해 config가 완성된다.
```
handlers.js:439의 동적 import(번들)
 → 번들 모듈 평가 시작
 → (인라인된 quartz.ts 평가) loadQuartzConfig() 실행 ← YAML이 여기서 읽힘
 → 평가 완료 후에야 buildQuartz 호출
```
plugin/loader/config-loader.ts에 정의된 loadQuartzConfig 함수에서 quartz.config.yaml을 읽고(설정 파일 존재여부에 따라 나뉨) QuartzPluginsJson 타입으로 파싱한다.

2. 런타임 검증 존재 여부 + 코드 인용 + 평가:
config-loader.ts의 readPluginsJson 함수를 보면
YAML 혹은 JSON 파싱 결과를 as 단언을 통해 QuartzPluginsJson 타입으로 반환한다.
```ts
  if (configPath.endsWith(".yaml") || configPath.endsWith(".yml")) {
    return YAML.parse(raw) as QuartzPluginsJson
  }
  return JSON.parse(raw) as QuartzPluginsJson
```
즉, 파싱 결과가 우선 QuartzPluginsJson 타입임을 전제하고 다음 로직을 이어간다.

파싱 결과를 사용할 때에도, line 260을 보면 `json.configuration` 의 타입은 Record<string, unknown> 인데 `as unknown as GlobalConfiguration`으로 다시 타입을 넓였다가 단언을 통해 좁히는 것을 볼 수 있다.
```ts
const configuration = {
    ...(json.configuration as unknown as GlobalConfiguration),
    ...configOverrides,
  }
```
왜 이중 단언을 쓸까?
`Record<string, unknown>` → `GlobalConfiguration`을 한 번의 as로 시도하면 컴파일러가 "겹침 부족"으로 거부할 수 있으니, unknown을 통해 우회한 것.
GlobalConfiguration가 인터페이스가 아니라 타입이라면 단일 단언(as)를 사용할 수 있었겠지만, 안전성 문제는 동일하다.

이후 런타임에러가 날 만한 부분은 plugin 처리 부분인데, line 270 의 try-catch 블록을 통해 plugin 설정과 설치 시 발생하는 에러를 예외처리하고 있다.

plugin 설정 파싱, 설치 처리는 plugins/loader/gitLoader.ts에서 수행한다. 

파싱 로직.
line 70의 parsePluginSource를 보면 PluginSource타입인 source가 string인지, PluginSourceObject 타입인지에 따라 다르게 처리한다. 결국 어떤 타입이든 플러그인 경로를 재귀적으로 처리하고, 정상적으로 처리되는 케이스가 아닌 경우 line 155에서 에러를 던진다. 케이스가 if 블록으로 다 분리되어있지만 주석으로 어느 정도 설명이 가능하고, 실제로 잘 동작하는지는 테스트 코드에 의존해야하는 것으로 보임.

설치 로직. 
플러그인 위치(로컬 / 원격 git 레포)에 따라 분기된다.
경로가 유효한 지를 중점적으로 판별하여 예외를 터뜨림.

전반적으로 타입에 대한 검증이 별도로 존재한다기보다 설정의 필드를 파싱과 설치에 사용할 때 존재 여부에 따라 예외 여부가 갈리는 것을 보임
즉, "에러 발생 지점과 원인 지점이 분리된다".
quartz.config.yaml에 오타를 내는 '원인'에도 불구하고, 로드 시점에 평가되는 이중 단언(as unknown as)는 침묵하고, 한참 뒤 플러그인 처리나 설정에서 undefined로 인해 에러가 발생해도, stacktrace는 quartz.config.yaml을 가리키지 않을 것이다(파싱 결과를 정상으로 취급했으므로).
localStorage, 외부 API 호출과 동급의 경계에 해당한다.


3. 방어 제안 (의사코드):

```ts
import { z } from "zod";

// Schema, Type Declarations
export const PluginSourceObjectSchema = z.object({
  repo: z.string(),
  subdir: z.string().optional(),
  ref: z.string().optional(),
  name: z.string().optional(),
})
export type PluginSourceObject = z.infer<typeof PluginSourceObjectSchema>;

export const PluginSourceSchema = z.union([z.string(), PluginSourceObjectSchema])
export type PluginSource = z.infer<typeof PluginSourceSchema>;

export const PluginJsonEntrySchema = z.object({
  source: PluginSourceSchema,
  enabled: z.boolean(),
  options: z.record(z.string(), z.unknown()).optional(),
  order: z.number().optional(),
  layout: PluginLayoutDeclarationSchema().optional()
})
export type PluginJsonEntry = z.infer<typeof PluginJsonEntrySchema>;

export const LayoutConfigSchema = z.object({...}) satisfies z.ZodType<LayoutConfig>

export const QuartzPluginJsonSchema = z.object({
  $schema: z.string().optional(),
  configuration: z.record(z.string(), z.unknown());
  plugins: z.array(PluginJsonEntrySchema),
  layout: LayoutConfigSchema.optional()
});

// config-loader.ts line 56
//   return JSON.parse(raw) as QuartzPluginsJson ->
try {
  if (raw !== null) {
    const jsonObj = JSON.parse(raw);
    const result = QuartzPluginJsonSchema.safeParse(jsonObj);
    if (result.success) {
      // 스키마 일치
      return result.data
    } else {
      // 스키마 불일치(예외)
      console.error("Invalid Quartz config:", result.error.issues); //issues.path가 맞지 않는 YAML 필드를 가리킴
    }
  }
} catch (err) {
  // JSON 파싱 에러
  console.error('Invalid config JSON:', err instanceof Error ? err.message : err)
}
return null;
```
원본 코드에서는 yaml 설정이 의도와 다르게 틀린 경우 조용한 fallback처리를 하고 있으나(파일이 없는 경우 X), quartz 빌드 시 명확한 에러를 뿜고(위 예시코드의 success 필드 검증 & 로깅), 프로세스를 종료(fail-fast)하는게 사용자를 돕는 방향일 수 있다.


---


### 부록: Quartz는 이 경계를 방어하려고 애썼는가? (튜터와 공동 조사 요약)

결론: 애썼다. 다만 런타임이 아닌 다른 층에서 방어했고, 그 보상책 자체가 현재
드리프트 중이다.

**1. v4 시절에는 이 문제가 존재하지 않았다.**
`git show v4.5.2:quartz.config.ts`로 확인한 결과, v4의 설정은 YAML이 아니라
`QuartzConfig` 타입이 표기된 TypeScript 코드였다. 에디터의 tsserver가 설정을
실시간으로 검사했으므로 파싱 경계 자체가 없었다.

**2. v5의 YAML 전환은 의도적 트레이드오프였다.**
플러그인 관리 CLI(TUI, install-plugins, quartz.lock.json)가 설정을 프로그램으로
읽고 써야 했기 때문에, 설정이 코드가 아닌 데이터여야 했다. 코드는 사람만 편집할
수 있지만 데이터는 기계도 편집할 수 있다.

**3. 보상책은 편집 타임 층에 실재한다.**
- 345줄짜리 JSON Schema (`quartz/plugins/quartz-plugins.schema.json`).
  `required`, `additionalProperties: false`까지 갖춘 진지한 스키마다.
- 설정 파일 첫 줄의 `# yaml-language-server: $schema=...` 헤더. 에디터가 편집 중
  자동완성과 검증을 제공한다.
- CLI가 설정 저장 시 이 헤더를 자동 삽입한다 (`quartz/cli/plugin-data.js:44`).

즉 검증의 위치가 v4의 컴파일 타임에서 v5의 편집 타임으로 이동했고, 런타임만
비어 있다. 편집 타임 검증은 yaml-language-server가 없는 환경(vim, GitHub 웹 편집,
스크립트 수정)에서 무방비이고, 빌드는 무엇이든 통과시킨다.

**4. 우리가 예측한 증상들이 upstream 이슈로 실재한다.**
- #2511: plugin install이 객체형 `{ repo, ref }` source를 조용히 누락(silently
  drops). 우리가 "조용한 실패"라 부른 실패 모드가 `parsePluginSource` 주변
  불일치로 보고됨.
- #2507, #2509: 설정을 바꿨는데 폰트/색이 적용되지 않음. 설정 의도가 소리 없이
  무시되는 시나리오의 현실판.
- #2445: CLI가 설정을 저장하면 YAML 주석이 사라짐 (`YAML.stringify` 왕복 부작용).

**5. 보상책 자체가 드리프트 중이다 (백미).**
open PR #2485 "fix(schema): allow null for analytics field". `cfg.ts`의 `Analytics`
타입은 null을 허용하는데 JSON Schema는 불허해서 손으로 고치는 PR이 올라와 있다.
345줄 스키마가 TS 타입과 별개로 손으로 유지되는 사본이기 때문이다. types 커리큘럼
S5의 결론 그대로, 타입과 검증이 서로 다른 두 곳에 손으로 쓰여 있는 한 드리프트는
구조적으로 가능하다.

현장 확인(schema.json:167): 드리프트는 양방향이다. 스키마의 analytics 정의는
`"type": "object"` 뿐이다.
- 타입보다 엄격한 방향: JSON Schema에서 null은 별도 타입(`"null"`)이므로
  `"type": "object"`는 정당한 `analytics: null`(분석 끄기)을 거부한다. 사용자가
  에디터 오류를 보고 항의하므로 PR #2485로 이어졌다.
- 타입보다 느슨한 방향: `properties`가 없어서 내용은 무엇이든 통과한다. TS 쪽은
  provider별 필수 필드가 다른 discriminated union인데(`"google"`이면 `tagId` 필수
  등), 스키마는 `{ provider: "goggle" }` 같은 오타도 침묵으로 통과시킨다. 신호가
  없으므로 이 방향은 아무도 눈치 못 챈 채 살아남는다.

조용한 쪽이 더 오래 살아남는다는 점에서 Q2-2의 "조용한 실패가 더 위험하다"와 같은
구조다. Zod 단일 소스에서 TS 타입과 JSON Schema를 모두 파생시키면 union의
provider별 필수 필드까지 기계적으로 반영되어 양방향 모두 원천 봉쇄된다.

**처방**: 단일 소스(예: Zod 스키마)에서 TS 타입, JSON Schema(zod → json-schema
변환기 기성품 존재), 런타임 검증을 전부 파생시키면 런타임 공백, 에디터 지원,
드리프트 세 문제가 동시에 풀린다. Q2-3 제안의 상위 버전이며 upstream 기여 후보.
