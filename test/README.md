# 🎨 Figma MCP Bridge - Test Project

이 폴더는 Figma MCP Bridge 데모를 위한 React 프로젝트입니다.

## 🚀 빠른 시작

### 1. MCP 서버 설정

Claude Desktop 에서 Figma MCP 를 사용하려면 설정 파일을 추가하세요:

**macOS:**
```bash
mkdir -p ~/Library/Application\ Support/Claude
```

**Windows:**
```bash
mkdir %APPDATA%\Claude
```

**설정 파일** (`claude_desktop_config.json`):
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

### 2. Claude Desktop 재시작

설정 파일을 추가한 후 Claude Desktop 을 재시작하세요.

### 3. Figma 에서 컴포넌트 선택

Figma Desktop 앱에서:
1. 컴포넌트를 선택합니다
2. Claude 에게 "Figma 컴포넌트를 React 로 변환해줘"라고 요청합니다

### 4. 결과 확인

MCP 서버가 자동으로 다음을 수행합니다:
- ✅ Figma 에서 원본 코드 추출
- ✅ 절대좌표, 고정크기 제거 (반응형 skeleton 으로 변환)
- ✅ SVG 아이콘 분석 및 lucide-react 사용 안내
- ✅ 이미지 에셋 자동 다운로드
- ✅ Ollama 로 디자인 토큰 분석 (색상, 텍스트, 요약)
- ✅ 최적화된 React 코드 생성

---

## 📊 성능 비교

| 항목 | Original | Optimized | 감소율 |
|------|----------|-----------|--------|
| **토큰** | 1,000+ | 600~700 | **~40%** |
| **절대좌표** | ✅ 포함 | ❌ 제거 | 100% |
| **SVG** | 인라인 400+ 자 | 주석/컴포넌트 | 90% |
| **Ollama 분석** | ❌ 없음 | ✅ 있음 | - |

---

## 🎯 SVG 처리 모드

### Component 모드 (기본값)
SVG 를 React 컴포넌트로 변환:
```tsx
const SvgHomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" className="text-[#3B82F6]">
    <path d="M12 3L4 9v12h5v-7h6v7h5V9z" fill="currentColor"/>
  </svg>
);
```

### Compact 모드
SVG 를 주석으로만 변환 + 설치 안내:
```tsx
/**
 * 🎨 필요한 SVG 아이콘 목록:
 * - HomeIcon: "Home Icon" 아이콘을 사용하세요 (예: lucide-react 의 <HomeIcon />)
 * 
 * 📦 설치 방법: npm install lucide-react
 */

function Component() {
  return (
    <div>
      {/* SVG Icon: HomeIcon */}
    </div>
  );
}
```

---

## 🛠 문제 해결

### Ollama 가 작동하지 않아요

1. Ollama 서버 확인:
```bash
ollama --version
ollama list
```

2. 서버 시작:
```bash
ollama serve
```

3. 모델 확인:
```bash
ollama pull llama3.2
```

### MCP 서버가 연결되지 않아요

1. 빌드 확인:
```bash
cd /Users/seojuno/dev/AI/decrease-token-figma
npm run build
```

2. 설정 파일 경로 확인
3. Claude Desktop 재시작

---

## 📁 프로젝트 구조

```
test/
├── src/
│   ├── App.tsx          # 메인 컴포넌트
│   ├── App.css
│   └── ...
├── public/
├── claude_desktop_config.json  # MCP 설정 (예시)
└── README.md            # 이 파일
```

---

## 🎉 성공적인 사용 예시

1. **Figma 에서 HeroSection 컴포넌트 선택**
2. **Claude 에게 요청**: "이거 React 로 만들어줘"
3. **자동 생성된 코드**:
   - 절대좌표 제거된 반응형 레이아웃
   - SVG 는 lucide-react 로 대체 안내
   - 색상은 하드코딩된 값 그대로 사용
   - Ollama 가 분석한 디자인 토큰 제공

```tsx
/**
 * 🎨 필요한 SVG 아이콘 목록:
 * - CheckIcon: "Check Icon" 아이콘을 사용하세요
 * 
 * 📦 설치 방법: npm install lucide-react
 */
function HeroSection() {
  return (
    <section className="bg-[#1F2937]">
      <h1 className="text-[56px] font-[700] text-[#FFFFFF]">
        Build Faster
      </h1>
      {/* ... */}
    </section>
  );
}
```

---

## 📞 문의사항

프로젝트 루트의 README.md 를 참조하세요.
