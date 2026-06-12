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
 * Ollama 서버가 실행 중인지 확인
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
 * Ollama 설치, 서버 실행, 모델 준비까지 MCP 부팅 과정에서 필수로 보장한다.
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
                'Ollama가 설치되어 있지 않습니다. FIGMA_BRIDGE_OLLAMA_AUTO_INSTALL=0 상태에서는 자동 설치할 수 없습니다.'
            );
        }

        console.error('⏳ Ollama가 없어 자동 설치를 시작합니다...');
        await installOllama();
        binaryPath = await resolveOllamaBinary();
    }

    if (!binaryPath) {
        throw new OllamaSetupError('Ollama 설치 후에도 실행 파일을 찾지 못했습니다. OLLAMA_BIN=/absolute/path/to/ollama 를 설정하세요.');
    }

    await ensureOllamaRunning(binaryPath, startupTimeoutMs);
    await ensureOllamaModel(modelName, binaryPath, autoPullModel);

    return { binaryPath, modelName };
}

/**
 * Ollama 서버 자동 시작
 */
export async function ensureOllamaRunning(binaryPath?: string, startupTimeoutMs: number = 30000): Promise<void> {
    const isRunning = await isOllamaRunning();

    if (isRunning) {
        console.error('✅ Ollama 서버가 이미 실행 중입니다.');
        return;
    }

    const resolvedBinary = binaryPath ?? await resolveOllamaBinary();
    if (!resolvedBinary) {
        throw new OllamaSetupError('Ollama 실행 파일을 찾지 못해 서버를 시작할 수 없습니다.');
    }

    console.error('⏳ Ollama 서버를 시작합니다...');

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
            console.error('✅ Ollama 서버 시작 완료.');
            return;
        }
    }

    throw new OllamaSetupError('Ollama 서버 시작에 실패했습니다. `ollama serve` 실행 권한과 포트 11434 사용 여부를 확인하세요.');
}

/**
 * Ollama 모델 확인. 없으면 MCP가 직접 다운로드한다.
 */
export async function ensureOllamaModel(
    modelName: string = 'llama3.2',
    binaryPath?: string,
    autoPullModel: boolean = true
): Promise<boolean> {
    const resolvedBinary = binaryPath ?? await resolveOllamaBinary();
    if (!resolvedBinary) {
        throw new OllamaSetupError('Ollama 실행 파일을 찾지 못해 모델을 준비할 수 없습니다.');
    }

    try {
        const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
            signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json() as { models: Array<{ name: string }> };
        const hasModel = data.models.some(m => m.name === modelName || m.name.startsWith(`${modelName}:`));

        if (hasModel) {
            console.error(`✅ ${modelName} 모델이 준비되어 있습니다.`);
            return true;
        }

        if (!autoPullModel) {
            throw new OllamaSetupError(`${modelName} 모델이 없습니다. FIGMA_BRIDGE_OLLAMA_AUTO_PULL=0 상태에서는 자동 다운로드할 수 없습니다.`);
        }

        console.error(`⏳ ${modelName} 모델을 다운로드합니다... (처음엔 시간이 걸립니다)`);
        await runCommand(resolvedBinary, ['pull', modelName]);
        console.error(`✅ ${modelName} 모델 다운로드 완료.`);
        return true;
    } catch (error) {
        if (error instanceof OllamaSetupError) throw error;
        throw new OllamaSetupError(`Ollama 모델 준비 실패: ${(error as Error).message}`);
    }
}

async function installOllama(): Promise<void> {
    const platform = os.platform();

    if (platform === 'darwin') {
        const brew = await resolveExecutable('brew');
        if (!brew) {
            throw new OllamaSetupError('macOS 자동 설치에는 Homebrew가 필요합니다. Homebrew 설치 후 다시 실행하거나 Ollama를 수동 설치하세요.');
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
            throw new OllamaSetupError('Windows 자동 설치에는 winget이 필요합니다. winget 설치 후 다시 실행하거나 Ollama를 수동 설치하세요.');
        }
        await runCommand(winget, ['install', '--id', 'Ollama.Ollama', '-e', '--accept-source-agreements', '--accept-package-agreements']);
        return;
    }

    throw new OllamaSetupError(`${platform} 환경은 Ollama 자동 설치를 지원하지 않습니다. Ollama를 수동 설치한 뒤 OLLAMA_BIN을 설정하세요.`);
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
