import * as fs from 'fs/promises';
import * as path from 'path';

export interface RegistryComponent {
    name: string;
    filePath: string;
    structureHash?: string;
    props: string[];
    source: 'bridge' | 'scan';
    lastSeen: string;
}

export interface ComponentRegistryData {
    components: RegistryComponent[];
}

export class ComponentRegistry {
    private registryPath: string;

    constructor(
        private projectRoot: string,
        private cacheDir: string,
        private componentExtensions: string[] = ['.tsx'],
    ) {
        this.registryPath = path.join(cacheDir, 'registry.json');
    }

    async read(): Promise<ComponentRegistryData> {
        try {
            const raw = await fs.readFile(this.registryPath, 'utf-8');
            const parsed = JSON.parse(raw) as ComponentRegistryData;
            if (!Array.isArray(parsed.components)) return { components: [] };
            return parsed;
        } catch {
            return { components: [] };
        }
    }

    async write(data: ComponentRegistryData): Promise<void> {
        await fs.mkdir(this.cacheDir, { recursive: true });
        await fs.writeFile(this.registryPath, JSON.stringify(data, null, 2), 'utf-8');
    }

    async pruneMissing(): Promise<ComponentRegistryData> {
        const data = await this.read();
        const kept: RegistryComponent[] = [];

        for (const component of data.components) {
            if (!component.filePath) {
                kept.push(component);
                continue;
            }

            const absolutePath = path.isAbsolute(component.filePath)
                ? component.filePath
                : path.join(this.projectRoot, component.filePath);
            try {
                await fs.access(absolutePath);
                kept.push(component);
            } catch {
                if (component.source === 'bridge') kept.push(component);
            }
        }

        const pruned = { components: kept };
        if (kept.length !== data.components.length) await this.write(pruned);
        return pruned;
    }

    async upsert(component: Omit<RegistryComponent, 'lastSeen'> & { lastSeen?: string }): Promise<void> {
        const data = await this.read();
        const now = component.lastSeen ?? new Date().toISOString();
        // 구조 해시가 있으면 해시로만 매칭한다 — 추출 이름이 RepeatedDiv처럼 제네릭해서
        // 이름 매칭을 허용하면 다른 화면의 다른 구조가 서로의 항목을 덮어쓴다
        const index = data.components.findIndex(existing =>
            component.structureHash
                ? existing.structureHash === component.structureHash
                : existing.name.toLowerCase() === component.name.toLowerCase()
        );

        const next: RegistryComponent = { ...component, lastSeen: now };
        if (index >= 0) {
            data.components[index] = { ...data.components[index], ...next };
        } else {
            data.components.push(next);
        }

        await this.write(data);
    }

    findByHash(data: ComponentRegistryData, hash: string): RegistryComponent | undefined {
        return data.components.find(component => component.structureHash === hash);
    }

    findByName(data: ComponentRegistryData, name: string): RegistryComponent | undefined {
        const normalized = normalizeName(name);
        return data.components.find(component => normalizeName(component.name) === normalized);
    }

    async syncFromSourceComponents(): Promise<ComponentRegistryData> {
        const componentsDir = path.join(this.projectRoot, 'src', 'components');
        const files = await fs.readdir(componentsDir).catch(() => []);
        const componentFiles = files.filter(file =>
            this.componentExtensions.some(extension => file.endsWith(extension))
        );
        const data = await this.read();
        const now = new Date().toISOString();

        for (const file of componentFiles) {
            const absolute = path.join(componentsDir, file);
            const source = await fs.readFile(absolute, 'utf-8').catch(() => '');
            const relative = path.relative(this.projectRoot, absolute);
            const discovered = discoverComponents(source, file);

            for (const item of discovered) {
                const index = data.components.findIndex(component =>
                    component.source === 'scan' && component.filePath === relative && component.name === item.name
                );
                const next: RegistryComponent = {
                    name: item.name,
                    filePath: relative,
                    props: item.props,
                    source: 'scan',
                    lastSeen: now,
                };

                if (index >= 0) data.components[index] = { ...data.components[index], ...next };
                else data.components.push(next);
            }
        }

        await this.write(data);
        return data;
    }
}

