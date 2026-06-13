#!/usr/bin/env node
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

async function main() {
    const slug = process.argv[2];
    const experimentArg = process.argv[3];
    if (!slug) {
        console.error('Usage: node benchmarks/summarize-blind-runs.mjs <slug> [experiment-dir-or-id]');
        process.exit(1);
    }
    const experimentDir = experimentArg
        ? resolveExperimentDir(slug, experimentArg)
        : await latestExperimentDir(slug);
    const summaryPath = await summarizeExperiment({ slug, experimentDir, metadata: {} });
    console.log(summaryPath);
}

export async function summarizeExperiment({ slug, experimentDir, metadata }) {
    const runDirs = (await fs.readdir(experimentDir, { withFileTypes: true }))
        .filter(entry => entry.isDirectory() && /^run-\d+$/.test(entry.name))
        .map(entry => path.join(experimentDir, entry.name))
        .sort();
    if (runDirs.length === 0) throw new Error(`No run-* directories found in ${experimentDir}`);

    const rows = [];
    for (const runDir of runDirs) {
        const report = JSON.parse(await fs.readFile(path.join(runDir, 'report.json'), 'utf-8'));
        const generation = await readJsonIfExists(path.join(runDir, 'generation.json'));
        rows.push({
            runId: path.basename(runDir),
            savingsPct: report.savingsPct,
            vanillaSimilarityPct: report.vanilla?.similarityPct ?? null,
            bridgeSimilarityPct: report.bridge?.similarityPct ?? null,
            deltaSimilarityPct: (report.bridge?.similarityPct ?? 0) - (report.vanilla?.similarityPct ?? 0),
            vanillaRepairs: generation.variants?.vanilla?.repairCount ?? null,
            bridgeRepairs: generation.variants?.bridge?.repairCount ?? null,
            vanillaCompileFailed: Boolean(generation.variants?.vanilla?.compileFailed),
            bridgeCompileFailed: Boolean(generation.variants?.bridge?.compileFailed),
        });
    }

    const summary = {
        slug,
        experimentDir: path.relative(ROOT, experimentDir),
        generatedAt: new Date().toISOString(),
        ...metadata,
        runCount: rows.length,
        metrics: {
            savingsPct: stats(rows.map(row => row.savingsPct)),
            vanillaSimilarityPct: stats(rows.map(row => row.vanillaSimilarityPct)),
            bridgeSimilarityPct: stats(rows.map(row => row.bridgeSimilarityPct)),
            deltaSimilarityPct: stats(rows.map(row => row.deltaSimilarityPct)),
        },
        compileFailures: {
            vanilla: rows.filter(row => row.vanillaCompileFailed).length,
            bridge: rows.filter(row => row.bridgeCompileFailed).length,
        },
        rows,
    };

    await fs.writeFile(path.join(experimentDir, 'summary.json'), JSON.stringify(summary, null, 2) + '\n', 'utf-8');
    await fs.writeFile(path.join(experimentDir, 'SUMMARY.md'), renderMarkdown(summary), 'utf-8');
    return path.join(experimentDir, 'SUMMARY.md');
}

function renderMarkdown(summary) {
    const lines = [];
    lines.push(`# Blind LLM Benchmark: ${summary.slug}`);
    lines.push('');
    lines.push(`- Provider/model: ${summary.provider ?? 'n/a'} / ${summary.model ?? 'n/a'}`);
    lines.push(`- Runs: ${summary.runCount}`);
    lines.push(`- Temperature: ${summary.temperature ?? 'n/a'}`);
    lines.push(`- Max compile-only repairs: ${summary.maxRepairs ?? 'n/a'}`);
    lines.push('');
    lines.push('## Aggregate');
    lines.push('');
    lines.push('| Metric | Mean | Std dev | Min | Max |');
    lines.push('|---|---:|---:|---:|---:|');
    lines.push(metricRow('Token savings %', summary.metrics.savingsPct));
    lines.push(metricRow('Vanilla similarity %', summary.metrics.vanillaSimilarityPct));
    lines.push(metricRow('Bridge similarity %', summary.metrics.bridgeSimilarityPct));
    lines.push(metricRow('Bridge - vanilla similarity pp', summary.metrics.deltaSimilarityPct));
    lines.push('');
    lines.push('## Runs');
    lines.push('');
    lines.push('| Run | Savings % | Vanilla sim. | Bridge sim. | Delta pp | Vanilla repairs | Bridge repairs |');
    lines.push('|---|---:|---:|---:|---:|---:|---:|');
    for (const row of summary.rows) {
        lines.push(`| ${row.runId} | ${fmt(row.savingsPct)} | ${fmt(row.vanillaSimilarityPct)} | ${fmt(row.bridgeSimilarityPct)} | ${fmt(row.deltaSimilarityPct)} | ${row.vanillaRepairs ?? 'n/a'} | ${row.bridgeRepairs ?? 'n/a'} |`);
    }
    lines.push('');
    lines.push('## Method');
    lines.push('');
    lines.push('- Same provider, model, temperature, screenshot, output contract, and repair policy for both arms.');
    lines.push('- Vanilla arm receives only official Figma MCP raw context plus the reference screenshot.');
    lines.push('- Bridge arm receives only optimized handoff markdown plus the same reference screenshot.');
    lines.push('- Repair feedback is compile-only. No visual feedback is sent back to the model.');
    return lines.join('\n') + '\n';
}

function metricRow(label, value) {
    return `| ${label} | ${fmt(value.mean)} | ${fmt(value.stddev)} | ${fmt(value.min)} | ${fmt(value.max)} |`;
}

function stats(values) {
    const clean = values.filter(value => typeof value === 'number' && Number.isFinite(value));
    if (clean.length === 0) return { mean: null, stddev: null, min: null, max: null };
    const mean = clean.reduce((sum, value) => sum + value, 0) / clean.length;
    const variance = clean.reduce((sum, value) => sum + (value - mean) ** 2, 0) / clean.length;
    return {
        mean,
        stddev: Math.sqrt(variance),
        min: Math.min(...clean),
        max: Math.max(...clean),
    };
}

function fmt(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(2) : 'n/a';
}

function resolveExperimentDir(slug, value) {
    if (value.includes('/') || value.includes('\\')) return path.resolve(value);
    return path.join(ROOT, 'benchmarks', 'results', slug, 'blind-runs', value);
}

async function latestExperimentDir(slug) {
    const baseDir = path.join(ROOT, 'benchmarks', 'results', slug, 'blind-runs');
    const entries = (await fs.readdir(baseDir, { withFileTypes: true }))
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort();
    if (entries.length === 0) throw new Error(`No experiments found in ${baseDir}`);
    return path.join(baseDir, entries[entries.length - 1]);
}

async function readJsonIfExists(filePath) {
    try {
        return JSON.parse(await fs.readFile(filePath, 'utf-8'));
    } catch (_) {
        return {};
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    });
}
