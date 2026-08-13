# Q6. 보너스 — Analytics 패턴

> 판정: ✅ 통과 (리뷰 완료)

`quartz/cfg.ts`의 `Analytics` 타입은 우리가 배운 어떤 패턴인가? 판별에 쓰이는
필드는 무엇이고, 이 패턴 덕에 소비 코드가 어떤 식으로 안전해지는지 한 줄로.

우선 Analytics는(공식 문서의 내용)는 일반 설정 중 하나로 사이트에서 사용할 분석 도구이다.
null을 포함해 여러 객체의 유니온으로 구성되어있음.
-> discriminated Union(판별 유니언)으로, Types 커리큘럼 Session5의 `ConfigResult`, `z.discriminatedUnion`을 참고하자.

또한 GlobalConfiguration 인터페이스의 필드로 지정되어있고, 사용처는 `quartz/plugins/emitters/componentResources.ts`로,
판별필드인 provider가 literal string 타입이기에 배타성을 가지며, 이 값을 기준으로 로직이 분기처리되고 있다.

line93 조건문에서 `cfg.analytics?.provider === "google"`과 같이 옵셔널 체이닝을 사용해서 null일 경우 조건문을 조용히 통과하고 있는데, 이는 공식 문서에 따르면 정확한 동작이다.(null: 분석 도구를 사용하지 않는다)
line94 에서 처럼 `const tagId = cfg.analytics.tagId`로 provider가 "google"인 경우 곧바로 tagId 필드를 사용하는
narrowing도 사용되고 있다.

또한 현재 provider 11종에 대한 조건문이 전부 if-else로 존재한다.
그러나, 신규 provider가 추가될 경우 이 부분이 문제가 될 가능성이 존재한다. 
왜냐하면 모든 분기가 불일치하기 때문에 '조용한 누락'이 발생할 수 있기 때문이다. 앞서 설명한 null처리의 '의도된 끄기'와 로직이 같은 경로를 공유한다.
`switch` + `default: never` / `Record<Provider, Handler>` 형태의 exhaustive 보장 조건이 존재하지 않기 때문에, 신규 provider가 추가되고, 그에 따른 동작이 필요할 경우 소비자가 코드를 수정해 exhaustiveness를 보장해야하는 문제가 있다.
