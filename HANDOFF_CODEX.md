# Codex 핸드오프: 인스턴스 표 최적화 마무리 + 순정/MCP 비교 하니스

> 이 문서만으로 작업이 가능하도록 작성됨. 선행 문서: [PLAN_V5.md](PLAN_V5.md)(V5 아키텍처 전체).
> 작업 순서: **Task 1 → Task 2**. Task 1은 빌드가 깨진 상태라 가장 먼저 고쳐야 한다.

---

## 0. 현재 상태 (그대로 인계됨)

- 브랜치: `main`, 마지막 커밋 `8f847d7` (V5 + 문서까지 푸시 완료)
- **미커밋 변경 3파일** (작업 중):
  - `figma-normalizer.ts` — Ollama 요청에 `format: 'json'` 추가 (소형 모델이 JSON 외 텍스트 섞는 것 방지). **이 변경은 정상, 유지할 것.**
  - `subtree-deduper.ts` — 인스턴스 표 최적화 **절반만 적용됨. 빌드 깨짐.**
  - `tests/v5.test.ts` — 신규 테스트 1개 추가됨 (`className slots keep common tokens...`).
- `npm run build` 실패: 컴파일 에러 2곳 (아래 Task 1에서 정확히 명시).
- `npm test` 8개 중 3개 실패 (컴파일 에러 때문에 deduper 관련 테스트가 깨짐).
- **Ollama 재설치 완료**: `brew install --cask ollama` → `/opt/homebrew/bin/ollama`. 깨진 심볼릭링크(`/usr/local/bin/ollama`)는 제거함. 모델 `llama3.2:latest`, `llama3.1:latest` 보유. 서버 기동: `ollama serve` (백그라운드).
- `/tmp/ditto_*.{tsx,md}` 측정 자산은 **세션 종료로 소실됨**. Figma MCP 서버도 현재 연결 끊김 → Task 2에서 재캡처 필요.

---

## Task 1 — 인스턴스 표 최적화 마무리 (빌드 복구 우선)

### 배경: 무엇을 줄이려는가

Ditto `BatteryPro` 화면(node `2478-32218`) 측정 결과, 코드 자체는 59,912자 → 정제 후 크게 줄었으나
**반복 인스턴스 데이터 표가 handoff의 60%(26KB)를 차지**하는 병목이 발견됨. 원인:
인스턴스 21개 각각에 긴 Tailwind className 문자열을 **통째로 반복** 기재.

최적화 전략 두 가지 (둘 다 `subtree-deduper.ts`에 절반 적용된 상태):
1. **공통 className 토큰 분리** — 모든 인스턴스 공통 클래스는 컴포넌트 정의(템플릿)에 1회만, prop 값에는 차이 토큰만.
   - 이미 적용됨: `PropSlot.commonClasses`, `addDifferingSlots`의 토큰 분리, `buildTemplate`의 템플릿 리터럴 치환.
2. **최빈값 기본값화** — 슬롯별 최빈값을 컴포넌트 정의의 기본 파라미터로 빼고, 인스턴스는 기본값과 다를 때만 prop 전달.
   - 절반 적용됨: `PropSlot.defaultValue` 필드 추가, `buildComponentDefinition`/`buildInstance` 시그니처 변경.
   - **미완성**: 아래 두 컴파일 에러.

### 고쳐야 할 컴파일 에러 (정확한 위치)

**에러 1 — `subtree-deduper.ts:108`**
```ts
definitions.push(buildComponentDefinition(componentName, props, template));
```
`buildComponentDefinition`의 시그니처를 `(name, props: string[], ...)` → `(name, slots: PropSlot[], ...)`로 바꿨으므로,
호출부도 `props`가 아니라 `slots`를 넘겨야 한다:
```ts
definitions.push(buildComponentDefinition(componentName, slots, template));
```

**에러 2 — `subtree-deduper.ts:281` (`addDifferingSlots` 내부)**
```ts
slot.defaultValue = mostFrequent(slot.values);
```
`mostFrequent` 헬퍼가 정의돼 있지 않다. 파일 하단 헬퍼 영역에 추가:
```ts
function mostFrequent(values: string[]): string {
    const counts = new Map<string, number>();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    let best = values[0] ?? '';
    let bestCount = 0;
    for (const [value, count] of counts) {
        if (count > bestCount) { best = value; bestCount = count; }
    }
    return best;
}
```

