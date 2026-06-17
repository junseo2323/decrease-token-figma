import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

export interface OllamaReadyOptions {
    modelName?: string;
    autoInstall?: boolean;
    autoPullModel?: boolean;
    startupTimeoutMs?: number;
}

export interface OllamaReadyResult {
    binaryPath: string;
    modelName: string;
}

export class OllamaSetupError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OllamaSetupError';
    }
}

const OLLAMA_HOST = 'http://localhost:11434';

export function getOllamaCandidatePaths(env: NodeJS.ProcessEnv = process.env): string[] {
    const binaryName = os.platform() === 'win32' ? 'ollama.exe' : 'ollama';
    const candidates = [
        env.OLLAMA_BIN,
        ...pathCandidatesFromPath(env.PATH).map(dir => path.join(dir, binaryName)),
        '/opt/homebrew/bin/ollama',
        '/usr/local/bin/ollama',
        '/usr/bin/ollama',
        '/Applications/Ollama.app/Contents/Resources/ollama',
        'C:\\Program Files\\Ollama\\ollama.exe',
        'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Ollama\\ollama.exe',
    ].filter(Boolean) as string[];

    return [...new Set(candidates.map(expandWindowsUsername))];
}

export async function resolveOllamaBinary(env: NodeJS.ProcessEnv = process.env): Promise<string | null> {
    for (const candidate of getOllamaCandidatePaths(env)) {
        if (await isExecutable(candidate)) return candidate;
    }
    return null;
}

/**
 * Check whether the Ollama server is running.
 */
