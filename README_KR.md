# 🎨 Figma Cost Optimizer Bridge (V5)

<div align="right">
  <a href="./README.md">🇺🇸 English</a> | <strong>🇰🇷 한국어</strong>
</div>

**Figma Cost Optimizer Bridge**는 LLM(Claude, GPT 등)을 활용한 프론트엔드 UI/UX 자동화 개발 시 발생하는 **치명적인 토큰 소모 및 컨텍스트 오염을 방지**하기 위해 구축된 커스텀 로컬 프록시 MCP(Model Context Protocol) 파이프라인입니다.

기존 공식 Figma MCP 도구(`get_design_context`)가 무분별하게 내뿜는 방대한 메타데이터, 인라인 SVG 코드, 고정 픽셀 좌표들을 가로채어 **"초경량 반응형 뼈대 코드 + 화면 스크린샷"** 형태로 무손실 압축하여 반환합니다. 이를 통해 API 호출 비용을 최대 80% 절감하면서도 AI의 코드 렌더링 정확도를 극대화할 수 있습니다.

---

## ✨ 핵심 기능 (V4 Pipeline)

- 💸 **비용 최소화 (Token Optimization):** 방대한 메타데이터, 선택되지 않은 노드 정보, 불필요한 속성(`data-node-id` 등)을 완벽히 제거하여 한 번의 호출 당 15,000 토큰 -> **대략 2,000 ~ 4,000 토큰**으로 대폭 압축합니다.
- 📱 **반응형 뼈대 변환 (Responsive Skeleton):** 피그마의 절대 좌표(`absolute`, `top`, `left`)와 고정 너비/높이 픽셀을 정규식으로 제거하고, 남겨진 구조와 스크린샷 이미지를 통해 LLM이 완벽한 Flex/Grid 기반 Tailwind 반응형 코드를 짜도록 유도합니다.
- 📥 **에셋 자동 다운로드 (Asset Auto-fetcher):** 컴포넌트에 포함된 피그마 로컬 이미지 URL을 추적하여 자동으로 현재 프로젝트의 `src/assets` 폴더에 다운로드하고 import 문을 생성합니다. (파일명 충돌 방지 로직 포함)
- 🎨 **디자인 토큰 자동 추출:** 하드코딩된 HEX/RGBA 색상 코드를 긁어모아 사용된 컬러 팔레트를 요약 제공함으로써 LLM이 일관된 테마를 구성하도록 돕습니다.
- 💡 **인라인 SVG 정제:** 토큰 낭비의 주범인 인라인 `<svg>` 코드를 `{/* SVG Icon: ChevronRight */}`와 같은 PascalCase 주석으로 치환하여 `lucide-react` 매핑을 돕습니다.
- 🤖 **필수 로컬 AI 부트스트랩:** 로컬 디자인 토큰 사전 분석을 위해 Ollama를 필수로 사용합니다. MCP 서버가 시작될 때 Ollama 설치 여부를 확인하고, 가능하면 자동 설치, 서버 실행, 기본 `llama3.2` 모델 다운로드까지 수행합니다.

---

## 🚀 설치 방법

이 패키지는 로컬 환경 어디서든 글로벌 CLI 모드로 실행 가능하도록 설계되었습니다.

```bash
# 1. 저장소 클론
git clone https://github.com/사용자계정/decrease-token-figma.git
cd decrease-token-figma

# 2. 전역(Global) 패키지로 빌드 및 링크
# (주의: Mac/Linux 환경에선 권한 문제로 sudo가 필요할 수 있습니다.)
npm run build
sudo npm link 
# 또는 sudo npm install -g .
```

Ollama는 `figma-bridge` 시작 시 자동으로 준비됩니다. 미리 준비하려면 `npm run setup`을 실행해 Ollama 설치, 서버 실행, 기본 `llama3.2` 모델 다운로드를 수동으로 수행할 수 있습니다.

---

## 🛠 사용 방법

설치가 완료되면 PC의 어느 디렉토리에서든 아래 커맨드를 통해 프록시 서버(MCP)를 실행할 수 있습니다.

