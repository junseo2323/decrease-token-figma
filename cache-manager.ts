import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface NodeCacheMeta {
    componentName: string;
    hash: string;
    nodeIds: string[];
    createdAt: string;
    figmaName?: string;
    target?: string;
    styling?: string;
}

export interface NodeCacheEntry {
    dir: string;
    meta: NodeCacheMeta;
}

export function hashRawText(rawText: string): string {
    return crypto.createHash('sha256').update(rawText).digest('hex').slice(0, 8);
}

function safeName(name: string): string {
    return name.replace(/[^A-Za-z0-9_-]/g, '_') || 'UnknownComponent';
}

export class NodeCacheManager {
    public readonly nodesDir: string;

    constructor(private cacheDir: string) {
        this.nodesDir = path.join(cacheDir, 'nodes');
    }

    async ensure(): Promise<void> {
        await fs.mkdir(this.nodesDir, { recursive: true });
    }

    getNodeDir(componentName: string, hash: string): string {
        return path.join(this.nodesDir, `${safeName(componentName)}_${hash}`);
    }

    async exists(componentName: string, hash: string): Promise<boolean> {
        try {
            await fs.access(path.join(this.getNodeDir(componentName, hash), 'handoff.md'));
            return true;
        } catch {
            return false;
        }
    }

    async readEntry(dir: string): Promise<NodeCacheEntry | null> {
        try {
            const raw = await fs.readFile(path.join(dir, 'meta.json'), 'utf-8');
            return { dir, meta: JSON.parse(raw) as NodeCacheMeta };
        } catch {
            return null;
        }
    }

    async listEntries(componentName?: string): Promise<NodeCacheEntry[]> {
        await this.ensure();
        const names = await fs.readdir(this.nodesDir).catch(() => []);
        const entries: NodeCacheEntry[] = [];
        const prefix = componentName ? `${safeName(componentName)}_` : '';

        for (const name of names) {
            if (prefix && !name.startsWith(prefix)) continue;
            const dir = path.join(this.nodesDir, name);
            const stat = await fs.stat(dir).catch(() => null);
            if (!stat?.isDirectory()) continue;

            const entry = await this.readEntry(dir);
            if (entry) entries.push(entry);
        }

        return entries.sort((a, b) => b.meta.createdAt.localeCompare(a.meta.createdAt));
    }

    async findPrevious(componentName: string, currentHash: string): Promise<NodeCacheEntry | null> {
        const entries = await this.listEntries(componentName);
        return entries.find(entry => entry.meta.hash !== currentHash) ?? null;
    }

    async writeMeta(dir: string, meta: NodeCacheMeta): Promise<void> {
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf-8');
    }

    async prune(componentName: string, keep = 2): Promise<void> {
        const entries = await this.listEntries(componentName);
        for (const entry of entries.slice(keep)) {
            await fs.rm(entry.dir, { recursive: true, force: true });
        }
    }
}
