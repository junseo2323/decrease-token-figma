#!/usr/bin/env node
import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TEST_DIR = path.join(ROOT, 'test');
const SUBJECT_PATH = path.join(TEST_DIR, 'src', 'components', 'BenchmarkSubject.tsx');
const VARIANTS = ['vanilla', 'bridge'];

async function main() {
    const options = parseArgs(process.argv.slice(2));
    if (!options.slug) {
        console.error('Usage: node benchmarks/generate-with-llm.mjs <slug> --provider anthropic|openai --model <model> [--runs 5] [--temperature 0] [--max-repairs 1] [--experiment-id <id>]');
        process.exit(1);
    }

    const provider = options.provider || process.env.LLM_PROVIDER || inferProvider();
    const model = options.model || process.env.LLM_MODEL;
    if (!provider) throw new Error('Missing provider. Pass --provider anthropic|openai or set LLM_PROVIDER.');
    if (!model) throw new Error('Missing model. Pass --model or set LLM_MODEL.');
    assertProviderAuth(provider);

    const fixtureDir = path.join(ROOT, 'benchmarks', 'fixtures', options.slug);
    const rawPath = path.join(fixtureDir, 'raw.figma.txt');
    const handoffPath = path.join(fixtureDir, 'handoff.md');
    const referencePath = path.join(fixtureDir, 'reference.png');
    await Promise.all([
        assertFile(rawPath),
        assertFile(handoffPath),
        assertFile(referencePath),
    ]);

    const experimentId = options.experimentId || `${provider}-${sanitize(model)}-${timestamp()}`;
    const experimentDir = path.join(ROOT, 'benchmarks', 'results', options.slug, 'blind-runs', experimentId);
    await fs.mkdir(experimentDir, { recursive: true });

    const fixture = {
        raw: await fs.readFile(rawPath, 'utf-8'),
        handoff: await fs.readFile(handoffPath, 'utf-8'),
        referenceBase64: (await fs.readFile(referencePath)).toString('base64'),
        referencePath,
    };
    const meta = await readJsonIfExists(path.join(fixtureDir, 'meta.json'));
    const startedAt = new Date().toISOString();

    for (let runIndex = 1; runIndex <= options.runs; runIndex++) {
        const runId = `run-${String(runIndex).padStart(3, '0')}`;
        const runDir = path.join(experimentDir, runId);
        await fs.mkdir(runDir, { recursive: true });
        console.error(`\n=== ${options.slug} ${experimentId} ${runId} ===`);

        const generation = {
            slug: options.slug,
            runId,
            provider,
            model,
            temperature: options.temperature,
            maxRepairs: options.maxRepairs,
            startedAt: new Date().toISOString(),
            fixtureMeta: meta,
            variants: {},
        };

        for (const variant of VARIANTS) {
            const prompt = buildPrompt({
                slug: options.slug,
                variant,
                inputText: variant === 'vanilla' ? fixture.raw : fixture.handoff,
                referencePath,
            });
            const promptHash = sha256(prompt);
            await fs.writeFile(path.join(runDir, `${variant}.prompt.md`), prompt, 'utf-8');

            console.error(`Generating ${variant} (${provider}/${model}, prompt ${promptHash.slice(0, 12)})`);
            const result = await generateAndRepair({
                provider,
                model,
                temperature: options.temperature,
                maxRepairs: options.maxRepairs,
                prompt,
                promptHash,
                referenceBase64: fixture.referenceBase64,
                variant,
                runDir,
            });
            generation.variants[variant] = result.metadata;
        }

        await measureTokens(options.slug, runDir);
        await renderAndDiff(options.slug, runDir);
        generation.finishedAt = new Date().toISOString();
        await fs.writeFile(path.join(runDir, 'generation.json'), JSON.stringify(generation, null, 2) + '\n', 'utf-8');
    }

    const summaryPath = await summarize(options.slug, experimentDir, {
        provider,
        model,
        temperature: options.temperature,
        runs: options.runs,
        maxRepairs: options.maxRepairs,
        startedAt,
    });
    console.error(`\nSummary: ${summaryPath}`);
}