### 일관성 점검 (컴파일만 통과시키지 말 것)

- `components.push({ ..., props })`에서 `props`는 여전히 `slots.map(s => s.name)`로 만든 이름 배열이다.
  레지스트리에 저장되는 props 이름은 유지돼야 하므로 이 부분은 건드리지 말 것.
- `buildInstanceDataSection`은 현재 모든 인스턴스 행을 출력한다. 최빈값=기본값인 셀은
  컴포넌트 정의에서 이미 기본값으로 노출되므로, **표에서는 기본값과 다른 값만** 의미가 있다.
  표를 더 줄이려면 "기본값과 동일한 셀은 `·`(또는 빈칸)로 표기"하는 정도까지 다듬는 것을 권장(선택).
  과하게 줄여 정보 손실이 나지 않도록, 정의에 `기본값: variant="..."`를 주석으로 남길 것.

### 검증

1. `npm run build` 클린.
2. `npm test` — 기존 통과 테스트 8개 전부 녹색. 특히:
   - `className slots keep common tokens in the template and only diffs as prop values`
   - `deduplicateSubtrees extracts repeated structures only at three or more instances`
   - `registry hash match replaces repeated component definition with reuse instruction`
3. **기본값 동작 회귀 테스트 1개 추가**: 같은 구조 4회 반복 + 그중 3회가 동일 className일 때,
   컴포넌트 정의에 기본값이 박히고 인스턴스 3개는 해당 prop을 생략하는지 단언.
4. Ditto 픽스처로 재측정(Task 2의 픽스처 준비 후): 표 섹션이 26KB → **10KB 이하**로 줄었는지 확인.
   목표: handoff 전체 44KB → **~18KB(≈4,500토큰)**, 원본 59,912자 대비 70%+ 절감.

---

## Task 2 — 순정(vanilla) vs MCP(bridge) 비교 하니스

### 목적

같은 Figma 화면을 **두 경로**로 구현시켜 ① 토큰 사용량 ② 화면 정확도(픽셀)를 정량 비교한다.

- **순정(vanilla)**: 공식 Figma MCP `get_design_context` 원본 출력을 그대로 구현 LLM에 투입.
- **MCP(bridge)**: V5 `get_optimized_figma_handoff` 출력(handoff.md + 스크린샷 경로)을 투입.

### 디렉터리 구조 (신규)

```
benchmarks/
  fixtures/
    <slug>/                      # 예: ditto-battery-pro
      raw.figma.txt              # 공식 MCP get_design_context 원본 (순정 입력)
      handoff.md                 # V5 브리지 출력 (MCP 입력)
      reference.png              # Figma get_screenshot 원본 (정확도 기준 이미지)
      meta.json                  # { nodeId, fileKey, capturedAt }
  results/
    <slug>/
      vanilla.tsx                # 순정 경로로 구현된 컴포넌트
      bridge.tsx                 # 브리지 경로로 구현된 컴포넌트
      vanilla.png                # 렌더 스크린샷
      bridge.png
      report.json                # 토큰/정확도 수치
  measure-tokens.mjs             # 입력 문자수→토큰 추정 + (선택) 실제 토크나이저
  render-and-diff.mjs            # Vite 렌더 → Playwright 스크린샷 → 픽셀 diff
  README.md                      # 하니스 사용법
```

### 픽스처 캡처 (Figma 데스크톱 필요)

`/tmp`에 있던 자산은 소실됨. Figma 데스크톱에서 node `2478-32218`(fileKey `WlvYAu5ONnUe7kVcDtmuqk`)를
선택한 상태로 다음을 저장:
- 공식 MCP `get_design_context` 텍스트 → `raw.figma.txt`
- 공식 MCP `get_screenshot` PNG → `reference.png`
- 위 raw를 `FigmaNormalizer`에 통과시킨 결과 → `handoff.md`
  (Task 1의 `extractTokens` + `generateHandoffMarkdown` 직접 호출하는 캡처 스크립트를 `benchmarks/capture.mjs`로 작성)

Figma 연결이 없으면 캡처 스크립트는 "Figma 데스크톱(포트 3845)을 켜고 노드를 선택하라"고 안내 후 종료.

### 토큰 측정 (`measure-tokens.mjs`)

