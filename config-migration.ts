import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

interface JsonConfigTarget {
    kind: 'json';
    label: string;
    filePath: string;
}

interface TextConfigTarget {
    kind: 'text';
    label: string;
    filePath: string;
}

type ConfigTarget = JsonConfigTarget | TextConfigTarget;

interface McpServerConfig {
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    [key: string]: unknown;
}

interface JsonMcpConfig {
    mcpServers?: Record<string, McpServerConfig>;
    [key: string]: unknown;
}

interface JsonInspection {
    target: JsonConfigTarget;
    exists: boolean;
    parseError?: string;
    bridgeServers: string[];
    officialFigmaServers: string[];
}

interface TextInspection {
    target: TextConfigTarget;
    exists: boolean;
    mentionsFigmaMcp: boolean;
    mentionsBridge: boolean;
}

export async function runConfigDoctor(argv: string[] = process.argv.slice(3)): Promise<void> {
    const projectRoot = resolveProjectRootArg(argv);
    const inspections = await inspectAllConfigs(projectRoot);

    console.log('Figma Bridge MCP config doctor\n');
    console.log(`Project root for generated bridge config: ${projectRoot}\n`);

    for (const inspection of inspections.json) {
        printJsonInspection(inspection);
    }
    for (const inspection of inspections.text) {
        printTextInspection(inspection);
    }

    const hasOfficial = inspections.json.some(item => item.officialFigmaServers.length > 0)
        || inspections.text.some(item => item.mentionsFigmaMcp);
    if (hasOfficial) {
        console.log('\nRecommendation: run `figma-bridge migrate-config --yes` to remove competing Figma MCP JSON entries and add this bridge as the single Figma MCP server.');
        console.log('Codex TOML configs are reported by doctor, but not rewritten automatically. Use `codex mcp remove <name>` for any reported official Figma MCP entries.');
    } else {
        console.log('\nNo competing official Figma MCP JSON entries were found in known config locations.');
    }
}

export async function runConfigMigration(argv: string[] = process.argv.slice(3)): Promise<void> {
    const write = argv.includes('--yes') || argv.includes('-y');
    const projectRoot = resolveProjectRootArg(argv);
    const inspections = await inspectAllConfigs(projectRoot);
    const bridgeConfig = buildBridgeServerConfig(projectRoot);
    let changedCount = 0;

    console.log(write ? 'Migrating MCP configs...\n' : 'Dry run only. Re-run with `--yes` to write changes.\n');

    for (const inspection of inspections.json) {
        if (!inspection.exists || inspection.parseError) {
            printJsonInspection(inspection);
            continue;
        }

        const raw = await fs.readFile(inspection.target.filePath, 'utf-8');
        const config = JSON.parse(raw) as JsonMcpConfig;
        const servers = config.mcpServers ?? {};
        const nextServers: Record<string, McpServerConfig> = {};
        const removed: string[] = [];

        for (const [name, server] of Object.entries(servers)) {
            if (isOfficialFigmaServer(name, server)) {
                removed.push(name);
                continue;
            }
            nextServers[name] = server;
        }

        const existingBridgeName = Object.entries(nextServers)
            .find(([name, server]) => isBridgeServer(name, server))?.[0];
        const bridgeName = existingBridgeName ?? 'figma-cost-optimizer-bridge';
        nextServers[bridgeName] = mergeBridgeConfig(nextServers[bridgeName], bridgeConfig);
        config.mcpServers = nextServers;

        if (removed.length === 0 && !existingBridgeName) {
            console.log(`- ${inspection.target.label}: no competing Figma MCP entry; no change`);
            continue;
        }

        if (removed.length === 0 && existingBridgeName) {
            console.log(`- ${inspection.target.label}: bridge entry already present (${inspection.target.filePath})`);
            continue;
        }

        console.log(`- ${inspection.target.label}: ${removed.length ? `remove ${removed.join(', ')}; ` : ''}ensure ${bridgeName}`);
        if (write) {
            await writeJsonWithBackup(inspection.target.filePath, config);
        }
        changedCount++;
    }

    for (const inspection of inspections.text) {
        if (inspection.mentionsFigmaMcp) {
            printTextInspection(inspection);
            console.log('  Manual step: remove the official Figma MCP server from this config with the client CLI, then add figma-cost-optimizer-bridge.');
        }
    }

    if (!write) {
        console.log('\nNo files were changed.');
    } else {
        console.log(`\nMigration complete. Updated ${changedCount} JSON config file(s).`);
    }
}

