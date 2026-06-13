# Figma Cost Optimizer Bridge

<div align="right">
  <strong>English</strong> | <a href="./index.ko.html">한국어</a>
</div>

Local MCP bridge that compresses Figma Desktop design context into token-efficient React handoffs for LLM coding agents.

## Benchmark Snapshot

Latest fixture: Ditto `BatteryPro`, measured on `2026-06-13`.

| Path | Total estimated input tokens | Pixel similarity |
|---|---:|---:|
| Official Figma MCP raw | 13,684 | 92.97% |
| Bridge handoff | 7,682 | 96.77% |

**Estimated input-token saving: 43.86%.**

[Read the full benchmark report](./BENCHMARK_RESULTS.html)

![Bridge render](./assets/benchmarks/ditto-battery-pro/bridge.png)

## Install

```bash
npm install -g decrease-token-figma
figma-bridge
```

## MCP Client Config

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

## Why It Runs Locally

This is not a hosted web service. The bridge needs access to:

- Figma Desktop local MCP on `127.0.0.1:3845`
- the user's project filesystem for cache and assets
- optional local Ollama analysis

Use npm or GitHub for installation. Use GitHub Pages for docs and benchmark reports.

## Links

- [GitHub repository](https://github.com/junseo2323/decrease-token-figma)
- [npm package](https://www.npmjs.com/package/decrease-token-figma)
- [Korean page](./index.ko.html)
