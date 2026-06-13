#!/usr/bin/env node
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { PNG } from 'pngjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

async function main() {
    const slug = process.argv[2] ?? 'ditto-battery-pro';
    const nodeId = process.argv[3] ?? '2478-32218';
    const fileKey = process.argv[4] ?? 'WlvYAu5ONnUe7kVcDtmuqk';
    const fixtureDir = path.join(ROOT, 'benchmarks', 'fixtures', slug);
    const cacheDir = path.join(ROOT, 'benchmarks', '.cache', slug);

    await ensureBuildExists();
    await fs.mkdir(fixtureDir, { recursive: true });
    await fs.mkdir(cacheDir, { recursive: true });

    const { FigmaProxy } = await importCommonJs('../build/figma-proxy.js');
    const { FigmaNormalizer } = await importCommonJs('../build/figma-normalizer.js');

    const proxy = new FigmaProxy(cacheDir);
    try {
        await proxy.connect();
        const rawText = await proxy.getSelectionContext();
        const componentName = FigmaProxy.extractComponentName(rawText, slug);
        const screenshotContent = await proxy.getScreenshot(nodeId);
        await proxy.disconnect();

        const rawPath = path.join(fixtureDir, 'raw.figma.txt');
        const referencePath = path.join(fixtureDir, 'reference.png');
        const handoffPath = path.join(fixtureDir, 'handoff.md');
        await fs.writeFile(rawPath, rawText, 'utf-8');

        const image = screenshotContent?.find(item => item.type === 'image' && item.data);
        if (!image) throw new Error('Figma MCP did not return an image from get_screenshot.');
        const imageBuffer = Buffer.from(image.data, 'base64');
        await fs.writeFile(referencePath, imageBuffer);

        const normalizer = new FigmaNormalizer(cacheDir, process.env.OLLAMA_MODEL ?? 'llama3.2', {
            assetDir: path.join(fixtureDir, 'assets'),
            projectRoot: ROOT,
            requireOllama: false,
        });
        const tokens = await normalizer.extractTokens(componentName, rawText);
        await normalizer.generateHandoffMarkdown(tokens, {
            outputPath: handoffPath,
            screenshotPaths: [referencePath],
        });

        const dimensions = readPngDimensions(imageBuffer);
        await fs.writeFile(path.join(fixtureDir, 'meta.json'), JSON.stringify({
            slug,
            nodeId,
            fileKey,
            componentName,
            capturedAt: new Date().toISOString(),
            viewport: dimensions,
        }, null, 2) + '\n', 'utf-8');

        console.error(`Captured fixture: ${fixtureDir}`);
    } catch (error) {
        try { await proxy.disconnect(); } catch (_) { }
        console.error('Unable to capture from Figma MCP.');
        console.error('Open Figma Desktop, enable the local MCP server on port 3845, select the target node, then rerun this command.');
        console.error(`Cause: ${(error instanceof Error ? error.message : String(error))}`);
        process.exitCode = 1;
    }
}

async function ensureBuildExists() {
    try {
        await fs.access(path.join(ROOT, 'build', 'figma-proxy.js'));
        await fs.access(path.join(ROOT, 'build', 'figma-normalizer.js'));
    } catch (_) {
        throw new Error('Missing build output. Run `npm run build` before `node benchmarks/capture.mjs ...`.');
    }
}

async function importCommonJs(relativePath) {
    const module = await import(relativePath);
    return module.default ?? module;
}

function readPngDimensions(buffer) {
    const png = PNG.sync.read(buffer);
    return { width: png.width, height: png.height };
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
