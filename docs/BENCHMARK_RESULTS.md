# Benchmark Results: Ditto BatteryPro

<div align="right">
  <strong>English</strong> | <a href="./BENCHMARK_RESULTS_KR.html">한국어</a>
</div>

This report records the current reproducible benchmark for Figma Cost Optimizer Bridge V5.

- Fixture: `ditto-battery-pro`
- Figma node: `2478-32218`
- File key: `WlvYAu5ONnUe7kVcDtmuqk`
- Captured viewport: `393 x 973`
- Measurement date: `2026-06-13`

## Summary

| Path | Input chars | Est. text tokens | Image tokens | Total est. tokens | Pixel similarity |
|---|---:|---:|---:|---:|---:|
| Official Figma MCP raw | 52,696 | 13,174 | 510 | 13,684 | 92.97% |
| Bridge handoff | 30,727 | 7,682 | 0 | 7,682 | 96.77% |

**Estimated input-token saving: 43.86%.**

The repeated instance table optimization reduced the repeated data section to **3,978 chars**, under the 10KB target. The remaining size is mostly optimized code and component definitions, which are the next targets for deeper compression.

## Visual Comparison

### Reference

![Reference screenshot](./assets/benchmarks/ditto-battery-pro/reference.png)

### Official Raw Render

![Official raw render](./assets/benchmarks/ditto-battery-pro/vanilla.png)

The official raw TSX render is structurally close, but it shows why raw design-context code is a weak direct implementation source: the bottom tab bar appears at the top and the rating stars render oversized.

### Bridge Render

![Bridge render](./assets/benchmarks/ditto-battery-pro/bridge.png)

The bridge implementation used the optimized handoff plus screenshot. In this local benchmark it produced a closer screen than the raw TSX baseline while using fewer estimated input tokens.

## Pixel Diff

### Official Raw Diff

![Official raw pixel diff](./assets/benchmarks/ditto-battery-pro/vanilla.diff.png)

### Bridge Diff

![Bridge pixel diff](./assets/benchmarks/ditto-battery-pro/bridge.diff.png)

## Reproduce The Benchmark

```bash
npm install
npm run build
npx playwright install chromium

# Figma Desktop must be open, local MCP must be enabled on port 3845,
# and the target node must be selected.
npm run benchmark:capture -- ditto-battery-pro 2478-32218 WlvYAu5ONnUe7kVcDtmuqk
npm run benchmark:tokens -- ditto-battery-pro
npm run benchmark:diff -- ditto-battery-pro
```

Benchmark artifacts live in:

```text
benchmarks/fixtures/ditto-battery-pro/
benchmarks/results/ditto-battery-pro/
```

## Caveats

This is a practical local benchmark, not a universal claim that the bridge always improves visual accuracy. The official raw result is a minimally patched direct render of raw Figma TSX. The bridge result is a handoff-based implementation created from the optimized Markdown plus screenshot.

For publishable model comparisons, use the blind benchmark harness so the provider, model, temperature, screenshot input, output contract, and compile-repair policy are identical while only the text input changes.

## Recommended Distribution

This project should run locally, not primarily as a hosted web service. The MCP bridge needs access to:

- the user's local Figma Desktop MCP endpoint at `127.0.0.1:3845`
- the user's local project filesystem for assets and cache
- optional local Ollama for pre-analysis

Recommended distribution:

1. GitHub repository for source, docs, benchmarks, and issues.
2. npm package for local installation through `npx` or global install.
3. GitHub Pages for documentation and benchmark reports.

Do not use Vercel, Render, or Fly as the main runtime unless the project is redesigned as a remote MCP service with authentication and a different Figma access model.

## Example MCP Client Config

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
