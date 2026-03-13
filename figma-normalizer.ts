import * as fs from 'fs/promises';
import * as path from 'path';

export class FigmaNormalizer {
    private cacheDir: string;

    constructor(cacheDir: string = './.figma_cache', _model: string = '') {
        this.cacheDir = cacheDir;
    }

    public async extractTokens(componentName: string = "Component") {
        const sourcePath = path.join(this.cacheDir, `selection_${componentName}.tsx`);

        try {
            const rawText = await fs.readFile(sourcePath, 'utf-8');
            console.log(`\n⏳ 피그마 에셋 추출 및 코드 최적화 중...`);

            // 🌟 [NEW] 에셋 자동 다운로드 로직
            // Vite 기본 에셋 폴더 경로 설정 (실행하는 곳 기준)
            const assetDir = path.join(process.cwd(), 'src', 'assets');
            await fs.mkdir(assetDir, { recursive: true }).catch(() => { });

            // 피그마가 생성한 임시 로컬 이미지 URL 찾기
            const assetRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*"?(http:\/\/localhost:\d+\/assets\/[^"]+\.(svg|png|jpg))"?;/g;
            let match;
            const importStatements: string[] = [];
            const downloadPromises: Promise<void>[] = [];

            while ((match = assetRegex.exec(rawText)) !== null) {
                const varName = match[1]; // 예: imgVariant
                const url = match[2];     // 예: http://localhost:3845/...
                const ext = match[3];     // 예: png, svg
                const filename = `${componentName}_${varName}.${ext}`; // 예: Header_imgVariant.png

                // 백그라운드에서 파일 다운로드 실행
                downloadPromises.push((async () => {
                    try {
                        const res = await fetch(url);
                        const arrayBuffer = await res.arrayBuffer();
                        // src/assets 폴더에 실제 파일로 저장!
                        await fs.writeFile(path.join(assetDir, filename), Buffer.from(arrayBuffer));
                    } catch (e) {
                        console.error(`❌ 에셋 다운로드 실패: ${filename}`);
                    }
                })());

                // React 최상단에 들어갈 import 문으로 변환
                importStatements.push(`import ${varName} from './assets/${filename}';`);
            }

            if (downloadPromises.length > 0) {
                await Promise.all(downloadPromises);
                console.log(`✅ ${downloadPromises.length}개의 피그마 에셋을 src/assets 폴더에 성공적으로 저장했습니다!`);
            }

            // 1. 코드 블록만 추출
            let code = rawText;
            const funcIndex = rawText.indexOf('function ');
            if (funcIndex !== -1) {
                code = rawText.substring(funcIndex);
            }

            // 2. 인라인 <svg> 태그 처리 (토큰 낭비 주범)
            // data-name이 있는 경우: {/* SVG Icon: Home */} 형태로 주석 처리하여 Claude가 Lucide 아이콘 등을 쓰도록 유도
            code = code.replace(/<svg[^>]*data-name="([^"]+)"[\s\S]*?<\/svg>/g, (match, name) => {
                const pascalName = name
                    .trim()
                    .replace(/[^a-zA-Z0-9]+(.)/g, (m: string, chr: string) => chr.toUpperCase())
                    .replace(/^[a-z]/, (m: string) => m.toUpperCase());
                return `{/* SVG Icon: ${pascalName} */}`;
            });
            code = code.replace(/<svg[\s\S]*?<\/svg>/g, '{/* SVG Icon */}');

            // 3. 기존 로컬 이미지 변수 선언부 텍스트 제거 (import로 대체되었으므로)
            code = code.replace(/const img.*? = "http:\/\/localhost.*?;\n/g, '');

            // 4. 노드 ID 삭제
            code = code.replace(/\sdata-node-id="[^"]+"/g, '');

            // 5. 절대 좌표 및 고정 픽셀 제거 (V3.2 로직)
            code = code.replace(/(?:\s|^)(absolute|relative|fixed|shrink-0|flex-none)(?=\s|")/g, '');
            code = code.replace(/(?:\s|^)(top|bottom|left|right|inset(?:-[xy])?|-?translate-[xy]|z|w|h|min-w|min-h|max-w|max-h|size)-[^"\s]+/g, '');

            // 6. 빈 className 정리
            code = code.replace(/className="([^"]*)"/g, (match, p1) => {
                const cleaned = p1.replace(/\s+/g, ' ').trim();
                return cleaned ? `className="${cleaned}"` : '';
            });
            code = code.replace(/ className=""/g, '');

            // 최상단 import 문과 정제된 코드를 합치기
            const finalCode = importStatements.join('\n') + '\n\n' + code.trim();

            const colors = new Set<string>();
            const colorRegex = /(#[0-9a-fA-F]{3,8}\b|rgba?\([\d\s,.]+\))/gi;
            let colorMatch;
            while ((colorMatch = colorRegex.exec(code)) !== null) {
                colors.add(colorMatch[1] ? colorMatch[1].toUpperCase() : colorMatch[0]);
            }

            return { 
                component_name: componentName, 
                cleaned_code: finalCode,
                colors: Array.from(colors).sort()
            };

        } catch (error) {
            console.error("❌ 코드 클리닝 실패:", error);
            throw error;
        }
    }

    public async generateHandoffMarkdown(data: any) {
        const colorSummary = data.colors && data.colors.length > 0 
            ? `\n### 🎨 Design Tokens (Colors)\n\`${data.colors.join('\`, \`')}\`\n\n`
            : '';

        const mdContent = `# 🎨 Optimized Figma React Code: ${data.component_name}
${colorSummary}> **지시사항:**
> 1. 제공된 코드는 절대 좌표가 제거된 뼈대입니다. '스크린샷 이미지'를 눈으로 보고 레이아웃(flex, gap, padding 등)을 추가하여 반응형으로 완성하세요.
> 2. 피그마의 원본 이미지 에셋들(일러스트, 복잡한 SVG 등)은 **이미 \`src/assets\` 폴더에 다운로드되어 상단에 import 선언되어 있습니다.** 코드에 있는 그대로(예: \`src={imgVariant}\`) 사용하세요.
> 3. 주석 처리된 \`{/* SVG Icon: 이름 */}\` 부분은 \`lucide-react\` 같은 범용 아이콘 라이브러리를 사용하여 알맞게 대체하세요.

\`\`\`tsx
${data.cleaned_code}
\`\`\`
`;

        const mdOutputPath = path.join(this.cacheDir, `handoff.md`);
        await fs.writeFile(mdOutputPath, mdContent, 'utf-8');
    }
}