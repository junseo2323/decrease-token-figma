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
    /** SVG 를 React 컴포넌트로 변환할지, 주석으로만 남길지 (기본값: true) */
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
        // 소형 모델 과부하 방지: 4000자 초과 시 잘라냄
        const truncated = code.length > 4000
            ? code.substring(0, 4000) + '\n...(truncated)'
            : code;

        const prompt = `You are a UI component analyzer. Analyze this UI skeleton code and return ONLY a raw JSON object. No markdown, no explanation, no code blocks.

Code:
${truncated}

Return exactly this JSON structure:
{"summary":"1-2 sentence description of what this UI component is and does","colors":["list every unique hex or rgba color value found in className strings"],"texts":["list every unique user-visible text string"]}`;

        try {
            // Ollama 서버 상태 확인
            const healthCheck = await fetch('http://localhost:11434/api/tags', {
                signal: AbortSignal.timeout(3000),
            });

            if (!healthCheck.ok) {
                throw new Error(`Ollama health check failed: HTTP ${healthCheck.status}`);
            }

            console.error(`🤖 Ollama 에 분석 요청 중...`);
            const startTime = Date.now();

            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt,
                    stream: false,
                    // 소형 모델이 JSON 외 형식을 섞어 반환하는 것을 막는다
                    format: 'json',
                }),
                signal: AbortSignal.timeout(90000),
            });

            if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);

            const data = await response.json() as { response: string };
            const elapsed = Date.now() - startTime;

            // JSON 추출 시도 (여러 패턴)
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
                console.error(`⚠️  JSON 을 찾을 수 없음. Ollama 응답: ${data.response.substring(0, 200)}...`);
                throw new Error('No JSON found in Ollama response');
            }

            return JSON.parse(jsonMatch[0]) as OllamaAnalysis;
        } catch (error) {
            const errorMsg = (error as Error).message;
            if (errorMsg.includes('fetch failed') || errorMsg.includes('timeout')) {
                console.error(this.requireOllama
                    ? `⚠️  Ollama 서버 연결 실패. 필수 디자인 토큰 분석을 실행할 수 없습니다.`
                    : `⚠️  Ollama 서버 연결 실패. 디자인 토큰 분석을 건너뜁니다.`);
            } else if (errorMsg.includes('No JSON found')) {
                console.error(`⚠️  Ollama 가 JSON 이 아닌 다른 형식을 반환했습니다.`);
            } else if (errorMsg.includes('JSON.parse')) {
                console.error(`⚠️  JSON 파싱 실패: ${errorMsg}`);
            } else {
                console.error(`⚠️  Ollama 분석 실패: ${errorMsg}`);
            }
            if (this.requireOllama) {
                throw new Error(`Ollama 분석은 필수입니다. MCP 부팅 시 설치/실행/모델 준비가 완료되어야 합니다. 원인: ${errorMsg}`);
            }
            return null;
        }
    }

    // Figma가 XML 레이아웃 구조를 반환하는지 감지 (복수 선택, Dev Mode 미설정 등)
    private isXmlLayout(text: string): boolean {
        return text.trimStart().startsWith('<');
    }

    // XML 레이아웃 데이터 정제: 좌표/장식 제거 후 구조 + 텍스트만 남김
    private cleanXmlLayout(rawXml: string): string {
        let xml = rawXml;

        // 숨겨진 요소 제거
        xml = xml.replace(/<[^>]* hidden="true"[^>]*\/>/g, '');
        xml = xml.replace(/<[^>]* hidden="true"[^>]*>[\s\S]*?<\/[a-z]+>/g, '');

        // 순수 장식 요소 제거 (vector, line, ellipse — 절대좌표 기반 도형)
        xml = xml.replace(/<vector[^>]*\/>/g, '');
        xml = xml.replace(/<line[^>]*\/>/g, '');
        xml = xml.replace(/<ellipse[^>]*\/>/g, '');

        // 절대 좌표 / 크기 속성 제거
        xml = xml.replace(/\s+x="[^"]*"/g, '');
        xml = xml.replace(/\s+y="[^"]*"/g, '');
        xml = xml.replace(/\s+width="[^"]*"/g, '');
        xml = xml.replace(/\s+height="[^"]*"/g, '');

        // id 속성 제거 (노이즈)
        xml = xml.replace(/\s+id="[^"]*"/g, '');

        // 빈 줄 정리
        xml = xml.replace(/^\s*[\r\n]/gm, '').trim();

        return xml;
    }

    public async extractTokens(componentName: string = "Component", providedRawText?: string) {
        const sourcePath = path.join(this.cacheDir, `selection_${componentName}.tsx`);

        try {
            const rawText = providedRawText || await fs.readFile(sourcePath, 'utf-8');
            console.error(`\n⏳ 피그마 에셋 추출 및 코드 최적화 중...`);

            const isXml = this.isXmlLayout(rawText);
            let finalCode: string = "";

            if (isXml) {
                // --- XML 포맷 처리 (복수 선택 / Dev Mode 미설정) ---
                console.error(`ℹ️  XML 레이아웃 포맷 감지 (${componentName}). 구조 정제 중...`);
                finalCode = this.cleanXmlLayout(rawText);
            } else {
                // --- JSX 포맷 처리 (단일 선택, 기존 로직) ---

                // 에셋 자동 다운로드
                const assetDir = this.assetDir;
                await fs.mkdir(assetDir, { recursive: true }).catch(() => { });

                const importStatements: string[] = [];
                const svgComponents: string[] = []; // SVG React 컴포넌트 정의
                const downloadPromises: Promise<void>[] = [];
                const svgDownloads: Map<string, string> = new Map(); // SVG 이름 → 컴포넌트명 매핑

                // 1. const 변수 선언에서 에셋 URL 추출 (png, jpg 만 - SVG 는 제외)
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
                            console.error(`✅ 에셋 다운로드: ${filename}`);
                        } catch (e) {
                            console.error(`❌ 에셋 다운로드 실패: ${filename}`);
                        }
                    })());

                    importStatements.push(`import ${varName} from './assets/${filename}';`);
                }

                // 2. 인라인 <svg> 태그 추출 (모드별 처리)
                const svgList: Array<{ name: string; description: string }> = [];

                const shouldConvertSvgToComponent = this.convertSvgToComponent && this.profile.framework === 'react';

                if (shouldConvertSvgToComponent) {
                    // Component 모드: SVG 를 React 컴포넌트로 변환
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

                        // SVG 내용을 React 컴포넌트로 변환
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
                        console.error(`✅ ${svgComponents.length}개의 SVG 를 React 컴포넌트로 변환했습니다!`);
                    }
                }

                if (downloadPromises.length > 0) {
                    await Promise.all(downloadPromises);
                    console.error(`✅ 총 ${downloadPromises.length}개의 에셋을 ${assetDir} 폴더에 저장했습니다!`);
                }

                let code = rawText;
                const funcIndex = rawText.indexOf('function ');
                if (funcIndex !== -1) {
                    code = rawText.substring(funcIndex);
                }

                // 인라인 <svg> → 모드별로 치환
                code = code.replace(/<svg[^>]*data-name="([^"]+)"[\s\S]*?<\/svg>/g, (_, name) => {
                    const pascal = name
                        .trim()
                        .replace(/[^a-zA-Z0-9]+(.)/g, (_: string, chr: string) => chr.toUpperCase())
                        .replace(/^[a-z]/, (m: string) => m.toUpperCase());
                    svgList.push({ name: pascal, description: name });

                    if (shouldConvertSvgToComponent) {
                        // Component 모드: 컴포넌트로 치환
                        const componentNameSvg = svgDownloads.get(pascal);
                        return componentNameSvg ? `<${componentNameSvg} />` : `{/* SVG Icon: ${pascal} */}`;
                    } else {
                        // Compact 모드: 주석으로만 남김
                        return `{/* SVG Icon: ${pascal} */}`;
                    }
                });
                // data-name 이 없는 SVG 는 주석 처리
                code = code.replace(/<svg[\s\S]*?<\/svg>/g, '{/* SVG Icon */}');

                // 로컬 이미지 변수 선언부 제거 (이미 import 로 변환됨)
                code = code.replace(/const\s+[a-zA-Z0-9_]+\s*=\s*"http:\/\/localhost[^"]*";\n/g, '');

                // SVG 컴포넌트를 함수 밖에 정의 (함수 분리)
                finalCode = code;

                if (svgComponents.length > 0) {
                    const funcStartIndex = code.indexOf('function ');
                    // function 이전에 SVG 컴포넌트 삽입
                    if (funcStartIndex >= 0) {
                        finalCode = svgComponents.join('\n\n') + '\n\n' + code;
                    } else {
                        finalCode = code + '\n\n' + svgComponents.join('\n');
                    }
                }

                // Compact 모드: SVG 목록을 코드 상단에 주석으로 추가
                if (svgList.length > 0 && !shouldConvertSvgToComponent) {
                    const svgComment = `\n/**\n * Required SVG icon replacements:\n${svgList.map(s => ` * - ${s.name}: replace the "${s.description}" icon for the ${this.profile.label} target.`).join('\n')}\n *\n * ${this.profile.iconGuidance}\n */\n`;
                    finalCode = svgComment + finalCode;
                    console.error(`✅ ${svgList.length}개의 SVG 를 주석으로 변환했습니다 (Compact 모드)!`);
                }

                // data-node-id 삭제
                finalCode = finalCode.replace(/\sdata-node-id="[^"]+"/g, '');

                // className 값 내부에서 절대 좌표 및 고정 픽셀 제거
                finalCode = finalCode.replace(/className="([^"]*)"/g, (_, classStr) => {
                    let cleaned = classStr;
                    // absolute, relative, fixed 등 제거
                    cleaned = cleaned.replace(/\b(absolute|relative|fixed|shrink-0|flex-none)\b/g, '');
                    // top-, left-, right-, bottom-, w-, h- 등 제거 (대괄호 포함)
                    cleaned = cleaned.replace(/\b(top|bottom|left|right|inset-x|inset-y|-translate-x|-translate-y|z|w|h|min-w|min-h|max-w|max-h|size)-\[?[^\s]*\]?/g, '');
                    // 여러 공백을 하나로 정리
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

            // Ollama로 디자인 토큰 분석 (JSX/XML 공통)
            console.error(`\n🤖 Ollama(${this.model})로 디자인 토큰 분석 중...`);
            const ollamaAnalysis = await this.analyzeWithOllama(finalCode);
            if (ollamaAnalysis) {
                console.error(`✅ Ollama 분석 완료`);
            }

            return { component_name: componentName, cleaned_code: finalCode, ollama: ollamaAnalysis, deduplication };
        } catch (error) {
            console.error("❌ 코드 클리닝 실패:", error);
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
        console.error(`✅ Handoff 마크다운 생성 완료: ${mdOutputPath}`);
    }
}