```bash
figma-bridge
```

Claude Desktop 같은 전역 MCP 클라이언트의 작업 디렉토리가 앱 프로젝트가 아닐 수 있습니다. 이 경우 `get_optimized_figma_handoff` 도구에 `projectRoot`를 전달하거나 `FIGMA_BRIDGE_ROOT=/absolute/path/to/project` 환경변수를 설정하세요. 에셋은 기본적으로 `<projectRoot>/src/assets`에 저장됩니다. 필요하면 `FIGMA_BRIDGE_CACHE_DIR`, `FIGMA_BRIDGE_ASSET_DIR`도 별도로 지정할 수 있습니다.

Ollama 부트스트랩 환경변수:

- `OLLAMA_BIN=/absolute/path/to/ollama`: 특정 Ollama 실행 파일을 사용합니다.
- `FIGMA_BRIDGE_OLLAMA_MODEL=llama3.2`: 필수 모델명을 바꿉니다.
- `FIGMA_BRIDGE_OLLAMA_AUTO_INSTALL=0`: 런타임 자동 설치를 끄고, Ollama가 없으면 실패합니다.
- `FIGMA_BRIDGE_OLLAMA_AUTO_PULL=0`: 런타임 모델 다운로드를 끄고, 모델이 없으면 실패합니다.

### 작동 프로세스
1. 백그라운드에서 실행 중인 **Figma 데스크탑 앱 로컬 API(포트 3845)**와 연결됩니다.
2. AI(Claude 데스크탑 등)에게 `get_optimized_figma_handoff` 라는 도구를 제공합니다.
3. 사용자가 피그마 화면에서 변환할 컴포넌트를 선택하고 AI에게 렌더링을 지시하면:
   - figma-bridge가 원본 코드를 가져옵니다.
   - 스크린샷을 찍습니다.
   - 설정된 에셋 디렉토리에 이미지를 다운로드하고 코드를 무손실 압축합니다.
   - 정제된 마크다운 뼈대 코드(`handoff.md`)와 스크린샷 이미지를 AI에게 반환합니다.

---

## 🧠 V5 사용 가이드 — "기억하는 브리지"

V5부터 브리지는 한 번 본 디자인을 기억합니다. 같은 것을 두 번 보내지 않고, 바뀐 것만 말합니다.

### 도구 입력 옵션

`get_optimized_figma_handoff` 도구는 다음 인자를 받습니다 (전부 선택 사항).

| 인자 | 값 | 기본값 | 설명 |
|---|---|---|---|
| `projectRoot` | 절대 경로 | `FIGMA_BRIDGE_ROOT` 또는 cwd | 에셋·캐시를 저장할 프로젝트 루트 |
| `screenshot` | `path` / `inline` / `none` | `path` | `path`는 PNG를 캐시에 저장하고 **절대 경로만** 전달합니다. AI가 필요할 때만 Read 도구로 읽으므로 이미지 토큰을 아낍니다. 파일시스템 접근이 없는 클라이언트(Claude Desktop 등)는 `inline`을 쓰세요 |
| `mode` | `auto` / `full` / `diff` | `auto` | `auto`는 같은 컴포넌트의 이전 버전이 캐시에 있으면 diff, 없으면 전체 핸드오프를 반환합니다 |
| `force_refresh` | boolean | `false` | 해시가 같아도 캐시를 무시하고 전체 파이프라인을 다시 실행합니다 |

### 해시 캐시

Figma 원본 응답의 SHA-256 해시를 키로 결과를 저장합니다. 디자인이 바뀌지 않았으면 Figma 재요청·정제·Ollama 분석을 전부 건너뜁니다.

```text
.figma_cache/
  nodes/ChatScreen_a3f29c01/
    raw.txt          # Figma 원본 응답
    handoff.md       # 정제된 전체 핸드오프 (항상 전체본 유지)
    diff.md          # diff 모드일 때만 생성
    screenshot.png   # 스크린샷
    meta.json        # 컴포넌트명, 해시, 생성 시각
  registry.json      # 로컬 컴포넌트 레지스트리
```

