# 기획안: Figma Cost Optimizer Bridge V5 — "기억하는 브리지"

> 이 문서는 구현 담당 AI 에이전트(Codex)에게 전달되는 작업 지시서입니다.
> 대화 맥락 없이 이 문서만으로 구현이 가능하도록 작성되었습니다.

---

## 1. 프로젝트 배경

이 저장소는 **Figma 공식 로컬 MCP 서버(포트 3845)를 감싸는 프록시 MCP 서버**입니다.
공식 `get_design_context`가 뱉는 거대한 메타데이터·인라인 SVG·절대좌표를 가로채
"경량 스켈레톤 코드 + 스크린샷"으로 압축하여 LLM(Claude)의 토큰 소비를 줄입니다.

### 현재 아키텍처 (V4)

```
AI Agent (Claude)
   │  ① get_optimized_figma_handoff 호출 (MCP stdio)
   ▼
index.ts ─── MCP 서버 본체. 도구 1개 노출
   │  ② FigmaProxy로 Figma 로컬 MCP(127.0.0.1:3845/sse)에 연결
   ▼
figma-proxy.ts ─── get_design_context / get_screenshot 호출, .figma_cache에 원본 저장
   │  ③ 원본 텍스트 전달
   ▼
figma-normalizer.ts ─── 압축 핵심 로직
   │   - JSX 포맷: 에셋 다운로드(src/assets), 인라인 SVG → 주석/컴포넌트 치환,
   │     절대좌표 className 제거, data-node-id 제거
   │   - XML 포맷(복수 선택): 좌표·장식 제거
   │   - Ollama(llama3.2)로 색상/텍스트 사전 분석 (실패 시 건너뜀)
   ▼
.figma_cache/handoff.md 생성 → index.ts가 읽어서 [마크다운 + 스크린샷 이미지] 반환
```

### 파일별 역할

| 파일 | 역할 |
|---|---|
| `index.ts` | MCP 서버. 도구 `get_optimized_figma_handoff` 정의·핸들러 |
| `figma-proxy.ts` | Figma 로컬 MCP 클라이언트 (SSE). 선택 노드/스크린샷 가져오기 |
| `figma-normalizer.ts` | 압축·정제 로직 전부. `extractTokens()` → `generateHandoffMarkdown()` |
| `ollama-helper.ts` | Ollama 서버/모델 보장 유틸 |
| `handoff-to-react.ts` | CLI 버전 (MCP 없이 직접 실행, test/ 폴더에 컴포넌트 생성) |
| `test/` | 결과 검증용 Vite + React + Tailwind 앱 |
| `build/` | tsc 출력 (`npm run build`) |

### 핵심 동작 원칙 (변경 금지)

- Ollama가 없거나 실패해도 파이프라인은 계속 진행된다 (graceful degradation).
- 모든 진행 로그는 `console.error`로 출력한다 (stdout은 MCP stdio 채널이므로 오염 금지).
- 기존 도구 이름 `get_optimized_figma_handoff`와 기본 동작(인자 없이 호출 시)은 유지한다.

---

## 2. V5 목표

**"쓸수록 싸지는 파이프라인."** 한 번 본 것은 기억하고, 두 번째부터는 차이만 말한다.

| # | 기능 | 기대 효과 |
|---|---|---|
| Phase 0 | 기반 정비 (절대경로, 해시 캐시, 스크린샷 경로 모드) | 이후 모든 Phase의 토대 |
| Phase 1 | 반복 서브트리 중복 제거 | 반복 많은 화면에서 70~90% 추가 압축 |
| Phase 2 | 로컬 컴포넌트 레지스트리 (Local Code Connect) | 두 번째 화면부터 기존 컴포넌트 재사용 유도 |
| Phase 3 | Diff 핸드오프 | 디자인 수정 반영 호출을 수십 토큰으로 |

### 비목표 (이번 범위 아님)

- 로컬 LLM으로 React 코드 초안 생성 (V6 후보)
- Playwright 기반 시각 검증 루프 (V6 후보)
- Figma 유료 API / 공식 Code Connect 연동

---

## 3. Phase 0 — 기반 정비 (선행 필수)

### 3-1. 경로의 절대화

현재 `.figma_cache`와 에셋 저장 경로가 `process.cwd()` 기준 상대 경로다.
MCP 서버의 cwd는 클라이언트가 결정하므로 글로벌 설치 시 엉뚱한 곳에 저장된다.

