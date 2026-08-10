# 용어 정리 (세션 진행 중 문답)
### 겹침 부족 (No Overlap)
Q2에서 언급한 겹침 부족.

as가 무조건적으로 허용되는 것은 아니다. 전/후 타입이 방향과 관게 없이 부분 집합 관계일 경우에만 허용된다. -> 이를 'Sufficiently Overlaps', 충분히 겹침으로 부르고 이 조건을 불충할 시 다음 에러가 발생한다.

`Conversion of type 'X' to type 'Y' may be a mistake because neither type sufficiently overlaps with the other.`

그리고 이러한 불충 상황을 '겹침 부족' 이라고 칭한 것이다.
ex)
- `"hello" as number` -> string vs number
- `Record<string, unknown> as GlobalConfiguration` 
    - Record -> GlobalConfiguration: 필수 프로퍼티가 없으면 불가, 필드 타입 불일치 (ex. pageTitle: unknown != string)
    - GlobalConfiguration -> Record: 인터페이스는 암묵적 인덱스 시그니처가 없어 불가능

### 암묵적 인덱스 시그니처 (Implicit Index Signature)

#### 인덱스 시그니처란? 
"키를 특정하지 않고, 어떤 키로 접근하든 값은 이 타입" 이라고 선언하는 문법

ex)
`type Dict = { [key: string]: number }; // 어떤 문자열 키로 읽어도 값은 number 타입`
`Record<string, unknown>; // Record 정의(` { [P in K]: V }`)에서 K = string 인 경우`

#### '암묵적'?
ex)
```ts
type ConfigT = { pageTitle: string; baseUrl: string };
declare const c: configT;

const r: Record<string, unknown> = c; // 가능한 것인가?
```

key는 전부 string이나 값이 string인 configT `type`이 Record<string, unknown>으로의 대입이 허용되어야할까?

TS는 아래의 규칙을 둔다.
"객체 타입의 모든 프로퍼티가 인덱스 시그니처의 값 타입에 대입 가능하면, 그 객체 타입에 인덱스 시그니처가 "있는 것처럼" 취급해서 대입을 허용한다."

위 규칙상으로는, ConfigT의 모든 프로퍼티(string, string)는 unknown에 대입 가능하고, 없는 키를 읽으면 undefined(이것도 unknown에 포함)니까, 어떤 키로 읽든 계약 위반이 일어날 수 없다. 즉, 가능.

그러나 type이 아닌 interface는 불가능(제외)하다.
interface 특성상, 선언 병합으로 열려 있기 때문에, 동일한 이름으로 interface가 선언되어서 멤버에 변경이 일어날 수 있으므로, 모든 프로퍼티가 값 타입에 대입 가능하다는 것이 보장되지 않기 때문.
(반면 type은 중복 선언 불가능)


