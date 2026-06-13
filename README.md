# 🎨 Figma Cost Optimizer Bridge (V5)

<div align="right">
  <strong>🇺🇸 English</strong> | <a href="./README_KR.md">🇰🇷 한국어</a>
</div>

**Figma Cost Optimizer Bridge** is a custom local proxy MCP (Model Context Protocol) pipeline built to prevent **catastrophic token consumption and context pollution** that occur during automated frontend UI/UX development using LLMs (Claude, GPT, etc.).

It intercepts the massive metadata, inline SVG codes, and fixed pixel coordinates recklessly emitted by the existing official Figma MCP tool (`get_design_context`). It then losslessly compresses them into a **"ultra-lightweight responsive skeleton code + screen screenshot"** format. This drastically reduces API call costs by up to 80% while maximizing the AI's code rendering accuracy.

---

## 📊 Performance (Token Optimization)

Latest benchmark:

- `ditto-battery-pro` official raw input: **13,684 estimated total tokens**
- V5 bridge handoff: **7,682 estimated total tokens**
- Input-token saving: **43.86%**
- Pixel similarity: raw baseline **92.97%**, bridge implementation **96.77%**

See the full visual report: [docs/BENCHMARK_RESULTS.md](./docs/BENCHMARK_RESULTS.md)

Korean docs are available in [README_KR.md](./README_KR.md) and on GitHub Pages: https://junseo2323.github.io/decrease-token-figma/index.ko.html

Based on a local precision modeling test of a single UI component:

```text
[ Official Figma MCP ] 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥 8,200 Tokens (32,933 chars)
[ V4 Pipeline Bridge ] 🟩🟩🟩🟩🟩🟩🟩⬜️⬜️⬜️ 5,900 Tokens (23,986 chars)

🔥 Net Savings: ~2,300 Tokens Saved (27.2% Reduction)
💡 Note: The savings scale exponentially. For complex, full-page designs with multiple inline SVGs and absolute coordinates, the reduction rate reaches up to 80%!

🏗️ Architecture & Workflow
Plaintext
 ┌───────────────────┐       (1) Call `get_optimized_figma_handoff`
 │ AI Agent (Claude) │ ───────────────────────────────────────────────┐
 └─────────▲─────────┘                                                │
           │                                                          ▼
           │ (4) Returns:                                ┌──────────────────────────┐
           │     1. Lightweight Skeleton (handoff.md)    │ 🌉 Figma Bridge (MCP)    │
           │     2. Selected UI Screenshot               │    (Cost Optimizer)      │
           │                                             └────────────┬─────────────┘
           │                                                          │
           │ (3) Process:                                             │ (2) Request:
           │     - Strip absolute/fixed coordinates                   │     - Raw Node Code
           │     - Clean massive metadata & inline SVGs               │     - Screenshot
           │     - Download images to `src/assets/`                   │     - Image Assets
           │                                                          ▼
 ┌─────────┴─────────┐                                   ┌──────────────────────────┐
 │ 📁 Local Project  │ ◀────── Auto-save Assets ──────── │ 🎨 Figma Desktop App     │
 │   └─ /src/assets  │                                   │    (Local Port 3845)     │
 └───────────────────┘                                   └──────────────────────────┘
✨ Key Features (V4 Pipeline)
💸 Cost Minimization (Token Optimization): Completely eliminates massive metadata, unselected node information, and unnecessary attributes (like data-node-id), compressing a payload of ~15,000 tokens down to roughly 2,000 ~ 4,000 tokens per call.

📱 Responsive Skeleton Conversion: Uses regex to strip out Figma's absolute coordinates (absolute, top, left) and fixed width/height pixels. By providing the remaining structure alongside a screenshot, it forces the LLM to write perfect Flex/Grid-based Tailwind responsive code.

📥 Asset Auto-fetcher: Tracks local Figma image URLs embedded in the component, automatically downloads them to your project's src/assets folder, and generates the corresponding import statements (includes collision prevention logic).

🎨 Design Token Extraction: Scrapes hardcoded HEX/RGBA color codes to provide a summarized palette of used colors, helping the LLM construct consistent theming.

💡 Inline SVG Sanitization: A major culprit of token waste, inline <svg> blocks are replaced with PascalCase comments like {/* SVG Icon: ChevronRight */} to guide precise mapping to libraries like lucide-react.

🤖 Required Local AI Bootstrap: Ollama is required for local design-token pre-analysis. When the MCP server starts, it checks for Ollama, installs it when possible, starts the server, and pulls the default `llama3.2` model.

🚀 Installation
This package is designed to run anywhere natively as a global CLI tool.

Bash
# 1. Clone the repository
git clone [https://github.com/YourUsername/decrease-token-figma.git](https://github.com/YourUsername/decrease-token-figma.git)
cd decrease-token-figma

# 2. Build and link as a global package
# (Note: sudo may be required on Mac/Linux environments due to permissions)
npm run build
sudo npm link 
# or sudo npm install -g .
Ollama is prepared automatically when `figma-bridge` starts. You can run `npm run setup` ahead of time to install Ollama, start the server, and pull the default `llama3.2` model manually.

🛠 Usage
Once installed, you can start the proxy MCP server from any directory on your machine by simply running:

Bash
figma-bridge
Workflow Details

For global MCP clients whose working directory may not be your app project, pass `projectRoot` to the `get_optimized_figma_handoff` tool or set `FIGMA_BRIDGE_ROOT=/absolute/path/to/project`. Assets are written to `<projectRoot>/src/assets` by default. You can also override `FIGMA_BRIDGE_CACHE_DIR` and `FIGMA_BRIDGE_ASSET_DIR`.

Ollama bootstrap environment variables:

- `OLLAMA_BIN=/absolute/path/to/ollama`: use a specific Ollama binary.
- `FIGMA_BRIDGE_OLLAMA_MODEL=llama3.2`: change the required model.
- `FIGMA_BRIDGE_OLLAMA_AUTO_INSTALL=0`: disable runtime auto-install and fail if Ollama is missing.
- `FIGMA_BRIDGE_OLLAMA_AUTO_PULL=0`: disable runtime model download and fail if the model is missing.

Connects to the local API of the Figma Desktop App running in the background (Port 3845).

Provides the AI (e.g., Claude Desktop app) with the get_optimized_figma_handoff tool.

When you select a component in Figma and instruct the AI to render it:

figma-bridge fetches the original raw code.

Takes a screenshot of the selection.

Downloads images to the configured assets directory and losslessly compresses the code.

Returns the sanitized Markdown skeleton code (handoff.md) combined with the screenshot to the AI.

## 🧠 V5 Usage Guide — "The Bridge That Remembers"

Starting with V5, the bridge remembers every design it has seen. It never sends the same thing twice, and only reports what changed.

### Tool Input Options

The `get_optimized_figma_handoff` tool accepts the following arguments (all optional).

| Argument | Values | Default | Description |
|---|---|---|---|
| `projectRoot` | absolute path | `FIGMA_BRIDGE_ROOT` or cwd | Project root for assets and cache |
| `screenshot` | `path` / `inline` / `none` | `path` | `path` saves the PNG to the cache and returns **only its absolute path**. The AI reads it with the Read tool only when needed, saving image tokens. Use `inline` for clients without filesystem access (e.g. Claude Desktop) |
| `mode` | `auto` / `full` / `diff` | `auto` | `auto` returns a diff when a previous version of the same component exists in the cache, otherwise a full handoff |
| `force_refresh` | boolean | `false` | Ignore the cache and rerun the full pipeline even when the hash matches |

### Hash Cache

Results are stored keyed by the SHA-256 hash of the raw Figma response. If the design hasn't changed, the bridge skips the Figma round-trip, normalization, and Ollama analysis entirely.

```text
.figma_cache/
  nodes/ChatScreen_a3f29c01/
    raw.txt          # raw Figma response
    handoff.md       # full normalized handoff (always kept complete)
    diff.md          # generated only in diff mode
    screenshot.png   # screenshot
    meta.json        # component name, hash, timestamps
  registry.json      # local component registry
