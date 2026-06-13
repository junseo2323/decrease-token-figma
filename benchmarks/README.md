# Figma Handoff Benchmark Harness

This harness compares the same Figma screen through two implementation inputs:

- `vanilla`: official Figma MCP `get_design_context` text, plus an inline reference screenshot cost.
- `bridge`: V5 `get_optimized_figma_handoff` markdown, with screenshot passed by local path.

## Directory Layout

```text
benchmarks/
  fixtures/<slug>/
    raw.figma.txt
    handoff.md
    reference.png
    meta.json
  results/<slug>/
    vanilla.tsx
    bridge.tsx
    vanilla.png
    bridge.png
    report.json
```

`benchmarks/results/` and `fixtures/*/reference.png` are gitignored by default. Commit `raw.figma.txt`, `handoff.md`, and `meta.json` when a fixture should be reproducible without reconnecting to Figma.

## Capture A Fixture

Open Figma Desktop, enable the local MCP server on port `3845`, select the target node, then run:

```bash
npm run build
node benchmarks/capture.mjs ditto-battery-pro 2478-32218 WlvYAu5ONnUe7kVcDtmuqk
```

The capture script writes the official raw context, a reference screenshot, metadata, and the bridge handoff. It uses `requireOllama: false`, so the handoff still generates if Ollama is offline.

## Measure Tokens

```bash
node benchmarks/measure-tokens.mjs ditto-battery-pro
```

The report uses `chars / 4` for text token estimates. Vanilla image tokens are estimated as `width * height / 750`; bridge image tokens are `0` because the bridge passes a file path. Override with `CHARS_PER_TOKEN` or `IMAGE_PIXELS_PER_TOKEN` if you want a different estimate.

## Render And Diff

Generate two components with the same LLM and save them as:

```text
benchmarks/results/ditto-battery-pro/vanilla.tsx
benchmarks/results/ditto-battery-pro/bridge.tsx
```

Each file must default-export a React component. Then run:

```bash
npx playwright install chromium
node benchmarks/render-and-diff.mjs ditto-battery-pro
```

The renderer starts the existing Vite app in `test/`, temporarily mounts each result component, captures `vanilla.png` and `bridge.png`, writes diff images, and merges similarity percentages into `report.json`.

## Add Another Screen

1. Pick a slug, for example `settings-profile-card`.
2. Select the Figma node and run `capture.mjs <slug> <nodeId> <fileKey>`.
3. Run `measure-tokens.mjs <slug>`.
4. Ask the implementation LLM to produce `vanilla.tsx` from `raw.figma.txt` and `bridge.tsx` from `handoff.md`.
5. Run `render-and-diff.mjs <slug>` and compare token savings against pixel similarity.
