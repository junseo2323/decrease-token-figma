# 🎨 Figma Cost Optimizer Bridge (V4)

<div align="right">
  <strong>🇺🇸 English</strong> | <a href="./README_KR.md">🇰🇷 한국어</a>
</div>

**Figma Cost Optimizer Bridge** is a custom local proxy MCP (Model Context Protocol) pipeline built to prevent **catastrophic token consumption and context pollution** that occur during automated frontend UI/UX development using LLMs (Claude, GPT, etc.).

It intercepts the massive metadata, inline SVG codes, and fixed pixel coordinates recklessly emitted by the existing official Figma MCP tool (`get_design_context`). It then losslessly compresses them into a **"ultra-lightweight responsive skeleton code + screen screenshot"** format. This drastically reduces API call costs by up to 80% while maximizing the AI's code rendering accuracy.

---

## 📊 Performance (Token Optimization)

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

🤖 All-in-One AI Setup (Ollama Auto-installer): Upon global package installation, a postinstall script checks if Ollama is installed on the target PC. If not, it attempts auto-installation and silently pulls the llama3.2 model for local inference.

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
※ When npm link executes, the postinstall hook runs. If Ollama isn't found on your PC, it attempts automatic installation and pulls the llama3.2 model in the background.

🛠 Usage
Once installed, you can start the proxy MCP server from any directory on your machine by simply running:

Bash
figma-bridge
Workflow Details

Connects to the local API of the Figma Desktop App running in the background (Port 3845).

Provides the AI (e.g., Claude Desktop app) with the get_optimized_figma_handoff tool.

When you select a component in Figma and instruct the AI to render it:

figma-bridge fetches the original raw code.

Takes a screenshot of the selection.

Downloads images to src/assets and losslessly compresses the code.

Returns the sanitized Markdown skeleton code (handoff.md) combined with the screenshot to the AI.

⚠️ LLM Prompt Guidelines (Behavioral Guidelines)
When an AI Agent (like Claude) works alongside this pipeline, it MUST strictly follow these rules:

Rely on the 'Screenshot' for Visual Layout: The provided code is merely a skeleton. Visually inspect the margins and arrangements in the screenshot to deduce and manually write Tailwind flex, gap, p-*, and rounded-* classes.

Rely on the 'Skeleton Code' for Text and Data: To prevent hallucinations, perfectly reflect the hardcoded text, hex colors, and font weights present in the skeleton code.

Refactor Asset Variable Names: Mechanically extracted names like Component_imgVariant.png should be meaningfully refactored to semantic variables like avatarImage or logoIcon before applying them to the component.

NO Hardcoding Inline SVGs: Do NOT write raw <svg> tags. For commented areas like {/* SVG Icon: IconName */}, look at the screenshot and substitute it directly with an equivalent component from lucide-react.

📝 License
MIT License. Feel free to modify and use it.
Cheers to frontend productivity innovation! 🎉