# 벤치마크 결과: DashStack Dashboard

<div align="right">
  <a href="./BENCHMARK_RESULTS.html">English</a> | <strong>한국어</strong>
</div>

Figma Cost Optimizer Bridge의 현재 재현 가능한 벤치마크 기록입니다.

- Fixture: `dashstack-dashboard`
- Figma node: `2791-32584`
- File key: `WlvYAu5ONnUe7kVcDtmuqk`
- 캡처 뷰포트: `1024 x 761`
- 측정일: `2026-06-16`
- 방법: 블라인드 다중 실행 — `anthropic / claude-sonnet-4-6`, 3회, temperature `0`, 컴파일 전용 수리 `1`

## 요약

토큰 컬럼은 `chars / 4` 추정치입니다(vanilla 이미지 토큰은 `width * height / 750`). 픽셀 유사도는 블라인드 3회의 평균입니다.

| 경로 | 입력 문자 수 | 추정 텍스트 토큰 | 이미지 토큰 | 총 추정 토큰 | 픽셀 유사도(평균) |
|---|---:|---:|---:|---:|---:|
| 공식 Figma MCP raw | 51,543 | 12,886 | 1,040 | 13,926 | 83.12% |
| Bridge handoff | 26,929 | 6,733 | 0 | 6,733 | 84.76% |

**추정 입력 토큰 절감률: 51.65%.** 3회 블라인드 실행에서 bridge 쪽이 평균 **+1.65 pp** 더 기준 화면에 가까웠습니다(범위 −0.12 ~ +3.28 pp). 입력 토큰을 약 절반만 쓰면서도 시각적 정확도 손실이 없었습니다.

| Run | 절감 % | Vanilla 유사도 | Bridge 유사도 | 차이 pp |
|---|---:|---:|---:|---:|
| run-001 | 51.65 | 81.69 | 84.97 | +3.28 |
| run-002 | 51.65 | 84.34 | 84.22 | −0.12 |
| run-003 | 51.65 | 83.32 | 85.10 | +1.78 |

아래 이미지는 대표 실행(`run-003`) 기준입니다.

## 시각 비교

### 기준

![기준 스크린샷](./assets/benchmarks/dashstack-dashboard/reference.png)

### 공식 Raw 렌더

![공식 raw 렌더](./assets/benchmarks/dashstack-dashboard/vanilla.png)

공식 Figma MCP raw 컨텍스트와 스크린샷으로 구현했습니다. 구조적으로는 가깝지만, 같은 조건에서 bridge 렌더보다 충실도가 낮고 입력 토큰은 약 2배가 듭니다.

### Bridge 렌더

![Bridge 렌더](./assets/benchmarks/dashstack-dashboard/bridge.png)

최적화된 handoff Markdown과 동일한 스크린샷으로 구현했습니다. 사이드바, 상단바, Revenue 영역 차트, 3개 요약 카드를 더 적은 입력 토큰으로 충실히 재현했습니다.

## 픽셀 Diff

### 공식 Raw Diff

![공식 raw pixel diff](./assets/benchmarks/dashstack-dashboard/vanilla.diff.png)

### Bridge Diff

![Bridge pixel diff](./assets/benchmarks/dashstack-dashboard/bridge.diff.png)

## 벤치마크 재현

```bash
npm install
npm run build
npx playwright install chromium

# Figma Desktop을 열고 local MCP를 3845 포트에서 활성화한 뒤,
# 대상 노드를 선택한 상태에서 실행합니다.
npm run benchmark:capture -- dashstack-dashboard 2791-32584 WlvYAu5ONnUe7kVcDtmuqk
npm run benchmark:tokens -- dashstack-dashboard

# 블라인드 다중 실행 비교 (먼저 ANTHROPIC_API_KEY 설정):
npm run benchmark:blind -- dashstack-dashboard \
  --provider anthropic --model claude-sonnet-4-6 \
  --runs 3 --temperature 0 --max-repairs 1 --experiment-id sonnet46-t0-r3
```

산출물 위치:

```text
benchmarks/fixtures/dashstack-dashboard/
benchmarks/results/dashstack-dashboard/
```

## 주의

이는 단일 화면에 대한 실용적 로컬 벤치마크이며, bridge가 항상 시각적 정확도를 높인다는 보편적 주장은 아닙니다. 블라인드 하니스는 provider, 모델, temperature, 스크린샷 입력, 출력 규칙, 컴파일 수리 정책을 동일하게 고정하고 텍스트 입력만 바꾸므로 공정한 비교지만, 결과는 화면과 모델에 따라 달라집니다. 수치를 인용할 때는 모델명, 실행 횟수, temperature, 수리 횟수, 컴파일 실패를 함께 보고하세요.

## 권장 배포

이 프로젝트는 호스팅 웹 서비스가 아니라 로컬에서 실행하는 것을 전제로 합니다. MCP 브리지는 다음에 접근해야 합니다.

- 사용자의 로컬 Figma Desktop MCP 엔드포인트(`127.0.0.1:3845`)
- 에셋과 캐시를 위한 로컬 프로젝트 파일시스템
- 선택적 로컬 Ollama 사전 분석

권장 배포:

1. 소스, 문서, 벤치마크, 이슈를 위한 GitHub 저장소
2. `npx` 또는 전역 설치를 위한 npm 패키지
3. 문서와 벤치마크 리포트를 위한 GitHub Pages

원격 MCP 서비스(인증 및 다른 Figma 접근 모델)로 재설계하지 않는 한, Vercel/Render/Fly를 메인 런타임으로 사용하지 마세요.

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
