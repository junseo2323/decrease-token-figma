#!/usr/bin/env node
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { PNG } from 'pngjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CHARS_PER_TOKEN = Number(process.env.CHARS_PER_TOKEN ?? 4);
const IMAGE_PIXELS_PER_TOKEN = Number(process.env.IMAGE_PIXELS_PER_TOKEN ?? 750);

async function main() {
    const { slug, resultDir: resultDirArg } = parseArgs(process.argv.slice(2));
    if (!slug) {
        console.error('Usage: node benchmarks/measure-tokens.mjs <slug> [--result-dir <path>]');
        process.exit(1);
    }

    const fixtureDir = path.join(ROOT, 'benchmarks', 'fixtures', slug);
    const resultDir = resultDirArg
        ? path.resolve(resultDirArg)
        : path.join(ROOT, 'benchmarks', 'results', slug);
    const rawPath = path.join(fixtureDir, 'raw.figma.txt');
    const handoffPath = path.join(fixtureDir, 'handoff.md');
    const referencePath = path.join(fixtureDir, 'reference.png');
    const reportPath = path.join(resultDir, 'report.json');

    const [raw, handoff] = await Promise.all([
        fs.readFile(rawPath, 'utf-8'),
        fs.readFile(handoffPath, 'utf-8'),
    ]);
    const reference = await readOptionalPng(referencePath);
    const imageTokens = reference
        ? Math.ceil((reference.width * reference.height) / IMAGE_PIXELS_PER_TOKEN)
        : 0;

    await fs.mkdir(resultDir, { recursive: true });
    const previous = await readJsonIfExists(reportPath);
    const report = {
        ...previous,
        slug,
        measuredAt: new Date().toISOString(),
        tokenEstimate: {
            charsPerToken: CHARS_PER_TOKEN,
            imagePixelsPerToken: IMAGE_PIXELS_PER_TOKEN,
            note: 'Text tokens are a chars/4 estimate by default. Image tokens use pixels/750 unless overridden by env.',
        },
        vanilla: {
            ...(previous.vanilla ?? {}),
            inputPath: path.relative(ROOT, rawPath),
            inputChars: raw.length,
            estInputTokens: estimateTextTokens(raw),
            imageTokens,
            totalEstTokens: estimateTextTokens(raw) + imageTokens,
        },
        bridge: {
            ...(previous.bridge ?? {}),
            inputPath: path.relative(ROOT, handoffPath),
            inputChars: handoff.length,
            estInputTokens: estimateTextTokens(handoff),
            imageTokens: 0,
            totalEstTokens: estimateTextTokens(handoff),
        },
    };
    report.savingsPct = pct(
        report.vanilla.totalEstTokens - report.bridge.totalEstTokens,
        report.vanilla.totalEstTokens
    );

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf-8');
    console.log(JSON.stringify(report, null, 2));
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

function estimateTextTokens(value) {
    return Math.ceil(value.length / CHARS_PER_TOKEN);
}

function pct(numerator, denominator) {
    if (!denominator) return 0;
    return Number(((numerator / denominator) * 100).toFixed(2));
}

async function readOptionalPng(filePath) {
    try {
        const buffer = await fs.readFile(filePath);
        const png = PNG.sync.read(buffer);
        return { width: png.width, height: png.height };
    } catch (_) {
        return null;
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
