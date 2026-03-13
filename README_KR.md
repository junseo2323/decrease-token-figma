# 🎨 Figma Cost Optimizer Bridge (V4)

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
- 🤖 **올인원 AI 환경 세팅 (Ollama Auto-installer):** 패키지 글로벌 설치 시 타겟 PC에 Ollama가 없으면 자동 설치하고, 로컬 추론을 위한 `llama3.2` 모델까지 스크립트가 1-Click 베이스로 알아서 다운로드합니다.

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

*※ `npm link` 실행 시 `postinstall` 훅이 작동하여 PC에 Ollama 런타임이 없다면 자동 설치를 진행하고 `llama3.2` 모델을 백그라운드에서 다운로드합니다.*

---

## 🛠 사용 방법

설치가 완료되면 PC의 어느 디렉토리에서든 아래 커맨드를 통해 프록시 서버(MCP)를 실행할 수 있습니다.

```bash
figma-bridge
```

### 작동 프로세스
1. 백그라운드에서 실행 중인 **Figma 데스크탑 앱 로컬 API(포트 3845)**와 연결됩니다.
2. AI(Claude 데스크탑 등)에게 `get_optimized_figma_handoff` 라는 도구를 제공합니다.
3. 사용자가 피그마 화면에서 변환할 컴포넌트를 선택하고 AI에게 렌더링을 지시하면:
   - figma-bridge가 원본 코드를 가져옵니다.
   - 스크린샷을 찍습니다.
   - `src/assets`에 이미지를 다운로드하고 코드를 무손실 압축합니다.
   - 정제된 마크다운 뼈대 코드(`handoff.md`)와 스크린샷 이미지를 AI에게 반환합니다.

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
