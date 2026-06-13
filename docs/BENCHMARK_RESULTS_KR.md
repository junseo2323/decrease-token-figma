# 벤치마크 결과: Ditto BatteryPro

<div align="right">
  <a href="./BENCHMARK_RESULTS.html">English</a> | <strong>한국어</strong>
</div>

이 리포트는 Figma Cost Optimizer Bridge V5의 현재 재현 가능한 벤치마크를 기록합니다.

- Fixture: `ditto-battery-pro`
- Figma node: `2478-32218`
- File key: `WlvYAu5ONnUe7kVcDtmuqk`
- 캡처 viewport: `393 x 973`
- 측정일: `2026-06-13`

## 요약

| 경로 | 입력 문자 수 | 추정 텍스트 토큰 | 이미지 토큰 | 총 추정 토큰 | 픽셀 유사도 |
|---|---:|---:|---:|---:|---:|
| 공식 Figma MCP raw | 52,696 | 13,174 | 510 | 13,684 | 92.97% |
| Bridge handoff | 30,727 | 7,682 | 0 | 7,682 | 96.77% |

**추정 입력 토큰 절감률: 43.86%**

반복 인스턴스 표 최적화로 반복 데이터 섹션은 **3,978자**까지 줄었고, 목표였던 10KB 아래로 내려왔습니다. 남은 크기의 대부분은 최적화된 코드와 컴포넌트 정의이며, 다음 압축 대상입니다.

## 시각 비교

### 기준 이미지

![기준 스크린샷](./assets/benchmarks/ditto-battery-pro/reference.png)

### 공식 raw 렌더

![공식 raw 렌더](./assets/benchmarks/ditto-battery-pro/vanilla.png)

공식 raw TSX 렌더는 구조적으로는 가깝지만, raw design-context 코드가 직접 구현 소스로는 약하다는 점을 보여줍니다. 하단 탭바가 위쪽에 나타나고 별점 아이콘이 과도하게 크게 렌더됩니다.

### Bridge 렌더

![Bridge 렌더](./assets/benchmarks/ditto-battery-pro/bridge.png)

Bridge 구현은 최적화된 handoff와 스크린샷을 사용했습니다. 이 로컬 벤치마크에서는 더 적은 추정 입력 토큰으로 raw TSX baseline보다 기준 화면에 가까운 결과를 만들었습니다.

## Pixel Diff

### 공식 raw diff

![공식 raw pixel diff](./assets/benchmarks/ditto-battery-pro/vanilla.diff.png)

### Bridge diff

![Bridge pixel diff](./assets/benchmarks/ditto-battery-pro/bridge.diff.png)

## 벤치마크 재현

```bash
npm install
npm run build
npx playwright install chromium

# Figma Desktop을 열고, local MCP를 3845 포트에서 활성화한 뒤,
# 대상 노드를 선택한 상태에서 실행합니다.
npm run benchmark:capture -- ditto-battery-pro 2478-32218 WlvYAu5ONnUe7kVcDtmuqk
npm run benchmark:tokens -- ditto-battery-pro
npm run benchmark:diff -- ditto-battery-pro
```

벤치마크 산출물은 다음 경로에 저장됩니다.

```text
benchmarks/fixtures/ditto-battery-pro/
benchmarks/results/ditto-battery-pro/
```

## 해석상 주의

이 결과는 실용적인 로컬 벤치마크이며, 브리지가 항상 시각 정확도를 개선한다는 보편적 주장으로 해석하면 안 됩니다. 공식 raw 결과는 raw Figma TSX를 최소 보정해 직접 렌더한 baseline이고, Bridge 결과는 최적화된 Markdown과 스크린샷을 보고 만든 handoff 기반 구현입니다.

공개 가능한 모델 비교를 하려면 blind benchmark 하니스를 사용하세요. provider, model, temperature, screenshot input, output contract, compile-repair 정책을 동일하게 유지하고 텍스트 입력만 바꾸는 방식이어야 합니다.

## 권장 배포 방식

이 프로젝트는 원격 웹 서비스가 아니라 로컬 실행을 전제로 합니다. MCP 브리지는 다음에 접근해야 합니다.

- 사용자의 Figma Desktop local MCP endpoint: `127.0.0.1:3845`
- 에셋과 캐시를 저장할 사용자의 로컬 프로젝트 파일시스템
- 선택적인 로컬 Ollama 사전 분석

권장 배포 방식:

1. GitHub 저장소: 소스, 문서, 벤치마크, 이슈 관리
2. npm 패키지: `npx` 또는 전역 설치 기반 로컬 실행
3. GitHub Pages: 문서와 벤치마크 리포트 공개

인증, Figma 접근 모델, 파일시스템 모델을 원격 MCP 서비스용으로 다시 설계하지 않는 한 Vercel, Render, Fly 같은 원격 런타임을 주 실행 환경으로 쓰면 안 됩니다.

## MCP 클라이언트 설정 예시

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