export function knownConfigTargets(cwd: string = process.cwd(), home: string = os.homedir(), platform: NodeJS.Platform = process.platform): ConfigTarget[] {
    const targets: ConfigTarget[] = [];
    if (platform === 'darwin') {
        targets.push({
            kind: 'json',
            label: 'Claude Desktop',
            filePath: path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
        });
    } else if (platform === 'win32') {
        targets.push({
            kind: 'json',
            label: 'Claude Desktop',
            filePath: path.join(process.env.APPDATA ?? path.join(home, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json'),
        });
    } else {
        targets.push({
            kind: 'json',
            label: 'Claude Desktop',
            filePath: path.join(home, '.config', 'Claude', 'claude_desktop_config.json'),
        });
    }

    targets.push(
        { kind: 'json', label: 'Cursor global', filePath: path.join(home, '.cursor', 'mcp.json') },
        { kind: 'json', label: 'Cursor workspace', filePath: path.join(cwd, '.cursor', 'mcp.json') },
        { kind: 'json', label: 'Workspace MCP', filePath: path.join(cwd, '.mcp.json') },
        { kind: 'text', label: 'Codex CLI', filePath: path.join(home, '.codex', 'config.toml') },
    );
    return targets;
}

export function isOfficialFigmaServer(name: string, server: McpServerConfig = {}): boolean {
    if (isBridgeServer(name, server)) return false;
    const haystack = [name, server.command, ...(server.args ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    return (
        /\bfigma-mcp\b/.test(haystack)
        || haystack.includes('figma-developer-mcp')
        || haystack.includes('@figma/')
        || haystack.includes('mcp-server-figma')
        || (name.toLowerCase().includes('figma') && !haystack.includes('decrease-token-figma'))
    );
}

export function isBridgeServer(name: string, server: McpServerConfig = {}): boolean {
    const haystack = [name, server.command, ...(server.args ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    return haystack.includes('figma-cost-optimizer-bridge')
        || haystack.includes('decrease-token-figma')
        || haystack.includes('figma-bridge');
}

function resolveProjectRootArg(argv: string[]): string {
    const index = argv.findIndex(arg => arg === '--project-root');
    const value = index >= 0 ? argv[index + 1] : undefined;
    return path.resolve(value || process.env.FIGMA_BRIDGE_ROOT || process.cwd());
}

async function inspectAllConfigs(projectRoot: string): Promise<{ json: JsonInspection[]; text: TextInspection[] }> {
    const targets = knownConfigTargets(projectRoot);
    const json: JsonInspection[] = [];
    const text: TextInspection[] = [];

    for (const target of targets) {
        if (target.kind === 'json') json.push(await inspectJsonConfig(target));
        else text.push(await inspectTextConfig(target));
    }

    return { json, text };
}

async function inspectJsonConfig(target: JsonConfigTarget): Promise<JsonInspection> {
    const base = { target, exists: false, bridgeServers: [], officialFigmaServers: [] };
    try {
        const raw = await fs.readFile(target.filePath, 'utf-8');
        const config = JSON.parse(raw) as JsonMcpConfig;
        const servers = config.mcpServers ?? {};
        return {
            ...base,
            exists: true,
            bridgeServers: Object.entries(servers).filter(([name, server]) => isBridgeServer(name, server)).map(([name]) => name),
            officialFigmaServers: Object.entries(servers).filter(([name, server]) => isOfficialFigmaServer(name, server)).map(([name]) => name),
        };
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return base;
        return { ...base, exists: true, parseError: (error as Error).message };
    }
}

async function inspectTextConfig(target: TextConfigTarget): Promise<TextInspection> {
    try {
        const raw = await fs.readFile(target.filePath, 'utf-8');
        const lower = raw.toLowerCase();
        return {
            target,
            exists: true,
            mentionsFigmaMcp: lower.includes('figma-mcp') || lower.includes('figma-developer-mcp') || lower.includes('@figma/'),
            mentionsBridge: lower.includes('figma-cost-optimizer-bridge') || lower.includes('decrease-token-figma'),
        };
    } catch {
        return { target, exists: false, mentionsFigmaMcp: false, mentionsBridge: false };
    }
}

function buildBridgeServerConfig(projectRoot: string): McpServerConfig {
    return {
        command: 'npx',
        args: ['-y', 'decrease-token-figma'],
        env: { FIGMA_BRIDGE_ROOT: projectRoot },
    };
}

function mergeBridgeConfig(existing: McpServerConfig | undefined, bridge: McpServerConfig): McpServerConfig {
    return {
        ...(existing ?? {}),
        command: bridge.command,
        args: bridge.args,
        env: {
            ...(existing?.env ?? {}),
            ...(bridge.env ?? {}),
        },
    };
}

async function writeJsonWithBackup(filePath: string, config: JsonMcpConfig): Promise<void> {
    const backupPath = `${filePath}.${new Date().toISOString().replace(/[:.]/g, '-')}.bak`;
    const raw = await fs.readFile(filePath, 'utf-8');
    await fs.writeFile(backupPath, raw, 'utf-8');
    await fs.writeFile(filePath, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');
    console.log(`  Backup: ${backupPath}`);
}

function printJsonInspection(inspection: JsonInspection): void {
    if (!inspection.exists) {
        console.log(`- ${inspection.target.label}: not found (${inspection.target.filePath})`);
        return;
    }
    if (inspection.parseError) {
        console.log(`- ${inspection.target.label}: cannot parse JSON (${inspection.target.filePath})`);
        console.log(`  ${inspection.parseError}`);
        return;
    }
    console.log(`- ${inspection.target.label}: ${inspection.target.filePath}`);
    console.log(`  Bridge servers: ${inspection.bridgeServers.length ? inspection.bridgeServers.join(', ') : 'none'}`);
    console.log(`  Competing Figma MCP servers: ${inspection.officialFigmaServers.length ? inspection.officialFigmaServers.join(', ') : 'none'}`);
}

function printTextInspection(inspection: TextInspection): void {
    if (!inspection.exists) {
        console.log(`- ${inspection.target.label}: not found (${inspection.target.filePath})`);
        return;
    }
    console.log(`- ${inspection.target.label}: ${inspection.target.filePath}`);
    console.log(`  Mentions bridge: ${inspection.mentionsBridge ? 'yes' : 'no'}`);
    console.log(`  Mentions competing Figma MCP: ${inspection.mentionsFigmaMcp ? 'yes' : 'no'}`);
}
