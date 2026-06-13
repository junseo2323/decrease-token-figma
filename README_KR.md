# Figma Cost Optimizer Bridge (V5)

<div align="right">
  <a href="./README.md">English</a> | <strong>한국어</strong>
</div>

**Figma Cost Optimizer Bridge**는 Claude, ChatGPT, Codex 같은 LLM이 Figma 화면을 구현할 때 발생하는 **과도한 토큰 사용량과 컨텍스트 오염**을 줄이기 위한 로컬 MCP(Model Context Protocol) 브리지입니다.

공식 Figma MCP의 `get_design_context`는 실제 구현에 필요하지 않은 메타데이터, 절대 좌표, 인라인 SVG, 반복되는 긴 `className` 문자열을 많이 포함합니다. 이 브리지는 해당 출력을 받아 **정제된 React 뼈대 코드 + 스크린샷 경로 + 반복 인스턴스 데이터** 형태로 압축해 LLM에게 전달합니다.

> 핵심 아이디어: 구조와 디자인 토큰은 텍스트로, 실제 레이아웃 판단은 스크린샷으로 보낸다.

---

## 최신 벤치마크

Ditto `BatteryPro` 화면(node `2478-32218`) 기준 실제 캡처/렌더/diff 결과입니다.

| 경로 | 입력 문자 수 | 추정 텍스트 토큰 | 이미지 토큰 | 총 추정 토큰 | 픽셀 유사도 |
|---|---:|---:|---:|---:|---:|
| 공식 Figma MCP raw | 52,696 | 13,174 | 510 | 13,684 | 92.97% |
| Bridge handoff | 30,727 | 7,682 | 0 | 7,682 | 96.77% |

**추정 입력 토큰 절감률: 43.86%**

반복 인스턴스 데이터 표는 기존 병목이던 26KB 수준에서 **3,978자**까지 줄었습니다. 자세한 이미지 비교는 [한국어 벤치마크 리포트](./docs/BENCHMARK_RESULTS_KR.md)를 참고하세요.

---

## 주요 기능

- **토큰 절감:** Figma 원본의 불필요한 메타데이터, 절대 좌표, 반복 className, data 속성을 제거하거나 압축합니다.
- **스크린샷 path 모드:** 이미지를 인라인으로 보내지 않고 로컬 PNG 경로만 전달해 기본 호출의 이미지 토큰을 줄입니다.
- **반복 구조 dedupe:** 3회 이상 반복되는 JSX 구조를 컴포넌트 정의 + 인스턴스 호출 + 데이터 표로 압축합니다.
- **공통 className 토큰 분리:** 모든 인스턴스가 공유하는 Tailwind 토큰은 템플릿에 1회만 남기고, prop에는 차이 토큰만 전달합니다.
- **최빈값 기본값화:** 슬롯별 최빈값을 컴포넌트 기본 파라미터로 빼서 같은 값의 prop 전달을 생략합니다.
- **해시 캐시:** 같은 Figma 응답은 재분석하지 않고 캐시된 handoff를 재사용합니다.
- **Diff handoff:** 이전 버전이 있으면 바뀐 부분만 전달하고, 변경량이 크면 전체 handoff로 자동 폴백합니다.
- **로컬 컴포넌트 레지스트리:** 이미 추출한 반복 구조와 프로젝트 컴포넌트를 재사용 후보로 기억합니다.
- **Ollama 사전 분석:** 로컬 Ollama로 색상/텍스트/요약을 분석합니다. MCP 서버 시작 시 설치/실행/모델 준비를 도와줍니다.
- **벤치마크 하니스:** raw vs bridge 입력 토큰, Playwright 렌더 스크린샷, pixelmatch 유사도를 재현 가능하게 측정합니다.

---

## 설치

권장 설치 방법은 npm 전역 설치입니다.

```bash
npm install -g decrease-token-figma
figma-bridge
```

GitHub에서 직접 설치하려면:

```bash
npm install -g github:junseo2323/decrease-token-figma
figma-bridge
```

개발용 로컬 설치:

```bash
git clone https://github.com/junseo2323/decrease-token-figma.git
cd decrease-token-figma
npm install
npm run build
npm link
figma-bridge
```

Ollama는 `figma-bridge` 시작 시 자동 준비됩니다. 미리 준비하려면 다음을 실행하세요.

```bash
npm run setup
```

---

## MCP 클라이언트 설정

Claude Desktop, Codex, Cursor 등 MCP 클라이언트에 아래처럼 등록합니다.

```json
{
  "mcpServers": {
    "figma-cost-optimizer-bridge": {
      "command": "npx",
      "args": ["-y", "decrease-token-figma"],
      "env": {
        "FIGMA_BRIDGE_ROOT": "/absolute/path/to/your/app"
      }
    }
  }
}
```

GitHub 설치 버전을 바로 쓰려면:

```json
{
  "mcpServers": {
    "figma-cost-optimizer-bridge": {
      "command": "npx",
      "args": ["-y", "github:junseo2323/decrease-token-figma"],
      "env": {
        "FIGMA_BRIDGE_ROOT": "/absolute/path/to/your/app"
      }
    }
  }
}
```

### 필수 전제

- Figma Desktop 앱 실행
- Figma local MCP 서버가 `127.0.0.1:3845`에서 동작
- 변환할 Figma 노드 선택
- 로컬 프로젝트 경로를 `FIGMA_BRIDGE_ROOT` 또는 도구 인자 `projectRoot`로 지정

---

## 제공 MCP 도구

