import * as fs from 'fs/promises';
import * as path from 'path';
import { ComponentRegistry } from './component-registry.js';
import { deduplicateSubtrees, DeduplicationResult } from './subtree-deduper.js';
import {
    buildInstructionBlock,
    getPrimaryComponentExtension,
    resolveProfile,
    TargetProfile,
} from './target-profiles.js';

interface OllamaAnalysis {
    summary: string;
    colors: string[];
    texts: string[];
}

interface FigmaNormalizerOptions {
    /** Convert SVGs into React components instead of leaving icon comments. Default: true. */
    convertSvgToComponent?: boolean;
    assetDir?: string;
    projectRoot?: string;
    enableDeduplication?: boolean;
    requireOllama?: boolean;
    profile?: TargetProfile;
}

export interface ExtractedFigmaTokens {
    component_name: string;
    cleaned_code: string;
    ollama: OllamaAnalysis | null;
    deduplication?: DeduplicationResult;
}

export interface HandoffMarkdownOptions {
    outputPath?: string;
    screenshotPaths?: string[];
    registryHints?: string[];
    profile?: TargetProfile;
}

export class FigmaNormalizer {
    private cacheDir: string;
    private model: string;
    private convertSvgToComponent: boolean;
    private assetDir: string;
    private projectRoot?: string;
    private enableDeduplication: boolean;
    private requireOllama: boolean;
    private profile: TargetProfile;

    constructor(cacheDir: string = './.figma_cache', model: string = 'llama3.2', options?: FigmaNormalizerOptions) {
        this.cacheDir = cacheDir;
        this.model = model;
        this.convertSvgToComponent = options?.convertSvgToComponent ?? true;
        this.assetDir = options?.assetDir ?? path.resolve('src', 'assets');
        this.projectRoot = options?.projectRoot;
        this.enableDeduplication = options?.enableDeduplication ?? true;
        this.requireOllama = options?.requireOllama ?? true;
        this.profile = options?.profile ?? resolveProfile();
    }