async function generateAndRepair({ provider, model, temperature, maxRepairs, prompt, promptHash, referenceBase64, variant, runDir }) {
    let currentPrompt = prompt;
    let code = '';
    const attempts = [];

    for (let attempt = 0; attempt <= maxRepairs; attempt++) {
        const response = await callModel({
            provider,
            model,
            temperature,
            prompt: currentPrompt,
            referenceBase64,
        });
        await fs.writeFile(path.join(runDir, `${variant}.attempt-${attempt + 1}.response.txt`), response.text, 'utf-8');
        code = extractCode(response.text);
        await fs.writeFile(path.join(runDir, `${variant}.tsx`), code, 'utf-8');

        const compile = await compileSubject(code);
        attempts.push({
            attempt: attempt + 1,
            responseChars: response.text.length,
            outputChars: code.length,
            usage: response.usage,
            compileOk: compile.ok,
            compileOutput: trimForJson(compile.output),
        });
        if (compile.ok) {
            return {
                metadata: {
                    promptHash,
                    outputHash: sha256(code),
                    outputChars: code.length,
                    repairCount: attempt,
                    attempts,
                },
            };
        }

        if (attempt === maxRepairs) break;
        currentPrompt = buildRepairPrompt(code, compile.output);
        console.error(`${variant} compile failed; requesting repair ${attempt + 1}/${maxRepairs}`);
    }

    return {
        metadata: {
            promptHash,
            outputHash: sha256(code),
            outputChars: code.length,
            repairCount: maxRepairs,
            compileFailed: true,
            attempts,
        },
    };
}

function buildPrompt({ slug, variant, inputText, referencePath }) {
    const label = variant === 'vanilla'
        ? 'Official Figma MCP get_design_context raw output'
        : 'Optimized bridge handoff markdown';
    return `You are participating in a blind Figma-to-React benchmark.

Goal:
Implement the attached reference screenshot as one React component.

Fairness rules:
- You only see this ${variant} input. Do not assume another benchmark arm exists.
- Preserve every visible text string exactly.
- Match the reference screenshot as closely as possible.
- Use the provided design text for structure, colors, typography, spacing, and assets.
- You may use inline styles, Tailwind classes available in the project, and lucide-react icons.
- Do not modify files outside the target TSX file.
- Output only a complete TSX file. No markdown fences, no explanations.

Output contract:
- Export one default React component.
- The file will be saved as benchmarks/results/${slug}/<run>/${variant}.tsx.
- The component will be mounted alone in a ${slug} benchmark viewport.
- It must compile in the existing Vite React app.

Reference screenshot path for audit:
${referencePath}

Input type:
${label}

Input:
${inputText}`;
}

function buildRepairPrompt(code, compileOutput) {
    return `The previous TSX did not compile. Fix compile/runtime syntax issues only.

Rules:
- Preserve the same visual implementation intent.
- Do not add explanations.
- Output only the complete corrected TSX file.

Compile output:
${compileOutput}

Previous TSX:
${code}`;
}

async function callModel({ provider, model, temperature, prompt, referenceBase64 }) {
    if (provider === 'anthropic') {
        return callAnthropic({ model, temperature, prompt, referenceBase64 });
    }
    if (provider === 'openai') {
        return callOpenAI({ model, temperature, prompt, referenceBase64 });
    }
    throw new Error(`Unsupported provider: ${provider}`);
}

async function callAnthropic({ model, temperature, prompt, referenceBase64 }) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model,
            max_tokens: Number(process.env.LLM_MAX_TOKENS ?? 12000),
            temperature,
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: 'image/png',
                            data: referenceBase64,
                        },
                    },
                    { type: 'text', text: prompt },
                ],
            }],
        }),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(`Anthropic API ${response.status}: ${JSON.stringify(json)}`);
    return {
        text: json.content?.filter(part => part.type === 'text').map(part => part.text).join('\n') ?? '',
        usage: json.usage,
    };
}

