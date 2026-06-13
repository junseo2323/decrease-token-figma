# Benchmark Results: Ditto BatteryPro

<div align="right">
  <strong>English</strong> | <a href="./BENCHMARK_RESULTS_KR.html">한국어</a>
</div>

This document records the first reproducible benchmark for the V5 Figma Cost Optimizer Bridge.

- Fixture: `ditto-battery-pro`
- Figma node: `2478-32218`
- File key: `WlvYAu5ONnUe7kVcDtmuqk`
- Captured viewport: `393 x 973`
- Measurement date: `2026-06-13`

## Summary

| Path | Input chars | Est. text tokens | Image tokens | Total est. tokens | Similarity |
|---|---:|---:|---:|---:|---:|
| Official Figma MCP raw | 52,696 | 13,174 | 510 | 13,684 | 92.97% |
| Bridge handoff | 30,727 | 7,682 | 0 | 7,682 | 96.77% |

**Estimated input-token saving: 43.86%.**

The repeated instance table optimization worked: the repeated data section is now **3,978 chars**, safely below the 10KB target. The remaining size is mostly in the optimized code block and repeated component definitions, so future savings should focus there.

## Visual Comparison

### Reference

![Reference screenshot](./assets/benchmarks/ditto-battery-pro/reference.png)

### Vanilla Render

![Vanilla render](./assets/benchmarks/ditto-battery-pro/vanilla.png)

The raw Figma TSX render is structurally close, but it exposes why raw design-context code is a weak direct implementation source: the bottom tab bar appears at the top and the rating stars render oversized.

### Bridge Render

![Bridge render](./assets/benchmarks/ditto-battery-pro/bridge.png)

The bridge output used the optimized handoff plus screenshot as implementation input. In this local benchmark it produced a closer screen than the raw TSX baseline while using fewer estimated input tokens.

## Pixel Diff

### Vanilla Diff

![Vanilla pixel diff](./assets/benchmarks/ditto-battery-pro/vanilla.diff.png)

### Bridge Diff

![Bridge pixel diff](./assets/benchmarks/ditto-battery-pro/bridge.diff.png)

## Reproduce The Benchmark

```bash
npm install
npm run build
npx playwright install chromium

# Figma Desktop must be open, local MCP enabled on port 3845,
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

This is a practical local benchmark, not a strict same-model blind trial. The vanilla result is a minimally patched direct render of raw Figma TSX. The bridge result is a handoff-based implementation created from the optimized markdown plus screenshot. The harness is ready for stricter comparisons where the same implementation LLM receives each input and writes `vanilla.tsx` and `bridge.tsx`.

## Where To Host This

For real users, this project should **not** be deployed primarily as a remote web server. The bridge is a local MCP stdio server that must talk to:

- the user's local Figma Desktop MCP endpoint at `127.0.0.1:3845`
- the user's local project filesystem for assets and cache
- optionally local Ollama for pre-analysis

Recommended distribution:

1. **GitHub repository** for source, docs, benchmarks, and issues.
2. **npm package** for installation, so users can run it locally with `npx` or a global install.
3. **GitHub Pages** for a documentation/benchmark website if you want a public landing page.

Do not use Vercel/Render/Fly as the main runtime for the MCP bridge unless you redesign it as a remote MCP service with authentication and a different Figma access model. A remote server cannot directly read another user's local Figma Desktop selection or local project files.

### Example MCP Client Config

Recommended npm install:

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

Users can also install directly from GitHub:

```bash
npm install -g github:junseo2323/decrease-token-figma
figma-bridge
```

or clone locally:

```bash
git clone https://github.com/junseo2323/decrease-token-figma.git
cd decrease-token-figma
npm install
npm run build
npm link
figma-bridge
```