    private async analyzeWithOllama(code: string): Promise<OllamaAnalysis | null> {
        // Keep small local models responsive by truncating long inputs.
        const truncated = code.length > 4000
            ? code.substring(0, 4000) + '\n...(truncated)'
            : code;

        const prompt = `You are a UI component analyzer. Analyze this UI skeleton code and return ONLY a raw JSON object. No markdown, no explanation, no code blocks.

Code:
${truncated}

Return exactly this JSON structure:
{"summary":"1-2 sentence description of what this UI component is and does","colors":["list every unique hex or rgba color value found in className strings"],"texts":["list every unique user-visible text string"]}`;

        try {
            // Check Ollama server health before asking for analysis.
            const healthCheck = await fetch('http://localhost:11434/api/tags', {
                signal: AbortSignal.timeout(3000),
            });

            if (!healthCheck.ok) {
                throw new Error(`Ollama health check failed: HTTP ${healthCheck.status}`);
            }

            console.error(`🤖 Requesting analysis from Ollama...`);
            const startTime = Date.now();

            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt,
                    stream: false,
                    // Prevent small models from mixing in non-JSON prose.
                    format: 'json',
                }),
                signal: AbortSignal.timeout(90000),
            });

            if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);

            const data = await response.json() as { response: string };
            const elapsed = Date.now() - startTime;

            // Try several response shapes in case the local model wraps JSON.
            const jsonPatterns = [
                /\{[\s\S]*\}/,
                /```json\s*([\s\S]*?)\s*```/,
                /`([\s\S]*?)`/,
            ];

            let jsonMatch = null;
            for (const pattern of jsonPatterns) {
                jsonMatch = data.response.match(pattern);
                if (jsonMatch) break;
            }

            if (!jsonMatch) {
                console.error(`⚠️  Could not find JSON in the Ollama response: ${data.response.substring(0, 200)}...`);
                throw new Error('No JSON found in Ollama response');
            }

            return JSON.parse(jsonMatch[0]) as OllamaAnalysis;
        } catch (error) {
            const errorMsg = (error as Error).message;
            if (errorMsg.includes('fetch failed') || errorMsg.includes('timeout')) {
                console.error(this.requireOllama
                    ? `⚠️  Failed to connect to the Ollama server. Required design-token analysis cannot run.`
                    : `⚠️  Failed to connect to the Ollama server. Skipping design-token analysis.`);
            } else if (errorMsg.includes('No JSON found')) {
                console.error(`⚠️  Ollama returned a non-JSON response.`);
            } else if (errorMsg.includes('JSON.parse')) {
                console.error(`⚠️  Failed to parse JSON: ${errorMsg}`);
            } else {
                console.error(`⚠️  Ollama analysis failed: ${errorMsg}`);
            }
            if (this.requireOllama) {
                throw new Error(`Ollama analysis is required. MCP startup must install Ollama, start it, and prepare the model first. Cause: ${errorMsg}`);
            }
            return null;
        }
    }

    // Detect XML layout data from Figma, such as multi-selection or non-Dev-Mode output.
    private isXmlLayout(text: string): boolean {
        return text.trimStart().startsWith('<');
    }

    // Clean XML layout data by removing coordinates and decoration while keeping structure and text.
    private cleanXmlLayout(rawXml: string): string {
        let xml = rawXml;

        // Remove hidden elements.
        xml = xml.replace(/<[^>]* hidden="true"[^>]*\/>/g, '');
        xml = xml.replace(/<[^>]* hidden="true"[^>]*>[\s\S]*?<\/[a-z]+>/g, '');

        // Remove purely decorative absolute-positioned shapes.
        xml = xml.replace(/<vector[^>]*\/>/g, '');
        xml = xml.replace(/<line[^>]*\/>/g, '');
        xml = xml.replace(/<ellipse[^>]*\/>/g, '');

        // Remove absolute coordinates and size attributes.
        xml = xml.replace(/\s+x="[^"]*"/g, '');
        xml = xml.replace(/\s+y="[^"]*"/g, '');
        xml = xml.replace(/\s+width="[^"]*"/g, '');
        xml = xml.replace(/\s+height="[^"]*"/g, '');

        // Remove noisy id attributes.
        xml = xml.replace(/\s+id="[^"]*"/g, '');

        // Normalize blank lines.
        xml = xml.replace(/^\s*[\r\n]/gm, '').trim();

        return xml;
    }

    public async extractTokens(componentName: string = "Component", providedRawText?: string) {
        const sourcePath = path.join(this.cacheDir, `selection_${componentName}.tsx`);

        try {
            const rawText = providedRawText || await fs.readFile(sourcePath, 'utf-8');
            console.error(`\n⏳ Extracting Figma assets and optimizing code...`);

            const isXml = this.isXmlLayout(rawText);
            let finalCode: string = "";

            if (isXml) {
                // --- XML format handling (multi-selection / non-Dev-Mode output) ---
                console.error(`ℹ️  XML layout format detected (${componentName}). Cleaning structure...`);
                finalCode = this.cleanXmlLayout(rawText);
            } else {
                // --- JSX format handling (single selection) ---

                // Download external assets.
                const assetDir = this.assetDir;
                await fs.mkdir(assetDir, { recursive: true }).catch(() => { });

                const importStatements: string[] = [];
                const svgComponents: string[] = []; // SVG React component definitions.
                const downloadPromises: Promise<void>[] = [];
                const svgDownloads: Map<string, string> = new Map(); // SVG name to component name map.

                // 1. Extract asset URLs from const declarations (PNG/JPG only; SVG is handled separately).
                const assetRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*"?(http:\/\/localhost:\d+\/assets\/[^"]+\.(png|jpg))"?;/g;
                let match;
                while ((match = assetRegex.exec(rawText)) !== null) {
                    const varName = match[1];
                    const url = match[2];
                    const ext = match[3];
                    const filename = `${componentName}_${varName}.${ext}`;

                    downloadPromises.push((async () => {
                        try {
                            const res = await fetch(url);
                            const arrayBuffer = await res.arrayBuffer();
                            await fs.writeFile(path.join(assetDir, filename), Buffer.from(arrayBuffer));
                            console.error(`✅ Downloaded asset: ${filename}`);
                        } catch (e) {
                            console.error(`❌ Failed to download asset: ${filename}`);
                        }
                    })());

                    importStatements.push(`import ${varName} from './assets/${filename}';`);
                }

                // 2. Extract inline <svg> tags according to the current mode.
                const svgList: Array<{ name: string; description: string }> = [];

                const shouldConvertSvgToComponent = this.convertSvgToComponent && this.profile.framework === 'react';

                if (shouldConvertSvgToComponent) {
                    // Component mode: convert SVGs into React components.
                    const svgRegex = /<svg[^>]*data-name="([^"]+)"([\s\S]*?)<\/svg>/g;
                    let svgMatch;
                    while ((svgMatch = svgRegex.exec(rawText)) !== null) {
                        const svgName = svgMatch[1];
                        const svgContent = svgMatch[0];
                        const pascalName = svgName
                            .trim()
                            .replace(/[^a-zA-Z0-9]+(.)/g, (_: string, chr: string) => chr.toUpperCase())
                            .replace(/^[a-z]/, (m: string) => m.toUpperCase());
                        const componentNameSvg = `Svg${pascalName}`;

                        // Convert SVG markup into React component syntax.
                        let reactSvgContent = svgContent
                            .replace(/\sdata-name="[^"]+"/g, '')
                            .replace(/\sdata-node-id="[^"]+"/g, '')
                            .replace(/stroke-width/g, 'strokeWidth')
                            .replace(/stroke-linecap/g, 'strokeLinecap')
                            .replace(/stroke-linejoin/g, 'strokeLinejoin')
                            .replace(/fill-rule/g, 'fillRule')
                            .replace(/clip-rule/g, 'clipRule');

                        const reactComponent = `
const ${componentNameSvg} = (props: React.SVGProps<SVGSVGElement>) => (
  ${reactSvgContent}
);`;

                        svgComponents.push(reactComponent);
                        svgDownloads.set(pascalName, componentNameSvg);
                    }

                    if (svgComponents.length > 0) {
                        console.error(`✅ Converted ${svgComponents.length} SVG(s) into React components.`);
                    }
                }

                if (downloadPromises.length > 0) {
                    await Promise.all(downloadPromises);
                    console.error(`✅ Saved ${downloadPromises.length} asset(s) to ${assetDir}.`);
                }

                let code = rawText;
                const funcIndex = rawText.indexOf('function ');
                if (funcIndex !== -1) {
                    code = rawText.substring(funcIndex);
                }

                // Replace inline <svg> tags according to the active mode.
                code = code.replace(/<svg[^>]*data-name="([^"]+)"[\s\S]*?<\/svg>/g, (_, name) => {
                    const pascal = name
                        .trim()
                        .replace(/[^a-zA-Z0-9]+(.)/g, (_: string, chr: string) => chr.toUpperCase())
                        .replace(/^[a-z]/, (m: string) => m.toUpperCase());
                    svgList.push({ name: pascal, description: name });

                    if (shouldConvertSvgToComponent) {
                        // Component mode: replace with a component call.
                        const componentNameSvg = svgDownloads.get(pascal);
                        return componentNameSvg ? `<${componentNameSvg} />` : `{/* SVG Icon: ${pascal} */}`;
                    } else {
                        // Compact mode: keep an implementation hint only.
                        return `{/* SVG Icon: ${pascal} */}`;
                    }
                });
                // Turn SVGs without data-name into comments.
                code = code.replace(/<svg[\s\S]*?<\/svg>/g, '{/* SVG Icon */}');

                // Remove local image declarations now that imports were generated.
                code = code.replace(/const\s+[a-zA-Z0-9_]+\s*=\s*"http:\/\/localhost[^"]*";\n/g, '');

                // Define generated SVG components outside the main function.
                finalCode = code;

                if (svgComponents.length > 0) {
                    const funcStartIndex = code.indexOf('function ');
                    // Insert SVG components before the function declaration.
                    if (funcStartIndex >= 0) {
                        finalCode = svgComponents.join('\n\n') + '\n\n' + code;
                    } else {
                        finalCode = code + '\n\n' + svgComponents.join('\n');
                    }
                }

                // Compact mode: add the required SVG list as a comment at the top.
                if (svgList.length > 0 && !shouldConvertSvgToComponent) {
                    const svgComment = `\n/**\n * Required SVG icon replacements:\n${svgList.map(s => ` * - ${s.name}: replace the "${s.description}" icon for the ${this.profile.label} target.`).join('\n')}\n *\n * ${this.profile.iconGuidance}\n */\n`;
                    finalCode = svgComment + finalCode;
                    console.error(`✅ Converted ${svgList.length} SVG(s) into compact icon comments.`);
                }

                // Remove data-node-id attributes.
                finalCode = finalCode.replace(/\sdata-node-id="[^"]+"/g, '');

                // Remove absolute positioning and fixed pixel sizing from className values.
                finalCode = finalCode.replace(/className="([^"]*)"/g, (_, classStr) => {
                    let cleaned = classStr;
                    // Remove positioning utility classes.
                    cleaned = cleaned.replace(/\b(absolute|relative|fixed|shrink-0|flex-none)\b/g, '');
                    // Remove positional and fixed-size utility classes, including bracketed values.
                    cleaned = cleaned.replace(/\b(top|bottom|left|right|inset-x|inset-y|-translate-x|-translate-y|z|w|h|min-w|min-h|max-w|max-h|size)-\[?[^\s]*\]?/g, '');
                    // Collapse whitespace.
                    cleaned = cleaned.replace(/\s+/g, ' ').trim();
                    return cleaned ? `className="${cleaned}"` : '';
                });
                finalCode = finalCode.replace(/ className=""/g, '');

                finalCode = (importStatements.length ? importStatements.join('\n') + '\n\n' : '') + finalCode.trim();
            }

            let deduplication: DeduplicationResult | undefined;
            if (!isXml && this.enableDeduplication) {
                const registry = this.projectRoot
                    ? new ComponentRegistry(this.projectRoot, this.cacheDir, this.profile.componentExtensions)
                    : undefined;
                const registryData = registry ? await registry.pruneMissing() : undefined;
                deduplication = deduplicateSubtrees(finalCode, registryData);
                finalCode = deduplication.code;

                if (registry && deduplication.components.length > 0) {
                    for (const component of deduplication.components) {
                        if (component.reusedFrom) continue;
                        await registry.upsert({
                            name: component.name,
                            filePath: path.join('src', 'components', `${component.name}${getPrimaryComponentExtension(this.profile)}`),
                            structureHash: component.structureHash,
                            props: component.props,
                            source: 'bridge',
                        });
                    }
                }
            }

            // Analyze design tokens with Ollama for both JSX and XML inputs.
            console.error(`\n🤖 Analyzing design tokens with Ollama (${this.model})...`);
            const ollamaAnalysis = await this.analyzeWithOllama(finalCode);
            if (ollamaAnalysis) {
                console.error(`✅ Ollama analysis complete.`);
            }

            return { component_name: componentName, cleaned_code: finalCode, ollama: ollamaAnalysis, deduplication };
        } catch (error) {
            console.error("❌ Code cleanup failed:", error);
            throw error;
        }
    }

    public async generateHandoffMarkdown(data: ExtractedFigmaTokens, options: HandoffMarkdownOptions = {}) {
        const profile = options.profile ?? this.profile;
        let ollamaSection = '';
        if (data.ollama) {
            const colors = data.ollama.colors.length
                ? data.ollama.colors.map(c => `\`${c}\``).join(' ')
                : 'N/A';
            const texts = data.ollama.texts.length
                ? data.ollama.texts.map(t => `"${t}"`).join(', ')
                : 'N/A';

            ollamaSection = `
## 🤖 AI Pre-Analysis (Ollama · ${this.model})

> **Component Summary:** ${data.ollama.summary}

| Item | Value |
|---|---|
| Colors | ${colors} |
| Texts | ${texts} |

---
`;
        }

        const screenshotSection = options.screenshotPaths?.length
            ? `
## Screenshot Files

${options.screenshotPaths.map(file => `- ${file}`).join('\n')}

> Before deciding layout, read the image file paths above with the Read tool.

---
`
            : '';

        const hints = [
            ...(options.registryHints ?? []),
            ...(data.deduplication?.hints ?? []),
        ];
        const registryHintSection = hints.length
            ? `
## Local Component Reuse Hints

${hints.map(hint => `- ${hint}`).join('\n')}

---
`
            : '';

        const repeatedDataSection = data.deduplication?.instanceDataMarkdown
            ? `\n${data.deduplication.instanceDataMarkdown}\n`
            : '';

        const mdContent = `# 🎨 Optimized Figma ${profile.label} Code: ${data.component_name}
${ollamaSection}
${screenshotSection}
${registryHintSection}
${buildInstructionBlock(profile)}

\`\`\`${profile.codeFenceLang}
${data.cleaned_code}
\`\`\`
${repeatedDataSection}
`;

        const mdOutputPath = options.outputPath ?? path.join(this.cacheDir, `handoff.md`);
        await fs.writeFile(mdOutputPath, mdContent, 'utf-8');
        console.error(`✅ Handoff Markdown generated: ${mdOutputPath}`);
    }
}