- 환경변수 `FIGMA_BRIDGE_ROOT`를 도입한다. 미설정 시 `process.cwd()` 사용.
- 캐시 루트: `<ROOT>/.figma_cache`, 에셋: `<ROOT>/src/assets`.
- 도구 결과에 포함되는 모든 파일 경로는 **절대 경로**로 표기한다 (Claude가 Read 도구로 읽을 수 있어야 함).

### 3-2. rawText 해시 캐시

- `get_design_context` 응답(rawText)의 SHA-256 해시 앞 8자리를 캐시 키로 쓴다.
- 캐시 구조:
  ```
  .figma_cache/
    nodes/<componentName>_<hash8>/
      raw.txt          # 원본
      handoff.md       # 정제 결과
      screenshot.png   # 스크린샷 (있는 경우)
      meta.json        # { componentName, hash, nodeIds, createdAt, figmaName }
  ```
- 같은 해시가 이미 있으면: Figma 스크린샷 재요청과 정제·Ollama 분석을 건너뛰고 캐시를 반환한다.
- 같은 `componentName`의 다른 해시(구버전)는 Phase 3의 diff 소스로 보존한다.
  단, 컴포넌트당 최신 2개만 유지하고 나머지는 삭제한다.

### 3-3. 스크린샷 경로 모드

도구 입력 스키마를 확장한다:

```jsonc
{
  "screenshot": { "enum": ["path", "inline", "none"], "default": "path" },
  "force_refresh": { "type": "boolean", "default": false }
}
```

- `path` (기본): 이미지를 base64로 반환하지 않고 캐시에 PNG로 저장한 뒤,
  handoff.md에 절대 경로를 적는다. 지시문에 "레이아웃 판단 전 반드시 이 이미지를 Read 도구로 읽어라"를 추가한다.
- `inline`: 현재 V4 동작 (파일시스템 접근이 없는 클라이언트 호환용).
- `none`: 텍스트만 반환.
- `force_refresh: true`: 해시가 같아도 캐시를 무시하고 전체 파이프라인을 다시 돈다.

### 3-4. 잔여 코드 정리 (작은 작업)

- `extractComponentName` 로직이 `index.ts`, `figma-proxy.ts`, `handoff-to-react.ts`에 3중 복사되어 있다.
  `figma-proxy.ts`의 것을 `export`하고 나머지는 재사용한다.
- `figma-normalizer.ts`의 `replace(/\sclassName=/g, ' className=')`는 no-op이므로 제거.
- `figma-proxy.ts`의 `disconnect()`에서 `this.client.close()`를 사용한다.

---

## 4. Phase 1 — 반복 서브트리 중복 제거

### 문제

실제 화면은 같은 컴포넌트의 반복이다 (채팅 버블 12개, 카드 20개).
현재는 반복 markup을 그대로 12번, 20번 전달한다.

### 설계

`figma-normalizer.ts`에 `deduplicateSubtrees(code: string)` 단계를 추가한다.
JSX 정제 완료 후, Ollama 분석 전에 실행한다.

1. **서브트리 파싱**: 정제된 JSX에서 JSX 엘리먼트 트리를 파싱한다.
   외부 파서 의존성을 피하고 싶다면 균형 잡힌 태그 매칭 기반의 경량 파서를 직접 작성한다
   (입력이 Figma 생성 코드라 형태가 규칙적이므로 충분하다). 필요하다면 의존성 추가도 허용한다.
2. **구조 해시**: 각 서브트리에 대해 "텍스트 내용·이미지 src·일부 가변 클래스를 와일드카드로 치환한 구조 시그니처"를 만들어 해시한다.
3. **그룹화**: 동일 시그니처가 **3회 이상** 반복되고, 서브트리 크기가 **3개 이상의 엘리먼트**일 때만 추출 대상으로 삼는다 (사소한 div 반복까지 추출하면 오히려 노이즈).
4. **출력 형태**: handoff.md의 코드 블록을 다음 구조로 바꾼다.

```tsx
// ── 반복 컴포넌트 정의 (1회만) ──
function MessageBubble({ text, align, timestamp }: { text: string; align: "left" | "right"; timestamp: string }) {
  return ( /* 공통 구조, 가변부는 props 참조 */ );
}

// ── 화면 구성 ──
function ChatScreen() {
  return (
    <div className="...">
      <MessageBubble text="안녕하세요" align="left" timestamp="14:02" />
      <MessageBubble text="네 반갑습니다" align="right" timestamp="14:03" />
      {/* ... 총 12개 — 전체 데이터: 아래 표 참조 */}
    </div>
  );
}
```