컴포넌트당 최신 2개 버전만 유지하고 나머지는 자동 삭제됩니다.

### 반복 컴포넌트 중복 제거

같은 구조가 **3회 이상** 반복되면(엘리먼트 3개 이상 크기) 컴포넌트 정의 1개 + 인스턴스 호출로 압축합니다. 텍스트·이미지·클래스 차이는 자동으로 props로 승격되고, 5회를 넘는 반복은 인스턴스 데이터 표로 따로 정리됩니다. 채팅 목록·카드 그리드처럼 반복이 많은 화면에서 효과가 가장 큽니다.

### 로컬 컴포넌트 레지스트리 (Local Code Connect)

브리지가 추출한 컴포넌트는 `.figma_cache/registry.json`에 구조 해시와 함께 자동 등록됩니다. 다음 핸드오프에서 같은 구조가 발견되면 정의를 다시 보내지 않고 **"기존 컴포넌트를 재사용하라"는 한 줄 지시**로 치환합니다.

이미 작성된 프로젝트 컴포넌트를 등록하려면 `sync_component_registry` 도구를 호출하세요. `<projectRoot>/src/components/*.tsx`를 스캔해 컴포넌트명과 props를 레지스트리에 추가합니다.

### Diff 핸드오프

디자이너가 수정한 화면을 다시 가져오면(`mode: auto`), 이전 버전과 비교해 **바뀐 것만** 전달합니다:

```markdown
# Diff Handoff: ChatInput (이전 버전 a3f29c01 -> 현재 9b1d44e2)

이 화면은 이미 구현되어 있다. 아래 변경 사항만 코드에 반영하라.

1. 텍스트 변경: "전송" -> "보내기"
2. className 변경: "bg-[#3B82F6]" -> "bg-[#2563EB]"
```

변경량이 전체의 40%를 넘으면 diff가 의미 없으므로 자동으로 전체 핸드오프로 폴백합니다.

### npm 스크립트

```bash
npm run build     # TypeScript 빌드 (build/)
npm test          # 단위 테스트 (tests/)
npm run setup     # Ollama 설치·서버 실행·llama3.2 다운로드 (옵트인)
npm run measure   # 원본 대비 압축률 측정
```

### 데모 앱으로 결과 확인

`test/`는 생성된 컴포넌트를 실제 렌더링해보는 Vite + React + Tailwind 앱입니다.

```bash
cd test
npm install
npm run dev   # http://localhost:5173
```

생성된 컴포넌트를 `test/src/components/`에 넣고 `App.tsx`에서 import해 확인하세요.

---

## ⚠️ LLM 프롬프트 가이드라인 (Behavioral Guidelines)

AI 에이전트(Claude 등)가 이 파이프라인과 함께 작업할 때는 다음 수칙을 준수해야 합니다.

1. **시각적 레이아웃은 '스크린샷'에 의존:** 전달되는 코드는 뼈대일 뿐입니다. 스크린샷 이미지의 여백과 배치를 눈으로 확인하고 Tailwind `flex`, `gap`, `p-*`, `rounded-*` 클래스를 직접 유추해 작성하세요.
2. **텍스트 및 데이터는 '뼈대 코드'에 의존:** 헥스 색상 코드와 실제 서비스 문구는 환각 방지를 위해 뼈대 코드에 기록된 텍스트를 100% 반영하세요.
3. **에셋 변수명 리팩토링:** `Component_imgVariant.png` 처럼 기계적인 이름으로 추출된 에셋들은 `avatarImage`, `logoIcon` 등 시맨틱한 변수명으로 리팩토링해 적용하세요.
4. **인라인 SVG 하드코딩 금지:** 주석 처리된 아이콘 영역(`{/* SVG Icon: 이름 */}`)은 스크린샷을 참고하여 `lucide-react` 컴포넌트로 반드시 직접 교체하세요.

---

## 📝 라이센스

MIT License. 자유롭게 수정하고 활용하세요. 
프론트엔드 생산성 혁신을 응원합니다! 🎉
