# Figma Cost Optimizer Bridge

<div align="right">
  <a href="./index.html">English</a> | <strong>한국어</strong>
</div>

![Figma Cost Optimizer Bridge 시스템 개요](./assets/system-overview-kr.png)

Figma Desktop 디자인 컨텍스트를 LLM 코딩 에이전트가 구현하기 좋은 토큰 효율적인 React handoff로 압축하는 로컬 MCP 브리지입니다.

## 벤치마크 요약

최신 fixture: Ditto `BatteryPro`, 측정일 `2026-06-13`.

| 경로 | 총 추정 입력 토큰 | 픽셀 유사도 |
|---|---:|---:|
| 공식 Figma MCP raw | 13,684 | 92.97% |
| Bridge handoff | 7,682 | 96.77% |

**추정 입력 토큰 절감률: 43.86%**

[전체 벤치마크 리포트 보기](./BENCHMARK_RESULTS_KR.html)

![Bridge 렌더](./assets/benchmarks/ditto-battery-pro/bridge.png)

## 설치

```bash
npm install -g decrease-token-figma
figma-bridge
```

## MCP 클라이언트 설정

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

## Codex와 Claude Code 설정

`FIGMA_BRIDGE_ROOT`가 올바른 파일시스템 위치를 가리키도록, 구현할 앱 프로젝트 루트에서 실행하세요.

```bash
codex mcp add figma-cost-optimizer-bridge \
  --env FIGMA_BRIDGE_ROOT="$PWD" \
  -- npx -y decrease-token-figma
```

```bash
claude mcp add -s local figma-cost-optimizer-bridge \
  -e FIGMA_BRIDGE_ROOT="$PWD" \
  -- npx -y decrease-token-figma
```

등록 확인 또는 제거:

```bash
codex mcp list
claude mcp list

codex mcp remove figma-cost-optimizer-bridge
claude mcp remove figma-cost-optimizer-bridge
```

브리지가 시작되면 `FIGMA_BRIDGE_ROOT`의 `AGENTS.md`와 `CLAUDE.md` 맨 위에 가드레일을 추가해, Figma 작업에서 `figma-cost-optimizer-bridge`만 사용하고 공식 Figma MCP로 폴백하지 않도록 안내합니다. 이 동작을 끄려면 `FIGMA_BRIDGE_WRITE_AGENT_RULES=0`을 설정하세요.

## 왜 로컬에서 실행하나요?

이 브리지는 호스팅 웹 서비스가 아닙니다. 다음에 접근해야 합니다.

- Figma Desktop local MCP: `127.0.0.1:3845`
- 캐시와 에셋을 저장할 사용자의 프로젝트 파일시스템
- 선택적인 로컬 Ollama 분석

실제 설치와 실행은 npm 또는 GitHub를 사용하세요. GitHub Pages는 문서와 벤치마크 리포트 공개용입니다.

## 링크

- [GitHub 저장소](https://github.com/junseo2323/decrease-token-figma)
- [npm 패키지](https://www.npmjs.com/package/decrease-token-figma)
- [English page](./index.html)
