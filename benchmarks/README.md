# Figma Handoff Benchmark Harness

This harness compares the same Figma screen through two implementation inputs:

- `vanilla`: official Figma MCP `get_design_context` text plus estimated inline screenshot cost.
- `bridge`: optimized `get_optimized_figma_handoff` Markdown with the screenshot passed by local path.

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

`benchmarks/results/` is generated output. Fixture `raw.figma.txt`, `handoff.md`, and `meta.json` can be committed when a benchmark should be reproducible without reconnecting to Figma. Reference screenshots are ignored by default except for intentionally published fixtures.

## Capture A Fixture

Open Figma Desktop, enable the local MCP server on port `3845`, select the target node, then run:

```bash
npm run build
npm run benchmark:capture -- dashstack-dashboard 2791-32584 WlvYAu5ONnUe7kVcDtmuqk
```

The capture script writes the official raw context, a reference screenshot, metadata, and the bridge handoff. Ollama must be available because the bridge handoff includes the required pre-analysis step.

## Measure Tokens

```bash
npm run benchmark:tokens -- dashstack-dashboard
```

The report uses `chars / 4` for text token estimates. Vanilla image tokens are estimated as `width * height / 750`; bridge image tokens are `0` because the bridge passes a file path. Override with `CHARS_PER_TOKEN` or `IMAGE_PIXELS_PER_TOKEN` when you need a different estimate.

## Render And Diff

Generate two components with the same implementation model and save them as:

```text
benchmarks/results/dashstack-dashboard/vanilla.tsx
benchmarks/results/dashstack-dashboard/bridge.tsx
```

Each file must default-export a React component. Then run:

```bash
npx playwright install chromium
npm run benchmark:diff -- dashstack-dashboard
```

The renderer starts the Vite app in `test/`, mounts each result component, captures `vanilla.png` and `bridge.png`, writes diff images, and merges similarity percentages into `report.json`.

## Blind Multi-Run LLM Benchmark

For a stricter comparison, use the blind runner. It keeps provider, model, temperature, screenshot input, output contract, and compile-repair policy identical while changing only the text input.

Set exactly one provider key and choose the model explicitly:

```bash
export ANTHROPIC_API_KEY=...
# or
export OPENAI_API_KEY=...

npm run benchmark:blind -- dashstack-dashboard \
  --provider anthropic \
  --model claude-sonnet-4-5-20250929 \
  --runs 5 \
  --temperature 0 \
  --max-repairs 1 \
  --experiment-id sonnet45-t0-r5
```

OpenAI works the same way:

```bash
npm run benchmark:blind -- dashstack-dashboard \
  --provider openai \
  --model gpt-5.1 \
  --runs 5 \
  --temperature 0 \
  --max-repairs 1
```

Each run writes prompts, model responses, generated components, screenshots, diffs, and reports under:

```text
benchmarks/results/<slug>/blind-runs/<experiment-id>/
```

The experiment directory also gets `summary.json` and `SUMMARY.md`. To recompute a summary later:

```bash
npm run benchmark:summary -- dashstack-dashboard sonnet45-t0-r5
```

## Reporting Rules

Use language like:

> In a 5-run blind benchmark with the same model, temperature 0, identical screenshot input, and one compile-only repair allowed, the bridge arm achieved X% mean input-token savings and Y percentage points mean similarity delta.

Do not claim a universal accuracy win from one screen. Report model name, run count, temperature, repair count, prompt hashes, and compile failures.

## Add Another Screen

1. Pick a slug, for example `settings-profile-card`.
2. Select the Figma node and run `npm run benchmark:capture -- <slug> <nodeId> <fileKey>`.
3. Run `npm run benchmark:tokens -- <slug>`.
4. Generate `vanilla.tsx` from `raw.figma.txt` and `bridge.tsx` from `handoff.md` with the same model and rules.
5. Run `npm run benchmark:diff -- <slug>` and compare token savings against pixel similarity.