### `get_optimized_figma_handoff`

현재 선택된 Figma 노드를 가져와 최적화된 handoff markdown과 스크린샷 정보를 반환합니다.

| 인자 | 값 | 기본값 | 설명 |
|---|---|---|---|
| `projectRoot` | 절대 경로 | `FIGMA_BRIDGE_ROOT` 또는 cwd | 에셋과 캐시를 저장할 프로젝트 루트 |
| `screenshot` | `path` / `inline` / `none` | `path` | `path`는 PNG를 캐시에 저장하고 절대 경로만 전달합니다. `inline`은 파일 접근이 없는 클라이언트용입니다 |
| `mode` | `auto` / `full` / `diff` | `auto` | 이전 버전이 있으면 diff, 없으면 full handoff |
| `force_refresh` | boolean | `false` | 해시가 같아도 캐시를 무시하고 다시 캡처 |

### `sync_component_registry`

`<projectRoot>/src/components/*.tsx`를 스캔해 로컬 컴포넌트 레지스트리를 갱신합니다. 이후 handoff에서 구조가 비슷한 컴포넌트를 발견하면 재사용 힌트를 제공합니다.

---

## 작동 흐름

1. 사용자가 Figma Desktop에서 노드를 선택합니다.
2. LLM이 `get_optimized_figma_handoff`를 호출합니다.
3. 브리지가 공식 Figma MCP에서 raw design context와 screenshot을 가져옵니다.
4. 이미지 에셋을 프로젝트의 `src/assets` 또는 설정된 asset dir에 저장합니다.
5. raw TSX를 정제하고 반복 구조를 압축합니다.
6. Ollama가 요약/색상/텍스트를 사전 분석합니다.
7. LLM은 handoff markdown과 screenshot을 기반으로 실제 React/Tailwind 구현을 작성합니다.

---

## 캐시 구조

```text
.figma_cache/
  nodes/ChatScreen_a3f29c01/
    raw.txt
    handoff.md
    diff.md
    screenshot.png
    meta.json
  registry.json
```

- raw 응답 해시가 같으면 Figma 재요청과 정제를 건너뜁니다.
- 컴포넌트당 최신 2개 버전을 유지합니다.
- `mode: auto`에서는 이전 버전이 있을 때 diff handoff를 생성합니다.

---

## 환경 변수

| 변수 | 설명 |
|---|---|
| `FIGMA_BRIDGE_ROOT` | 프로젝트 루트. 에셋/캐시 기준 경로 |
| `FIGMA_BRIDGE_CACHE_DIR` | 캐시 디렉토리 override |
| `FIGMA_BRIDGE_ASSET_DIR` | 이미지 에셋 저장 디렉토리 override |
| `OLLAMA_BIN` | 사용할 Ollama 실행 파일 경로 |
| `FIGMA_BRIDGE_OLLAMA_MODEL` | 사용할 Ollama 모델. 기본 `llama3.2` |
| `FIGMA_BRIDGE_OLLAMA_AUTO_INSTALL=0` | Ollama 자동 설치 비활성화 |
| `FIGMA_BRIDGE_OLLAMA_AUTO_PULL=0` | 모델 자동 다운로드 비활성화 |

---

## npm 스크립트

```bash
npm run build              # TypeScript 빌드
npm test                   # 단위 테스트
npm run setup              # Ollama 설치/서버 실행/모델 다운로드
npm run measure            # .figma_cache/handoff.md 문자/토큰 추정
npm run benchmark:capture  # Figma fixture 캡처
npm run benchmark:tokens   # raw vs bridge 토큰 측정
npm run benchmark:diff     # Vite 렌더 + pixel diff
```

---

## 벤치마크 재현

```bash
npm install
npm run build
npx playwright install chromium

# Figma Desktop에서 대상 노드를 선택한 상태로 실행
npm run benchmark:capture -- ditto-battery-pro 2478-32218 WlvYAu5ONnUe7kVcDtmuqk
npm run benchmark:tokens -- ditto-battery-pro
npm run benchmark:diff -- ditto-battery-pro
```

결과는 다음 경로에 저장됩니다.

```text
benchmarks/fixtures/<slug>/
benchmarks/results/<slug>/
```

---

## GitHub Pages

문서 사이트:

- English: https://junseo2323.github.io/decrease-token-figma/
- 한국어: https://junseo2323.github.io/decrease-token-figma/index.ko.html
- 한국어 벤치마크: https://junseo2323.github.io/decrease-token-figma/BENCHMARK_RESULTS_KR.html

이 프로젝트는 원격 서버에 배포해서 쓰는 서비스가 아닙니다. 사용자의 Figma Desktop, 로컬 파일시스템, 선택된 Figma 노드에 접근해야 하므로 **로컬 MCP 서버로 실행**하는 방식이 맞습니다. 원격 배포는 GitHub Pages 같은 문서/랜딩 페이지 용도로만 사용하세요.

---

## LLM 구현 가이드

- 레이아웃은 스크린샷을 보고 결정합니다.
- 텍스트, 색상, spacing token은 handoff 코드에서 가져옵니다.
- 이미지 변수명은 역할에 맞게 리팩토링합니다.
- 인라인 SVG를 그대로 복사하지 말고 가능한 한 `lucide-react` 등 아이콘 컴포넌트로 대체합니다.
- 반복 인스턴스 데이터 표에서 `·`는 컴포넌트 기본값과 같다는 뜻입니다.

---

## 라이선스

MIT License. 자유롭게 수정하고 활용하세요.