5. **인스턴스 데이터 표**: 반복이 5회를 넘으면 JSX 인스턴스도 3개까지만 예시로 남기고,
   나머지는 마크다운 표(또는 JSON 배열)로 가변 값만 나열한다.
6. **가변부 추론**: 그룹 내 인스턴스끼리 텍스트/src/클래스가 다른 지점을 자동으로 props로 승격한다.
   props 이름은 휴리스틱(텍스트 → `text`, 이미지 → `imageSrc`, 클래스 차이 → `variant`)으로 짓되,
   Ollama가 가용하면 더 시맨틱한 이름을 제안받는다 (실패 시 휴리스틱 이름 유지).

### 수용 기준

- 동일 구조 3회 이상 반복되는 화면에서, 출력 문자 수가 V4 대비 50% 이상 감소.
- 반복이 없는 화면에서는 출력이 V4와 동일 (회귀 없음).
- 추출된 컴포넌트 정의 + 인스턴스 표만으로 원본 화면을 복원할 수 있을 것 (정보 무손실).

---

## 5. Phase 2 — 로컬 컴포넌트 레지스트리 (Local Code Connect)

### 문제

프로젝트에 이미 `Button.tsx`, `ChatInput.tsx`가 있어도 매번 스켈레톤을 처음부터 전달한다.
Figma 공식 Code Connect는 유료 기능이므로 로컬에서 대체한다.

### 설계

1. **레지스트리 파일**: `<ROOT>/.figma_cache/registry.json`

```jsonc
{
  "components": [
    {
      "name": "MessageBubble",
      "filePath": "src/components/MessageBubble.tsx",   // ROOT 기준 상대 경로
      "structureHash": "a3f29c01",                       // Phase 1의 구조 시그니처 해시
      "props": ["text", "align", "timestamp"],
      "source": "bridge",                                // bridge 생성 | scan 발견
      "lastSeen": "2026-06-13T09:00:00Z"
    }
  ]
}
```

2. **등록 경로 두 가지**:
   - **자동**: Phase 1이 컴포넌트를 추출할 때마다 구조 해시와 함께 레지스트리에 기록 (`source: "bridge"`).
   - **스캔**: 새 도구 `sync_component_registry` 추가. `<ROOT>/src/components/*.tsx`를 훑어
     export된 컴포넌트명·props 시그니처(타입 어노테이션 정규식 파싱)를 등록 (`source: "scan"`).
     구조 해시는 스캔만으로 알 수 없으므로 비워두고, 이름 매칭의 보조로만 쓴다.
3. **핸드오프 시 매칭**: Phase 1에서 만든 각 그룹의 구조 해시를 레지스트리와 대조한다.
   - **해시 일치**: 컴포넌트 정의를 출력하지 않고 한 줄로 치환한다.
     ```tsx
     {/* ✅ 기존 컴포넌트 재사용: src/components/MessageBubble.tsx — 새로 만들지 마라 */}
     <MessageBubble text="안녕하세요" align="left" timestamp="14:02" />
     ```
   - **이름만 유사** (Figma 레이어명 vs 레지스트리 이름, 대소문자 무시 일치): 확정 치환은 하지 않고
     handoff.md 상단에 "유사 컴포넌트 존재: src/components/ChatInput.tsx — 먼저 Read 후 재사용 검토"라는 힌트를 추가한다.
4. **무효화**: 레지스트리의 `filePath`가 더 이상 존재하지 않으면 해당 항목을 핸드오프 시점에 제거한다.

### 수용 기준

- 같은 컴포넌트가 포함된 두 번째 화면 핸드오프에서, 해당 컴포넌트 정의가 출력에서 빠지고 재사용 지시로 대체될 것.
- 레지스트리 파일이 깨져 있어도 (JSON 파싱 실패) 빈 레지스트리로 간주하고 진행할 것.

---

## 6. Phase 3 — Diff 핸드오프

### 문제

디자이너가 수정하면 같은 화면을 다시 가져와야 하는데, 매번 전체 핸드오프를 전달한다.

### 설계