async function callOpenAI({ model, temperature, prompt, referenceBase64 }) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model,
            temperature,
            max_tokens: Number(process.env.LLM_MAX_TOKENS ?? 12000),
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/png;base64,${referenceBase64}` },
                    },
                ],
            }],
        }),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(`OpenAI API ${response.status}: ${JSON.stringify(json)}`);
    return {
        text: json.choices?.[0]?.message?.content ?? '',
        usage: json.usage,
    };
}

async function compileSubject(code) {
    const original = await fs.readFile(SUBJECT_PATH, 'utf-8');
    try {
        await fs.writeFile(SUBJECT_PATH, code, 'utf-8');
        const result = await run('npm', ['run', 'build'], { cwd: TEST_DIR });
        return { ok: result.code === 0, output: result.output };
    } finally {
        await fs.writeFile(SUBJECT_PATH, original, 'utf-8');
    }
}

async function measureTokens(slug, runDir) {
    const result = await run('node', ['benchmarks/measure-tokens.mjs', slug, '--result-dir', runDir], { cwd: ROOT });
    if (result.code !== 0) throw new Error(result.output);
}

async function renderAndDiff(slug, runDir) {
    const result = await run('node', ['benchmarks/render-and-diff.mjs', slug, '--result-dir', runDir], { cwd: ROOT });
    if (result.code !== 0) throw new Error(result.output);
}

async function summarize(slug, experimentDir, metadata) {
    const { summarizeExperiment } = await import('./summarize-blind-runs.mjs');
    return summarizeExperiment({ slug, experimentDir, metadata });
}

function extractCode(text) {
    const fence = text.match(/```(?:tsx|typescript|jsx|javascript)?\s*([\s\S]*?)```/);
    return (fence ? fence[1] : text).trim() + '\n';
}

function inferProvider() {
    if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
    if (process.env.OPENAI_API_KEY) return 'openai';
    return '';
}

function assertProviderAuth(provider) {
    if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
        throw new Error('Missing ANTHROPIC_API_KEY.');
    }
    if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
        throw new Error('Missing OPENAI_API_KEY.');
    }
}

async function assertFile(filePath) {
    try {
        await fs.access(filePath);
    } catch (_) {
        throw new Error(`Missing file: ${filePath}`);
    }
}

function parseArgs(args) {
    const options = {
        slug: '',
        provider: '',
        model: '',
        runs: Number(process.env.BLIND_RUNS ?? 5),
        temperature: Number(process.env.LLM_TEMPERATURE ?? 0),
        maxRepairs: Number(process.env.MAX_REPAIRS ?? 1),
        experimentId: '',
    };
    for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        if (arg === '--provider') options.provider = args[++index] ?? '';
        else if (arg === '--model') options.model = args[++index] ?? '';
        else if (arg === '--runs') options.runs = Number(args[++index] ?? options.runs);
        else if (arg === '--temperature') options.temperature = Number(args[++index] ?? options.temperature);
        else if (arg === '--max-repairs') options.maxRepairs = Number(args[++index] ?? options.maxRepairs);
        else if (arg === '--experiment-id') options.experimentId = args[++index] ?? '';
        else if (!options.slug) options.slug = arg;
    }
    return options;
}

function run(command, args, options = {}) {
    return new Promise(resolve => {
        const child = spawn(command, args, {
            cwd: options.cwd,
            shell: false,
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        let output = '';
        child.stdout.on('data', chunk => {
            output += chunk;
            if (!options.quiet) process.stderr.write(chunk);
        });
        child.stderr.on('data', chunk => {
            output += chunk;
            if (!options.quiet) process.stderr.write(chunk);
        });
        child.on('error', error => resolve({ code: 1, output: error.message }));
        child.on('close', code => resolve({ code, output }));
    });
}

async function readJsonIfExists(filePath) {
    try {
        return JSON.parse(await fs.readFile(filePath, 'utf-8'));
    } catch (_) {
        return {};
    }
}

function sha256(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function sanitize(value) {
    return value.replace(/[^A-Za-z0-9_.-]+/g, '-').replace(/^-|-$/g, '');
}

function timestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

function trimForJson(value) {
    const limit = 4000;
    return value.length > limit ? `${value.slice(0, limit)}\n...(truncated)` : value;
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
