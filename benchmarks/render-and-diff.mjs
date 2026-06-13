#!/usr/bin/env node
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TEST_DIR = path.join(ROOT, 'test');
const SUBJECT_PATH = path.join(TEST_DIR, 'src', 'components', 'BenchmarkSubject.tsx');

async function main() {
    const { slug, resultDir: resultDirArg } = parseArgs(process.argv.slice(2));
    if (!slug) {
        console.error('Usage: node benchmarks/render-and-diff.mjs <slug> [--result-dir <path>]');
        process.exit(1);
    }

    const fixtureDir = path.join(ROOT, 'benchmarks', 'fixtures', slug);
    const resultDir = resultDirArg
        ? path.resolve(resultDirArg)
        : path.join(ROOT, 'benchmarks', 'results', slug);
    const referencePath = path.join(fixtureDir, 'reference.png');
    const metaPath = path.join(fixtureDir, 'meta.json');
    const reportPath = path.join(resultDir, 'report.json');

    await assertFile(referencePath, 'Missing fixture reference.png. Run capture first.');
    await assertFile(path.join(resultDir, 'vanilla.tsx'), 'Missing results/<slug>/vanilla.tsx.');
    await assertFile(path.join(resultDir, 'bridge.tsx'), 'Missing results/<slug>/bridge.tsx.');
    await fs.mkdir(resultDir, { recursive: true });

    const originalSubject = await fs.readFile(SUBJECT_PATH, 'utf-8');
    const reference = PNG.sync.read(await fs.readFile(referencePath));
    const meta = await readJsonIfExists(metaPath);
    const viewport = normalizeViewport(meta.viewport, reference);
    const port = await getFreePort(5173);
    const vite = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
        cwd: TEST_DIR,
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    vite.stdout.on('data', chunk => process.stderr.write(chunk));
    vite.stderr.on('data', chunk => process.stderr.write(chunk));

    let browser;
    try {
        await waitForServer(`http://127.0.0.1:${port}/`);
        browser = await chromium.launch();
        const report = await readJsonIfExists(reportPath);
        report.slug = slug;
        report.diffedAt = new Date().toISOString();
        report.viewport = viewport;

        for (const mode of ['vanilla', 'bridge']) {
            const sourcePath = path.join(resultDir, `${mode}.tsx`);
            await fs.copyFile(sourcePath, SUBJECT_PATH);
            await pause(400);

            const screenshotPath = path.join(resultDir, `${mode}.png`);
            const diffPath = path.join(resultDir, `${mode}.diff.png`);
            await screenshot(browser, port, viewport, screenshotPath, mode);
            const diff = await comparePngs(referencePath, screenshotPath, diffPath);

            report[mode] = {
                ...(report[mode] ?? {}),
                screenshotPath: path.relative(ROOT, screenshotPath),
                diffPath: path.relative(ROOT, diffPath),
                similarityPct: diff.similarityPct,
                mismatchPixels: diff.mismatchPixels,
                comparedPixels: diff.comparedPixels,
            };
        }

        await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf-8');
        console.log(JSON.stringify(report, null, 2));
    } finally {
        if (browser) await browser.close();
        await fs.writeFile(SUBJECT_PATH, originalSubject, 'utf-8');
        vite.kill('SIGTERM');
    }
}

function parseArgs(args) {
    let slug = '';
    let resultDir = '';
    for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        if (arg === '--result-dir') {
            resultDir = args[++index] ?? '';
        } else if (!slug) {
            slug = arg;
        }
    }
    return { slug, resultDir };
}

async function screenshot(browser, port, viewport, outputPath, mode) {
    const page = await browser.newPage({ viewport });
    await page.goto(`http://127.0.0.1:${port}/?benchmark=1&case=${mode}`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: outputPath, fullPage: false });
    await page.close();
}

async function comparePngs(referencePath, actualPath, diffPath) {
    const reference = PNG.sync.read(await fs.readFile(referencePath));
    const actual = PNG.sync.read(await fs.readFile(actualPath));
    const width = Math.max(reference.width, actual.width);
    const height = Math.max(reference.height, actual.height);
    const refCanvas = copyToCanvas(reference, width, height);
    const actualCanvas = copyToCanvas(actual, width, height);
    const diff = new PNG({ width, height });
    const mismatchPixels = pixelmatch(refCanvas.data, actualCanvas.data, diff.data, width, height, { threshold: 0.1 });
    await fs.writeFile(diffPath, PNG.sync.write(diff));
    const comparedPixels = width * height;
    const similarityPct = Number((100 - (mismatchPixels / comparedPixels) * 100).toFixed(2));
    return { mismatchPixels, comparedPixels, similarityPct };
}

function copyToCanvas(source, width, height) {
    const canvas = new PNG({ width, height });
    canvas.data.fill(255);
    for (let y = 0; y < source.height; y++) {
        for (let x = 0; x < source.width; x++) {
            const sourceIndex = (source.width * y + x) << 2;
            const targetIndex = (width * y + x) << 2;
            canvas.data[targetIndex] = source.data[sourceIndex];
            canvas.data[targetIndex + 1] = source.data[sourceIndex + 1];
            canvas.data[targetIndex + 2] = source.data[sourceIndex + 2];
            canvas.data[targetIndex + 3] = source.data[sourceIndex + 3];
        }
    }
    return canvas;
}

function normalizeViewport(metaViewport, reference) {
    const width = Number(metaViewport?.width ?? reference.width);
    const height = Number(metaViewport?.height ?? reference.height);
    return { width, height };
}

async function getFreePort(start) {
    for (let port = start; port < start + 100; port++) {
        if (await canListen(port)) return port;
    }
    throw new Error(`No free port found from ${start} to ${start + 99}.`);
}

function canListen(port) {
    return new Promise(resolve => {
        const server = createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => server.close(() => resolve(true)));
        server.listen(port, '127.0.0.1');
    });
}

async function waitForServer(url) {
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
        try {
            const response = await fetch(url);
            if (response.ok) return;
        } catch (_) { }
        await pause(250);
    }
    throw new Error(`Timed out waiting for Vite at ${url}`);
}

function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function assertFile(filePath, message) {
    try {
        await fs.access(filePath);
    } catch (_) {
        throw new Error(message);
    }
}

async function readJsonIfExists(filePath) {
    try {
        return JSON.parse(await fs.readFile(filePath, 'utf-8'));
    } catch (_) {
        return {};
    }
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