- 1차: 문자수 기반 추정(코드성 텍스트 ≈ 4자/토큰). 빠르고 의존성 없음.
- 2차(선택, 권장): 실제 토크나이저로 정확도 향상. **이 프로젝트의 LLM은 Claude(Anthropic)**이므로
  Anthropic 토큰 카운트 방식에 맞춰야 한다. 단순 추정으로 충분치 않다고 판단되면
  Anthropic SDK의 token counting을 사용(별도 작업 시 `/claude-api` 스킬 또는 claude-api 레퍼런스 확인).
- 스크린샷 토큰: 순정은 이미지를 인라인 포함하므로 이미지 토큰을 별도 계상.
  브리지 `path` 모드는 경로만 전달 → 이미지 토큰 0(필요 시 Read 비용은 동일 1회). 이 차이를 report에 명시.

출력 `report.json` 예시:
```jsonc
{
  "slug": "ditto-battery-pro",
  "vanilla": { "inputChars": 59912, "estInputTokens": 14978, "imageTokens": 1568 },
  "bridge":  { "inputChars": 18000, "estInputTokens": 4500,  "imageTokens": 0 },
  "savingsPct": 70.0
}
```

### 화면 정확도 (`render-and-diff.mjs`)

기존 `test/` Vite 앱(React+Tailwind, 포트 5173)을 렌더 타깃으로 재사용.

1. `results/<slug>/vanilla.tsx`와 `bridge.tsx`를 각각 `test/src/components/`에 임시 배치하고
   `App.tsx`에서 단독 마운트(라우트나 쿼리파라미터로 전환).
2. Playwright로 해당 화면을 `reference.png`와 동일 뷰포트로 스크린샷.
   - Playwright는 신규 devDependency. `npx playwright install chromium` 필요.
   - 뷰포트는 Figma 프레임 폭에 맞출 것(meta.json에 폭 기록 권장).
3. 픽셀 diff: `pixelmatch` + `pngjs`로 유사도(%) 산출. diff 이미지도 저장.
4. `report.json`에 `vanilla.similarityPct`, `bridge.similarityPct` 추가.

> 주의: 구현 LLM 호출(raw/handoff → tsx 생성)까지 이 하니스가 자동화할지는 범위를 정해서 진행.
> 1차 목표는 **"입력만 바꿔 같은 LLM에 던지고, 결과를 정량 비교"**하는 재현 가능한 절차를 만드는 것.
> LLM 생성 단계는 수동(사람이 두 입력을 각각 붙여넣어 받은 tsx를 results/에 저장)으로 시작해도 됨.
> 자동화는 그 위에 얹는다.

### 검증

- `node benchmarks/measure-tokens.mjs ditto-battery-pro` → report.json에 토큰 수치 생성.
- `node benchmarks/render-and-diff.mjs ditto-battery-pro` → 두 PNG + 유사도% + diff 이미지 생성.
- `benchmarks/README.md`에 캡처→측정→렌더→diff 전체 흐름과 새 화면 추가 방법 기술.

---

## 제약 사항 (PLAN_V5.md와 동일, 재확인)

1. stdout 오염 금지 — 로그는 전부 `console.error` (MCP stdio 채널 보호).
2. Ollama 부재 시 동작: 현재 `requireOllama` 기본 true. 측정 스크립트에서는 `requireOllama: false`로 우회 가능.
3. 기존 도구명·무인자 호출 동작 호환 유지. 새 입력 필드는 전부 optional.
4. `test/`(Vite 데모)는 렌더 타깃으로 재사용하되, 데모 자체 구조를 깨지 말 것.
   벤치마크 산출물은 `benchmarks/`에 격리.
5. 커밋은 논리 단위로 분리: (a) Task1 표 최적화 (b) 벤치마크 하니스.
6. `benchmarks/results/`, `benchmarks/fixtures/*/reference.png` 등 대용량/생성물은
   `.gitignore` 정책을 정해 커밋 여부를 명시(픽스처 입력은 커밋, 렌더 결과물은 제외 권장).

---

## 빠른 시작 (Codex 첫 5분)

```bash
# 1. 현재 깨진 빌드 확인
npm run build          # 에러 2개 확인 (subtree-deduper.ts:108, :281)

# 2. Task 1 수정 후
npm run build && npm test   # 클린 + 8 pass 목표

# 3. Ollama 살아있는지
ollama serve &              # 이미 떠 있으면 생략
curl -s localhost:11434/api/tags | head -c 200
```
