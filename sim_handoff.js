const { FigmaProxy } = require('./build/figma-proxy.js');
const { FigmaNormalizer } = require('./build/figma-normalizer.js');

async function main() {
    const cacheDir = './.figma_cache';
    const proxy = new FigmaProxy(cacheDir);
    const normalizer = new FigmaNormalizer(cacheDir);

    try {
        await proxy.connect();
        const rawText = await proxy.getSelectionContext();
        await proxy.getScreenshot();
        await proxy.disconnect();

        const match = rawText.match(/function\s+([A-Za-z0-9_]+)/);
        const componentName = match ? match[1] : "UnknownComponent";

        const tokens = await normalizer.extractTokens(componentName);
        await normalizer.generateHandoffMarkdown(tokens);
        console.log("SUCCESS");
    } catch (e) {
        console.error(e);
        try { await proxy.disconnect(); } catch (_) { }
    }
}
main();