export async function isOllamaRunning(): Promise<boolean> {
    try {
        const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
            signal: AbortSignal.timeout(2000),
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Ensure Ollama is installed, running, and has the required model before MCP startup.
 */
export async function ensureOllamaReady(options: OllamaReadyOptions = {}): Promise<OllamaReadyResult> {
    const modelName = options.modelName ?? process.env.FIGMA_BRIDGE_OLLAMA_MODEL ?? 'llama3.2';
    const autoInstall = options.autoInstall ?? process.env.FIGMA_BRIDGE_OLLAMA_AUTO_INSTALL !== '0';
    const autoPullModel = options.autoPullModel ?? process.env.FIGMA_BRIDGE_OLLAMA_AUTO_PULL !== '0';
    const startupTimeoutMs = options.startupTimeoutMs ?? 30000;

    let binaryPath = await resolveOllamaBinary();
    if (!binaryPath) {
        if (!autoInstall) {
            throw new OllamaSetupError(
                'Ollama is not installed. Automatic installation is disabled because FIGMA_BRIDGE_OLLAMA_AUTO_INSTALL=0.'
            );
        }

        console.error('⏳ Ollama is not installed. Starting automatic installation...');
        await installOllama();
        binaryPath = await resolveOllamaBinary();
    }

    if (!binaryPath) {
        throw new OllamaSetupError('Could not find the Ollama executable after installation. Set OLLAMA_BIN=/absolute/path/to/ollama.');
    }

    await ensureOllamaRunning(binaryPath, startupTimeoutMs);
    await ensureOllamaModel(modelName, binaryPath, autoPullModel);

    return { binaryPath, modelName };
}

/**
 * Start the Ollama server when it is not already running.
 */
export async function ensureOllamaRunning(binaryPath?: string, startupTimeoutMs: number = 30000): Promise<void> {
    const isRunning = await isOllamaRunning();

    if (isRunning) {
        console.error('✅ Ollama server is already running.');
        return;
    }

    const resolvedBinary = binaryPath ?? await resolveOllamaBinary();
    if (!resolvedBinary) {
        throw new OllamaSetupError('Could not find the Ollama executable, so the server cannot be started.');
    }

    console.error('⏳ Starting Ollama server...');

    const child = spawn(resolvedBinary, ['serve'], {
        detached: true,
        stdio: 'ignore',
        env: withBinaryDirInPath(resolvedBinary),
    });

    child.unref();

    const attempts = Math.max(1, Math.ceil(startupTimeoutMs / 500));
    for (let i = 0; i < attempts; i++) {
        await sleep(500);
        const running = await isOllamaRunning();
        if (running) {
            console.error('✅ Ollama server started.');
            return;
        }
    }

    throw new OllamaSetupError('Failed to start the Ollama server. Check `ollama serve` permissions and whether port 11434 is available.');
}

/**
 * Ensure the required Ollama model exists. Pull it automatically when needed.
 */
export async function ensureOllamaModel(
    modelName: string = 'llama3.2',
    binaryPath?: string,
    autoPullModel: boolean = true
): Promise<boolean> {
    const resolvedBinary = binaryPath ?? await resolveOllamaBinary();
    if (!resolvedBinary) {
        throw new OllamaSetupError('Could not find the Ollama executable, so the model cannot be prepared.');
    }

    try {
        const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
            signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json() as { models: Array<{ name: string }> };
        const hasModel = data.models.some(m => m.name === modelName || m.name.startsWith(`${modelName}:`));

        if (hasModel) {
            console.error(`✅ ${modelName} model is ready.`);
            return true;
        }

        if (!autoPullModel) {
            throw new OllamaSetupError(`${modelName} model is missing. Automatic model download is disabled because FIGMA_BRIDGE_OLLAMA_AUTO_PULL=0.`);
        }

        console.error(`⏳ Downloading ${modelName} model... (this can take a while the first time)`);
        await runCommand(resolvedBinary, ['pull', modelName]);
        console.error(`✅ ${modelName} model downloaded.`);
        return true;
    } catch (error) {
        if (error instanceof OllamaSetupError) throw error;
        throw new OllamaSetupError(`Failed to prepare Ollama model: ${(error as Error).message}`);
    }
}

async function installOllama(): Promise<void> {
    const platform = os.platform();

    if (platform === 'darwin') {
        const brew = await resolveExecutable('brew');
        if (!brew) {
            throw new OllamaSetupError('Automatic installation on macOS requires Homebrew. Install Homebrew and retry, or install Ollama manually.');
        }

        try {
            await runCommand(brew, ['install', 'ollama']);
        } catch {
            await runCommand(brew, ['install', '--cask', 'ollama']);
        }
        return;
    }

    if (platform === 'linux') {
        await runShellCommand('curl -fsSL https://ollama.com/install.sh | sh');
        return;
    }

    if (platform === 'win32') {
        const winget = await resolveExecutable('winget');
        if (!winget) {
            throw new OllamaSetupError('Automatic installation on Windows requires winget. Install winget and retry, or install Ollama manually.');
        }
        await runCommand(winget, ['install', '--id', 'Ollama.Ollama', '-e', '--accept-source-agreements', '--accept-package-agreements']);
        return;
    }

    throw new OllamaSetupError(`Automatic Ollama installation is not supported on ${platform}. Install Ollama manually and set OLLAMA_BIN.`);
}

async function resolveExecutable(name: string): Promise<string | null> {
    const explicit = await resolveFromPath(name);
    if (explicit) return explicit;

    const extras = os.platform() === 'win32'
        ? [`C:\\Windows\\System32\\${name}.exe`]
        : [`/opt/homebrew/bin/${name}`, `/usr/local/bin/${name}`, `/usr/bin/${name}`];

    for (const candidate of extras) {
        if (await isExecutable(candidate)) return candidate;
    }
    return null;
}

async function resolveFromPath(name: string): Promise<string | null> {
    const candidates = pathCandidatesFromPath(process.env.PATH).map(candidate => {
        if (path.basename(candidate) === name || path.basename(candidate) === `${name}.exe`) return candidate;
        return path.join(candidate, os.platform() === 'win32' ? `${name}.exe` : name);
    });

    for (const candidate of candidates) {
        if (await isExecutable(candidate)) return candidate;
    }
    return null;
}

function pathCandidatesFromPath(pathValue?: string): string[] {
    if (!pathValue) return [];
    return pathValue.split(path.delimiter).filter(Boolean);
}

async function isExecutable(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

function runCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: ['ignore', 'pipe', 'pipe'],
            env: withBinaryDirInPath(command),
        });

        child.stdout?.on('data', chunk => process.stderr.write(chunk));
        child.stderr?.on('data', chunk => process.stderr.write(chunk));
        child.on('error', reject);
        child.on('close', code => {
            if (code === 0) resolve();
            else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
        });
    });
}

function runShellCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, {
            shell: true,
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        child.stdout?.on('data', chunk => process.stderr.write(chunk));
        child.stderr?.on('data', chunk => process.stderr.write(chunk));
        child.on('error', reject);
        child.on('close', code => {
            if (code === 0) resolve();
            else reject(new Error(`${command} exited with code ${code}`));
        });
    });
}

function withBinaryDirInPath(binaryPath: string): NodeJS.ProcessEnv {
    const binaryDir = path.dirname(binaryPath);
    const existingPath = process.env.PATH ?? '';
    return {
        ...process.env,
        PATH: existingPath.includes(binaryDir)
            ? existingPath
            : `${binaryDir}${path.delimiter}${existingPath}`,
    };
}

function expandWindowsUsername(value: string): string {
    if (!value.includes('%USERNAME%')) return value;
    return value.replace('%USERNAME%', process.env.USERNAME ?? '');
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
