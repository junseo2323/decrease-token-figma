import * as fs from 'fs/promises';
import * as path from 'path';

interface OllamaAnalysis {
    summary: string;
    colors: string[];
    texts: string[];
}

export class FigmaNormalizer {
    private cacheDir: string;
    private model: string;

    constructor(cacheDir: string = './.figma_cache', model: string = 'llama3.2') {
        this.cacheDir = cacheDir;
        this.model = model;
    }

    private async analyzeWithOllama(code: string): Promise<OllamaAnalysis | null> {
        // 소형 모델 과부하 방지: 4000자 초과 시 잘라냄
        const truncated = code.length > 4000
            ? code.substring(0, 4000) + '\n...(truncated)'
            : code;

        const prompt = `You are a UI component analyzer. Analyze this React skeleton code and return ONLY a raw JSON object. No markdown, no explanation, no code blocks.

Code:
${truncated}

Return exactly this JSON structure:
{"summary":"1-2 sentence description of what this UI component is and does","colors":["list every unique hex or rgba color value found in className strings"],"texts":["list every unique user-visible text string"]}`;

        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt,
                    stream: false,
                }),
                signal: AbortSignal.timeout(30000),
            });

            if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);

            const data = await response.json() as { response: string };
            const jsonMatch = data.response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in Ollama response');

            return JSON.parse(jsonMatch[0]) as OllamaAnalysis;
        } catch (error) {
            console.error(`⚠️  Ollama 분석 실패 (정규식 결과만 반환): ${(error as Error).message}`);
            return null;
        }
    }

    // Figma가 XML 레이아웃 구조를 반환하는지 감지 (복수 선택, Dev Mode 미설정 등)
    private isXmlLayout(text: string): boolean {
        return text.trimStart().startsWith('<') && !text.includes('function ');
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

    public async extractTokens(componentName: string = "Component") {
        const sourcePath = path.join(this.cacheDir, `selection_${componentName}.tsx`);

        try {
            const rawText = await fs.readFile(sourcePath, 'utf-8');
            console.error(`\n⏳ 피그마 에셋 추출 및 코드 최적화 중...`);

            const isXml = this.isXmlLayout(rawText);
            let finalCode: string;

            if (isXml) {
                // --- XML 포맷 처리 (복수 선택 / Dev Mode 미설정) ---
                console.error(`ℹ️  XML 레이아웃 포맷 감지 (${componentName}). 구조 정제 중...`);
                finalCode = this.cleanXmlLayout(rawText);
            } else {
                // --- JSX 포맷 처리 (단일 선택, 기존 로직) ---

                // 에셋 자동 다운로드
                const assetDir = path.join(process.cwd(), 'src', 'assets');
                await fs.mkdir(assetDir, { recursive: true }).catch(() => { });

                const assetRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*"?(http:\/\/localhost:\d+\/assets\/[^"]+\.(svg|png|jpg))"?;/g;
                let match;
                const importStatements: string[] = [];
                const downloadPromises: Promise<void>[] = [];

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
                        } catch (e) {
                            console.error(`❌ 에셋 다운로드 실패: ${filename}`);
                        }
                    })());

                    importStatements.push(`import ${varName} from './assets/${filename}';`);
                }

                if (downloadPromises.length > 0) {
                    await Promise.all(downloadPromises);
                    console.error(`✅ ${downloadPromises.length}개의 피그마 에셋을 src/assets 폴더에 저장했습니다!`);
                }

                let code = rawText;
                const funcIndex = rawText.indexOf('function ');
                if (funcIndex !== -1) {
                    code = rawText.substring(funcIndex);
                }

                // 인라인 <svg> → PascalCase 주석 치환
                code = code.replace(/<svg[^>]*data-name="([^"]+)"[\s\S]*?<\/svg>/g, (_, name) => {
                    const pascal = name
                        .trim()
                        .replace(/[^a-zA-Z0-9]+(.)/g, (_: string, chr: string) => chr.toUpperCase())
                        .replace(/^[a-z]/, (m: string) => m.toUpperCase());
                    return `{/* SVG Icon: ${pascal} */}`;
                });
                code = code.replace(/<svg[\s\S]*?<\/svg>/g, '{/* SVG Icon */}');

                // 로컬 이미지 변수 선언부 제거
                code = code.replace(/const\s+[a-zA-Z0-9_]+\s*=\s*"http:\/\/localhost[^"]*";\n/g, '');

                // data-node-id 삭제
                code = code.replace(/\sdata-node-id="[^"]+"/g, '');

                // 절대 좌표 및 고정 픽셀 제거
                code = code.replace(/(?:\s|^)(absolute|relative|fixed|shrink-0|flex-none)(?=\s|")/g, '');
                code = code.replace(/(?:\s|^)(top|bottom|left|right|inset(?:-[xy])?|-?translate-[xy]|z|w|h|min-w|min-h|max-w|max-h|size)-[^"\s]+/g, '');

                // 빈 className 정리
                code = code.replace(/className="([^"]*)"/g, (_, p1) => {
                    const cleaned = p1.replace(/\s+/g, ' ').trim();
                    return cleaned ? `className="${cleaned}"` : '';
                });
                code = code.replace(/ className=""/g, '');

                finalCode = (importStatements.length ? importStatements.join('\n') + '\n\n' : '') + code.trim();
            }

            // Ollama로 디자인 토큰 분석 (JSX/XML 공통)
            console.error(`\n🤖 Ollama(${this.model})로 디자인 토큰 분석 중...`);
            const ollamaAnalysis = await this.analyzeWithOllama(finalCode);
            if (ollamaAnalysis) {
                console.error(`✅ Ollama 분석 완료`);
            }

            return { component_name: componentName, cleaned_code: finalCode, ollama: ollamaAnalysis };

        } catch (error) {
            console.error("❌ 코드 클리닝 실패:", error);
            throw error;
        }
    }

    public async generateHandoffMarkdown(data: { component_name: string; cleaned_code: string; ollama: OllamaAnalysis | null }) {
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

| 항목 | 값 |
|---|---|
| 🎨 Colors | ${colors} |
| 📝 Texts | ${texts} |

---
`;
        }

        const mdContent = `# 🎨 Optimized Figma React Code: ${data.component_name}
${ollamaSection}
> 🚨 **[매우 중요] LLM 행동 교정 지시사항 (CRITICAL INSTRUCTION)** 🚨
> 너는 지금 전달받은 스크린샷과 아래의 뼈대 코드를 결합하여 완벽한 UI를 구현해야 한다. 코드를 작성하기 전, 반드시 아래의 5가지 원칙을 100% 준수해라.
>
> 1. **레이아웃(배치)은 '비전' 기반:** 요소들의 가로/세로 배치(flex, grid 등)와 전체적인 여백의 비율은 함께 전달된 **'스크린샷 이미지'를 눈으로 직접 확인**하고 구성해라.
> 2. **정확한 수치(디자인 토큰)는 '텍스트' 기반:** 색상, 폰트 크기, 패딩, 둥글기 값은 네가 임의로 기본 클래스(bg-gray-100 등)로 때려 맞추지 마라. **반드시 아래 '뼈대 코드'에 하드코딩되어 있는 정확한 값(Hex 코드, 패딩 수치 등)을 100% 그대로 복사해서 사용해라.**
> 3. **문구 및 데이터 보존:** 뼈대 코드에 있는 실제 텍스트(서비스 고유 명사 등)는 절대 환각으로 지어내지 말고 그대로 적용해라.
> 4. **에셋 변수명 리팩토링 필수:** 상단에 import 된 무의미한 변수명(\`imgVariant\` 등)은 컴포넌트에 적용할 때 반드시 \`avatarImage\`, \`logoIcon\` 등 역할에 맞는 시맨틱한 이름으로 변경해라.
> 5. **인라인 SVG 금지:** 주석 처리된 \`{/* SVG Icon: 이름 */}\` 부분은 무조건 \`lucide-react\` 컴포넌트로 대체하라. 픽셀이 조금 다르다는 이유로 절대 \`<svg>\` 태그를 직접 하드코딩하지 마라.

\`\`\`tsx
${data.cleaned_code}
\`\`\`
`;

        const mdOutputPath = path.join(this.cacheDir, `handoff.md`);
        await fs.writeFile(mdOutputPath, mdContent, 'utf-8');
        console.error(`✅ Handoff 마크다운 생성 완료: ${mdOutputPath}`);
    }
}
