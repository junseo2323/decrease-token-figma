const { FigmaProxy } = require('./build/figma-proxy.js');
const { FigmaNormalizer } = require('./build/figma-normalizer.js');
const fs = require('fs/promises');
const path = require('path');

async function main() {
    const cacheDir = './.figma_cache';
    const proxy = new FigmaProxy(cacheDir);
    const normalizer = new FigmaNormalizer(cacheDir);

    try {
        await proxy.connect();
        const rawText = await proxy.getSelectionContext();
        await proxy.disconnect();

        const rawSize = rawText.length;
        
        const match = rawText.match(/function\s+([A-Za-z0-9_]+)/);
        const componentName = match ? match[1] : "UnknownComponent";

        const tokens = normalizer.extractTokens ? await normalizer.extractTokens(componentName) : [];
        if (normalizer.generateHandoffMarkdown) {
            await normalizer.generateHandoffMarkdown(tokens);
        }

        const mdContent = await fs.readFile(path.join(cacheDir, 'handoff.md'), 'utf-8');
        const optimizedSize = mdContent.length;

        console.log(`\n📊 비교 결과:`);
        console.log(`- 공식 MCP 원본 데이터 크기: ${rawSize} 자`);
        console.log(`- V4 최적화된 데이터 크기: ${optimizedSize} 자`);
        console.log(`- 절감률: ${((1 - optimizedSize/rawSize)*100).toFixed(1)}%`);
    } catch (e) {
        console.error(e);
        await proxy.disconnect();
    }
}
main();
