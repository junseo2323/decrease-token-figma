# Figma Cost Optimizer Bridge

Local MCP bridge that compresses Figma design context into token-efficient React handoffs with screenshots.

## Benchmark Snapshot

| Path | Total estimated input tokens | Pixel similarity |
|---|---:|---:|
| Official Figma MCP raw | 13,684 | 92.97% |
| Bridge handoff | 7,682 | 96.77% |

**Estimated saving: 43.86%.**

[Read the full benchmark report](./BENCHMARK_RESULTS.md)

![Bridge render](./assets/benchmarks/ditto-battery-pro/bridge.png)

## Install

```bash
npm install -g decrease-token-figma
figma-bridge
```

For MCP clients:

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

## Runtime Model

This is not a hosted web service. It runs locally because it needs access to:

- Figma Desktop local MCP on `127.0.0.1:3845`
- your project filesystem for cache and assets
- optional local Ollama analysis

Use GitHub Pages for docs, and npm for real installation.