1. Phase 0의 캐시에서 같은 `componentName`의 직전 해시 버전을 찾는다.
2. 있으면 **정제된 코드끼리** 비교한다 (원본 rawText가 아니라 정제 결과 기준 — 좌표 노이즈가 이미 제거된 상태라 diff가 깨끗함).
3. diff 추출은 줄 단위 LCS(또는 `diff` npm 패키지)로 하되, 출력은 unified diff가 아니라 **자연어 + 값 쌍**으로 요약한다:

```markdown
# 🔄 Diff Handoff: ChatScreen (이전 버전 a3f29c01 → 현재 9b1d44e2)

이 화면은 이미 구현되어 있다 (참고: src/components/ChatScreen.tsx 존재 시 명시).
아래 변경 사항만 코드에 반영하라. 나머지는 절대 다시 작성하지 마라.

## 변경 사항 (3건)
1. 텍스트 변경: "전송" → "보내기" (ChatInput 버튼)
2. 색상 변경: bg-[#3B82F6] → bg-[#2563EB] (전송 버튼 배경)
3. 요소 추가: MessageBubble 아래 읽음 표시 <span>읽음</span> 추가
   ```tsx
   <span className="text-xs text-[#9CA3AF]">읽음</span>
   ```
```

4. **요소 추가/삭제**처럼 값 쌍으로 표현 안 되는 변경은 해당 JSX 조각만 코드 블록으로 첨부한다.
5. **변경량 가드**: 변경된 줄이 전체의 40%를 넘으면 diff가 의미 없으므로 전체 핸드오프로 폴백하고,
   "변경이 많아 전체를 다시 전달합니다"를 명시한다.
6. 스크린샷: diff 모드에서도 새 스크린샷을 캡처·저장하고 경로를 전달한다 (시각 확인은 항상 최신 기준).
7. 도구 입력에 `mode: "auto" | "full" | "diff"` 추가. 기본 `auto` = 캐시에 이전 버전이 있으면 diff, 없으면 full.

### 수용 기준

- 텍스트 1곳, 색상 1곳을 바꾼 재호출에서 출력이 전체 핸드오프 대비 90% 이상 작을 것.
- 첫 호출(캐시 없음)은 V4와 동일하게 전체 핸드오프가 나갈 것.
- 변경량 40% 초과 시 전체 핸드오프로 폴백할 것.

---

## 7. 작업 순서와 검증 방법

```
Phase 0 → 1 → 2 → 3  (순서 의존성 있음, 병렬 진행 금지)
각 Phase 완료 시 npm run build 통과 + 아래 수동 검증
```

- **검증 데이터**: `.figma_cache/`에 실제 Figma 응답 캐시(`selection_*.tsx`)와 `raw_figma.txt`(XML 샘플)가 있다.
  Figma 데스크톱 없이도 `FigmaNormalizer`를 직접 호출하는 스크립트로 입력→출력을 검증할 수 있다.
- **단위 테스트 도입**: `tests/` 디렉터리에 vitest(또는 node:test)를 도입하고,
  최소한 다음을 커버한다 — 해시 캐시 히트/미스, 서브트리 중복 감지(3회 미만은 미추출),
  레지스트리 매칭, diff 생성, 40% 폴백.
  ⚠️ 기존 `test/` 디렉터리는 Vite 데모 앱이므로 건드리지 말 것. 테스트는 `tests/`에 새로 만든다.
- **토큰 측정**: 각 Phase 전후로 출력 문자 수를 비교해 README의 성능 표를 갱신할 수 있도록
  `compare.js`(기존 파일)와 유사한 측정 스크립트를 `scripts/measure.js`로 정리한다.

## 8. 제약 사항 요약

1. stdout 오염 금지 — 로그는 전부 `console.error`.
2. Ollama 부재 시에도 전 기능 동작 (분석·이름 제안만 빠짐).
3. 기존 도구명·무인자 호출 동작 호환 유지. 새 입력 필드는 전부 optional + 기본값.
4. 루트의 레거시 스크립트(`compare.js`, `sim*.js`, `run-client.*`, `test-normalizer.*`, `my-*.js` 등)는 이번 작업 범위가 아니다. 수정·삭제하지 말 것.
5. 새 의존성은 최소화하되 필요 시 허용 (diff, 경량 JSX 파서 등). 추가 시 이유를 커밋 메시지에 명시.
6. 커밋은 Phase 단위로 분리한다.
