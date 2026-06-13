# Figma Cost Optimizer Bridge

<div align="right">
  <a href="./index.html">English</a> | <strong>한국어</strong>
</div>

Figma 디자인 컨텍스트를 LLM이 구현하기 좋은 **토큰 효율적인 React handoff**로 바꾸는 로컬 MCP 브리지입니다.

## 벤치마크 요약

| 경로 | 총 추정 입력 토큰 | 픽셀 유사도 |
|---|---:|---:|
| 공식 Figma MCP raw | 13,684 | 92.97% |
| Bridge handoff | 7,682 | 96.77% |

**추정 절감률: 43.86%**

[한국어 전체 벤치마크 리포트 보기](./BENCHMARK_RESULTS_KR.html)

![Bridge render](./assets/benchmarks/ditto-battery-pro/bridge.png)

## 설치

npm 전역 설치:

```bash
npm install -g decrease-token-figma
figma-bridge
```

GitHub에서 바로 설치:

```bash
npm install -g github:junseo2323/decrease-token-figma
figma-bridge
```

## MCP 설정 예시

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

## 왜 로컬에서 실행하나요?

이 브리지는 호스팅 웹 서비스가 아니라 로컬 MCP 서버입니다. 다음에 접근해야 하기 때문입니다.

- Figma Desktop local MCP: `127.0.0.1:3845`
- 사용자의 프로젝트 파일시스템
- 선택적으로 로컬 Ollama

따라서 실제 배포는 npm/GitHub 설치가 맞고, GitHub Pages는 문서와 벤치마크를 보여주는 용도입니다.

## 링크

- [GitHub 저장소](https://github.com/junseo2323/decrease-token-figma)
- [Release v1.0.0](https://github.com/junseo2323/decrease-token-figma/releases/tag/v1.0.0)
- [한국어 README](https://github.com/junseo2323/decrease-token-figma/blob/main/README_KR.md)
