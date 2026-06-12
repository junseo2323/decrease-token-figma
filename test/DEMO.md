# 🎨 Figma MCP Bridge - Complete Demo

## 📁 프로젝트 구조

```
/Users/seojuno/dev/AI/decrease-token-figma/
├── build/                      # 컴파일된 JavaScript
│   ├── index.js               # MCP 서버 진입점
│   ├── figma-normalizer.js    # 코드 정제 및 최적화
│   ├── figma-proxy.js         # Figma API 연동
│   └── ollama-helper.js       # Ollama 자동 시작
├── src/                        # React 테스트 프로젝트
│   └── test/
│       ├── src/
│       │   ├── App.tsx        # 메인 컴포넌트
│       │   └── main.tsx
│       ├── public/
│       └── package.json
├── test/                       # 테스트 폴더
│   ├── src/                   # React 앱
│   ├── README.md              # 사용 가이드
│   └── claude_desktop_config.json
├── index.ts                    # MCP 서버 메인
├── figma-normalizer.ts         # 코드 최적화 (SVG, 절대좌표 제거)
├── figma-proxy.ts              # Figma API 연동
├── ollama-helper.ts            # Ollama 서버 자동 관리
└── package.json
```

---

## 🚀 실행 방법

### 1. React 테스트 앱 실행 중
```bash
cd /Users/seojuno/dev/AI/decrease-token-figma/test
npm run dev

# ✅ 현재 실행 중: http://localhost:5173
```

### 2. MCP 서버 설정

**Claude Desktop 설정 파일** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "figma-bridge": {
      "command": "node",
      "args": ["/Users/seojuno/dev/AI/decrease-token-figma/build/index.js"],
      "env": {}
    }
  }
}
```

### 3. 사용 방법

1. **Figma Desktop 실행** (로컬 포트 3845 에서 실행 중이어야 함)
2. **컴포넌트 선택** (예: HeroSection, UserProfile 등)
3. **Claude 에게 요청**: "Figma 컴포넌트를 React 로 변환해줘"
4. **자동 최적화된 코드 받기**

---

## 📊 실시간 처리 예시

### Figma 에서 선택한 원본 코드
```tsx
function HeroSection() {
  const heroImage = "http://localhost:3845/assets/hero_001.png";
  
  return (
    <section className="absolute top-0 left-0 w-[1440px] h-[600px] bg-[#1F2937]" 
             data-node-id="1:100">
      <svg width="24" height="24" data-name="Check Icon">
        <path d="M20 6L9 17l-5-5" stroke="currentColor"/>
      </svg>
      <h1 className="text-[56px] font-[700] text-[#FFFFFF]">
        Build Faster
      </h1>
    </section>
  );
}
```

### MCP 가 생성한 최적화된 코드
```tsx
/**
 * 🎨 필요한 SVG 아이콘 목록:
 * - CheckIcon: "Check Icon" 아이콘을 사용하세요 (예: lucide-react 의 <CheckIcon />)
 * 
 * 📦 설치 방법: npm install lucide-react
 */

import heroImage from './assets/HeroSection_heroImage.png';

function HeroSection() {
  return (
    <section className="bg-[#1F2937]">
      {/* SVG Icon: CheckIcon */}
      <h1 className="text-[56px] font-[700] text-[#FFFFFF]">
        Build Faster
      </h1>
    </section>
  );
}
```

---

## ✨ 자동 최적화 항목

| 항목 | Before | After |
|------|--------|-------|
| **절대좌표** | `absolute top-[0px] left-[0px]` | ❌ 제거 |
| **고정크기** | `w-[1440px] h-[600px]` | ❌ 제거 |
| **data-node-id** | `data-node-id="1:100"` | ❌ 제거 |
| **SVG** | 50+ 자 인라인 | `{/* SVG Icon: CheckIcon */}` |
| **이미지** | URL 문자열 | `import heroImage from '...'` |
| **Ollama 분석** | ❌ 없음 | ✅ 색상/텍스트/요약 추출 |

---

## 🎯 Ollama 분석 예시

```markdown
## 🤖 AI Pre-Analysis (Ollama · llama3.2)

> **Component Summary:** 
> HeroSection is a reusable UI component used to create a hero section 
> with navigation, hero content, and call-to-actions.

| 항목 | 값 |
|---|---|
| 🎨 Colors | `#1F2937` `#FFFFFF` `#3B82F6` `#9CA3AF` |
| 📝 Texts | "Build Faster", "Get Started", "Watch Demo" |
```

---

## 🛠 문제 해결

### Ollama 가 작동하지 않아요
```bash
# Ollama 서버 확인
ollama list

# 서버 시작
ollama serve

# 모델 다운로드
ollama pull llama3.2
```

### MCP 서버가 연결되지 않아요
```bash
# 빌드 확인
cd /Users/seojuno/dev/AI/decrease-token-figma
npm run build

# 수동 실행 테스트
node build/index.js
```

---

## 📞 다음 단계

1. **Figma Desktop 실행**
2. **실제 컴포넌트 선택**
3. **Claude 에서 "Figma 컴포넌트를 React 로 변환해줘" 요청**
4. **실시간으로 최적화된 코드 받기**

---

## 🎉 완료!

모든 기능이 준비되었습니다:
- ✅ React 테스트 앱 실행 중 (`http://localhost:5173`)
- ✅ MCP 서버 빌드 완료
- ✅ Ollama 자동 시작 및 분석
- ✅ SVG 아이콘 안내 기능
- ✅ 절대좌표 제거 (반응형 변환)
- ✅ 이미지 자동 다운로드