function normalizeName(name: string): string {
    return name.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
}

function discoverComponents(source: string, file: string): Array<{ name: string; props: string[] }> {
    const results: Array<{ name: string; props: string[] }> = [];
    const seen = new Set<string>();
    const extension = path.extname(file);
    const baseName = file.slice(0, -extension.length);

    if (extension === '.vue') {
        return [{ name: baseName, props: extractVueProps(source) }];
    }

    if (extension === '.svelte') {
        return [{ name: baseName, props: extractSvelteProps(source) }];
    }

    if (extension === '.html') {
        return [{ name: baseName, props: [] }];
    }

    const patterns = [
        /export\s+function\s+([A-Z][A-Za-z0-9_]*)\s*\(([^)]*)\)/g,
        /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*[:=]/g,
    ];

    for (const pattern of patterns) {
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(source)) !== null) {
            const name = match[1];
            if (seen.has(name)) continue;
            seen.add(name);
            results.push({ name, props: extractProps(source, name, match[2]) });
        }
    }

    if (results.length === 0 && source.includes(`export default ${baseName}`)) {
        results.push({ name: baseName, props: extractProps(source, baseName) });
    }

    return results;
}

function extractVueProps(source: string): string[] {
    const props = new Set<string>();

    const genericDefineProps = source.match(/defineProps\s*<\s*\{([\s\S]*?)\}\s*>\s*\(/m);
    if (genericDefineProps) {
        collectObjectShapeProps(genericDefineProps[1], props);
    }

    const arrayDefineProps = source.match(/defineProps\s*\(\s*\[([\s\S]*?)\]\s*\)/m);
    if (arrayDefineProps) {
        for (const match of arrayDefineProps[1].matchAll(/['"]([A-Za-z_][A-Za-z0-9_]*)['"]/g)) {
            props.add(match[1]);
        }
    }

    const objectDefineProps = source.match(/defineProps\s*\(\s*\{([\s\S]*?)\}\s*\)/m);
    if (objectDefineProps) {
        for (const match of objectDefineProps[1].matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*:/g)) {
            props.add(match[1]);
        }
    }

    const optionsProps = source.match(/props\s*:\s*(?:\[([\s\S]*?)\]|\{([\s\S]*?)\})/m);
    if (optionsProps?.[1]) {
        for (const match of optionsProps[1].matchAll(/['"]([A-Za-z_][A-Za-z0-9_]*)['"]/g)) {
            props.add(match[1]);
        }
    } else if (optionsProps?.[2]) {
        for (const match of optionsProps[2].matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*:/g)) {
            props.add(match[1]);
        }
    }

    return [...props];
}

function extractSvelteProps(source: string): string[] {
    const props = new Set<string>();
    for (const match of source.matchAll(/export\s+let\s+([A-Za-z_][A-Za-z0-9_]*)/g)) {
        props.add(match[1]);
    }
    return [...props];
}

function extractProps(source: string, componentName: string, signature = ''): string[] {
    const props = new Set<string>();
    const destructured = signature.match(/\{\s*([^}:]+(?:\s*,\s*[^}:]+)*)\s*\}/);
    if (destructured) {
        destructured[1].split(',').map(part => part.trim()).filter(Boolean).forEach(prop => props.add(prop));
    }

    const typePatterns = [
        new RegExp(`(?:interface|type)\\s+${componentName}Props\\s*(?:=)?\\s*\\{([\\s\\S]*?)\\}`, 'm'),
        /type\s+Props\s*=\s*\{([\s\S]*?)\}/m,
        /interface\s+Props\s*\{([\s\S]*?)\}/m,
    ];

    for (const pattern of typePatterns) {
        const match = source.match(pattern);
        if (!match) continue;
        const body = match[1];
        for (const prop of body.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\??\s*:/g)) {
            props.add(prop[1]);
        }
    }

    return [...props];
}

function collectObjectShapeProps(body: string, props: Set<string>): void {
    for (const prop of body.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\??\s*:/g)) {
        props.add(prop[1]);
    }
}