```

Only the 2 most recent versions per component are kept; older ones are pruned automatically.

### Repeated Subtree Deduplication

When the same structure repeats **3+ times** (with 3+ elements each), it is compressed into one component definition plus instance calls. Differences in text, image sources, and classes are automatically promoted to props; repetitions beyond 5 instances are summarized in an instance data table. Chat lists and card grids benefit the most.

### Local Component Registry (Local Code Connect)

Components extracted by the bridge are automatically registered in `.figma_cache/registry.json` with their structure hash. When the same structure appears in a later handoff, the definition is replaced with a **one-line "reuse the existing component" instruction**.

To register components you've already written, call the `sync_component_registry` tool. It scans `<projectRoot>/src/components/*.tsx` and adds component names and props to the registry.

### Diff Handoff

When you re-fetch a screen the designer modified (`mode: auto`), the bridge compares it against the previous version and sends **only what changed**:

```markdown
# Diff Handoff: ChatInput (previous a3f29c01 -> current 9b1d44e2)

This screen is already implemented. Apply only the changes below.

1. Text change: "전송" -> "보내기"
2. className change: "bg-[#3B82F6]" -> "bg-[#2563EB]"
```

If more than 40% of the lines changed, the diff is meaningless, so the bridge automatically falls back to a full handoff.

### npm Scripts

```bash
npm run build     # TypeScript build (build/)
npm test          # unit tests (tests/)
npm run setup     # install Ollama, start server, pull llama3.2 (opt-in)
npm run measure   # measure compression ratio vs raw
```

### Verifying Results with the Demo App

`test/` is a Vite + React + Tailwind app for rendering generated components.

```bash
cd test
npm install
npm run dev   # http://localhost:5173
```

Drop generated components into `test/src/components/` and import them from `App.tsx`.

⚠️ LLM Prompt Guidelines (Behavioral Guidelines)
When an AI Agent (like Claude) works alongside this pipeline, it MUST strictly follow these rules:

Rely on the 'Screenshot' for Visual Layout: The provided code is merely a skeleton. Visually inspect the margins and arrangements in the screenshot to deduce and manually write Tailwind flex, gap, p-*, and rounded-* classes.

Rely on the 'Skeleton Code' for Text and Data: To prevent hallucinations, perfectly reflect the hardcoded text, hex colors, and font weights present in the skeleton code.

Refactor Asset Variable Names: Mechanically extracted names like Component_imgVariant.png should be meaningfully refactored to semantic variables like avatarImage or logoIcon before applying them to the component.

NO Hardcoding Inline SVGs: Do NOT write raw <svg> tags. For commented areas like {/* SVG Icon: IconName */}, look at the screenshot and substitute it directly with an equivalent component from lucide-react.

📝 License
MIT License. Feel free to modify and use it.
Cheers to frontend productivity innovation! 🎉
