import * as crypto from 'crypto';
import { ComponentRegistryData, RegistryComponent } from './component-registry.js';

interface JsxNode {
    tag: string;
    start: number;
    end: number;
    openStart: number;
    openEnd: number;
    closeStart: number;
    parent?: JsxNode;
    children: JsxNode[];
}

interface Candidate {
    node: JsxNode;
    source: string;
    signature: string;
    hash: string;
    elementCount: number;
}

export interface DedupedComponent {
    name: string;
    structureHash: string;
    props: string[];
    instanceCount: number;
    reusedFrom?: RegistryComponent;
}

export interface DeduplicationResult {
    code: string;
    components: DedupedComponent[];
    instanceDataMarkdown: string;
    hints: string[];
}

interface PropSlot {
    kind: 'text' | 'src' | 'className';
    name: string;
    firstValue: string;
    values: string[];
    /** className 슬롯: 모든 인스턴스에 공통인 클래스 토큰 (템플릿에 1회만 기록) */
    commonClasses?: string;
    /** 최빈값 — 컴포넌트 정의의 기본값으로 빠지고, 인스턴스는 다른 값일 때만 prop을 넘긴다 */
    defaultValue?: string;
}

export function deduplicateSubtrees(code: string, registry?: ComponentRegistryData): DeduplicationResult {
    const nodes = parseJsxNodes(code);
    const candidates = nodes
        .map(node => {
            const source = code.slice(node.start, node.end);
            const signature = buildSignature(node, code);
            return {
                node,
                source,
                signature,
                hash: hashSignature(signature),
                elementCount: countElements(node),
            };
        })
        .filter(candidate => candidate.elementCount >= 3);

    const groups = new Map<string, Candidate[]>();
    for (const candidate of candidates) {
        const list = groups.get(candidate.hash) ?? [];
        list.push(candidate);
        groups.set(candidate.hash, list);
    }

    const selected: Candidate[][] = [];
    const occupied: Array<[number, number]> = [];
    const sortedGroups = [...groups.values()]
        .filter(group => group.length >= 3)
        .sort((a, b) => averageSize(b) - averageSize(a));

    for (const group of sortedGroups) {
        const filtered = group.filter(candidate => !overlapsAny(candidate.node, occupied));
        if (filtered.length < 3) continue;
        selected.push(filtered);
        for (const candidate of filtered) occupied.push([candidate.node.start, candidate.node.end]);
    }

    if (selected.length === 0) {
        return { code, components: [], instanceDataMarkdown: '', hints: [] };
    }

    const replacements: Array<{ start: number; end: number; text: string }> = [];
    const definitions: string[] = [];
    const components: DedupedComponent[] = [];
    const dataSections: string[] = [];
    const hints: string[] = [];

    selected.forEach((group, groupIndex) => {
        const componentName = inferComponentName(group[0].node.tag, groupIndex);
        const slots = inferPropSlots(group);
        const props = slots.map(slot => slot.name);
        const reusedFrom = registry?.components.find(component => component.structureHash === group[0].hash);
        const nameHint = registry?.components.find(component => normalizeName(component.name) === normalizeName(componentName));

        if (nameHint && !reusedFrom) {
            hints.push(`유사 컴포넌트 존재: ${nameHint.filePath} - 먼저 Read 후 재사용 검토`);
        }

        if (!reusedFrom) {
            const template = buildTemplate(group[0].source, slots);
            definitions.push(buildComponentDefinition(componentName, slots, template));
        }

        const instanceLimit = group.length > 5 ? 3 : group.length;
        group.forEach((candidate, index) => {
            if (index >= instanceLimit) {
                replacements.push({ start: candidate.node.start, end: candidate.node.end, text: '' });
                return;
            }

            const instance = buildInstance(reusedFrom?.name ?? componentName, slots, index, reusedFrom);
            replacements.push({ start: candidate.node.start, end: candidate.node.end, text: instance });
        });

        if (group.length > 5) {
            const last = group[Math.min(instanceLimit, group.length) - 1].node;
            replacements.push({
                start: last.end,
                end: last.end,
                text: `\n{/* ... 총 ${group.length}개 - 전체 데이터: 아래 반복 인스턴스 데이터 참조 */}`,
            });
        }

        dataSections.push(buildInstanceDataSection(reusedFrom?.name ?? componentName, slots, group.length));
        components.push({
            name: reusedFrom?.name ?? componentName,
            structureHash: group[0].hash,
            props,
            instanceCount: group.length,
            reusedFrom,
        });
    });

    let rewritten = applyReplacements(code, replacements);
    if (definitions.length > 0) {
        rewritten = `// 반복 컴포넌트 정의\n${definitions.join('\n\n')}\n\n// 화면 구성\n${rewritten}`;
    }

    return {
        code: rewritten,
        components,
        instanceDataMarkdown: dataSections.filter(Boolean).join('\n\n'),
        hints,
    };
}

function parseJsxNodes(code: string): JsxNode[] {
    const nodes: JsxNode[] = [];
    const stack: JsxNode[] = [];
    const tagRegex = /<\/?([A-Za-z][A-Za-z0-9.]*)\b[^>]*>/g;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(code)) !== null) {
        const full = match[0];
        if (full.startsWith('<!--') || full.startsWith('<!')) continue;
        const tag = match[1];
        const isClosing = full.startsWith('</');
        const isSelfClosing = /\/>\s*$/.test(full);

        if (isClosing) {
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i].tag !== tag) continue;
                const node = stack.splice(i, 1)[0];
                node.closeStart = match.index;
                node.end = tagRegex.lastIndex;
                break;
            }
            continue;
        }

        const parent = stack[stack.length - 1];
        const node: JsxNode = {
            tag,
            start: match.index,
            end: isSelfClosing ? tagRegex.lastIndex : -1,
            openStart: match.index,
            openEnd: tagRegex.lastIndex,
            closeStart: isSelfClosing ? tagRegex.lastIndex : -1,
            parent,
            children: [],
        };
        if (parent) parent.children.push(node);
        nodes.push(node);
        if (!isSelfClosing) stack.push(node);
    }

    return nodes.filter(node => node.end > node.start);
}

function buildSignature(node: JsxNode, code: string): string {
    const openTag = code.slice(node.openStart, node.openEnd);
    const attrs = [...openTag.matchAll(/\s([A-Za-z_:][A-Za-z0-9_:.-]*)=(?:"[^"]*"|\{[^}]*\})/g)]
        .map(match => match[1])
        .filter(name => !name.startsWith('data-'))
        .sort()
        .join(',');
    const childSignatures = node.children.map(child => buildSignature(child, code)).join('');
    const hasText = getDirectTexts(node, code).length > 0 ? '#text' : '';
    return `<${node.tag} ${attrs}>${hasText}${childSignatures}</${node.tag}>`;
}

function countElements(node: JsxNode): number {
    return 1 + node.children.reduce((sum, child) => sum + countElements(child), 0);
}

function averageSize(group: Candidate[]): number {
    return group.reduce((sum, candidate) => sum + candidate.elementCount, 0) / group.length;
}

function overlapsAny(node: JsxNode, ranges: Array<[number, number]>): boolean {
    return ranges.some(([start, end]) => node.start < end && node.end > start);
}

function hashSignature(signature: string): string {
    return crypto.createHash('sha256').update(signature).digest('hex').slice(0, 8);
}

function getDirectTexts(node: JsxNode, code: string): string[] {
    let cursor = node.openEnd;
    const texts: string[] = [];
    for (const child of node.children) {
        collectText(code.slice(cursor, child.start), texts);
        cursor = child.end;
    }
    collectText(code.slice(cursor, node.closeStart), texts);
    return texts;
}

function collectText(segment: string, texts: string[]): void {
    const cleaned = segment
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
        .replace(/\{[^}]*\}/g, '')
        .trim();
    if (cleaned) texts.push(cleaned);
}

function inferPropSlots(group: Candidate[]): PropSlot[] {
    const textMatrix = group.map(candidate => extractTexts(candidate.source));
    const srcMatrix = group.map(candidate => extractAttrValues(candidate.source, 'src'));
    const classMatrix = group.map(candidate => extractAttrValues(candidate.source, 'className'));
    const slots: PropSlot[] = [];

    addDifferingSlots(slots, 'text', textMatrix);
    addDifferingSlots(slots, 'src', srcMatrix);
    addDifferingSlots(slots, 'className', classMatrix);

    return slots;
}

function addDifferingSlots(slots: PropSlot[], kind: PropSlot['kind'], matrix: string[][]): void {
    const max = Math.max(...matrix.map(row => row.length), 0);
    for (let index = 0; index < max; index++) {
        const values = matrix.map(row => row[index] ?? '');
        if (new Set(values).size <= 1) continue;
        const baseName = kind === 'text' ? 'text' : kind === 'src' ? 'imageSrc' : 'variant';
        const sameKindCount = slots.filter(slot => slot.kind === kind).length;
        const slot: PropSlot = {
            kind,
            name: sameKindCount === 0 ? baseName : `${baseName}${sameKindCount + 1}`,
            firstValue: values[0],
            values,
        };

        // className은 인스턴스 간 공통 토큰을 템플릿으로 빼고, prop 값에는 차이 토큰만 남긴다
        // (긴 Tailwind 문자열이 인스턴스 표 행마다 통째로 반복되는 것을 방지)
        if (kind === 'className') {
            const tokenLists = values.map(value => value.split(/\s+/).filter(Boolean));
            const common = tokenLists[0].filter(token => tokenLists.every(tokens => tokens.includes(token)));
            const commonSet = new Set(common);
            slot.commonClasses = common.join(' ');
            slot.values = tokenLists.map(tokens => tokens.filter(token => !commonSet.has(token)).join(' '));
        }

        slot.defaultValue = mostFrequent(slot.values);
        slots.push(slot);
    }
}

function extractTexts(source: string): string[] {
    const texts: string[] = [];
    const textRegex = />\s*([^<>{}\n][^<>{}]*)\s*</g;
    let match: RegExpExecArray | null;
    while ((match = textRegex.exec(source)) !== null) {
        const value = match[1].trim();
        if (value) texts.push(value);
    }
    return texts;
}

function extractAttrValues(source: string, attrName: string): string[] {
    const values: string[] = [];
    const attrRegex = new RegExp(`\\s${attrName}=(?:"([^"]*)"|\\{([^}]*)\\})`, 'g');
    let match: RegExpExecArray | null;
    while ((match = attrRegex.exec(source)) !== null) {
        values.push(match[1] ?? match[2] ?? '');
    }
    return values;
}

function buildTemplate(source: string, slots: PropSlot[]): string {
    let result = source;
    for (const slot of slots) {
        if (!slot.firstValue) continue;
        if (slot.kind === 'text') {
            result = result.replace(`>${slot.firstValue}<`, `>{${slot.name}}<`);
        } else if (slot.kind === 'src') {
            result = result.replace(`src="${slot.firstValue}"`, `src={${slot.name}}`);
            result = result.replace(`src={${slot.firstValue}}`, `src={${slot.name}}`);
        } else {
            const replacement = slot.commonClasses
                ? `className={\`${slot.commonClasses} \${${slot.name}}\`}`
                : `className={${slot.name}}`;
            result = result.replace(`className="${slot.firstValue}"`, replacement);
            result = result.replace(`className={${slot.firstValue}}`, replacement);
        }
    }
    return result;
}

function buildComponentDefinition(name: string, slots: PropSlot[], template: string): string {
    if (slots.length === 0) {
        return `function ${name}() {\n  return (\n${indent(template, 4)}\n  );\n}`;
    }

    // 최빈값을 기본값으로 선언해 인스턴스 호출에서 반복을 제거한다
    const defaultComment = slots.some(slot => slot.defaultValue !== undefined)
        ? `// 기본값: ${slots
            .filter(slot => slot.defaultValue !== undefined)
            .map(slot => `${slot.name}=${JSON.stringify(slot.defaultValue)}`)
            .join(', ')}\n`
        : '';
    const params = slots
        .map(slot => slot.defaultValue !== undefined ? `${slot.name} = ${JSON.stringify(slot.defaultValue)}` : slot.name)
        .join(', ');
    const typeShape = slots
        .map(slot => `${slot.name}${slot.defaultValue !== undefined ? '?' : ''}: string`)
        .join('; ');
    return `${defaultComment}function ${name}({ ${params} }: { ${typeShape} }) {\n  return (\n${indent(template, 4)}\n  );\n}`;
}

function buildInstance(name: string, slots: PropSlot[], index: number, reusedFrom?: RegistryComponent): string {
    const props = slots
        // 기본값과 같은 값은 생략 — 다른 값일 때만 prop을 넘긴다
        .filter(slot => reusedFrom || (slot.values[index] ?? '') !== slot.defaultValue)
        .map(slot => `${slot.name}=${JSON.stringify(slot.values[index] ?? '')}`)
        .join(' ');
    const reuseComment = reusedFrom
        ? `{/* 기존 컴포넌트 재사용: ${reusedFrom.filePath} - 새로 만들지 마라 */}\n`
        : '';
    return `${reuseComment}<${name}${props ? ` ${props}` : ''} />`;
}

function buildInstanceDataSection(name: string, slots: PropSlot[], count: number): string {
    if (slots.length === 0) return '';
    const rows: string[] = [];
    rows.push(`## 반복 인스턴스 데이터: ${name}`);
    rows.push('');
    const defaults = slots
        .filter(slot => slot.defaultValue !== undefined)
        .map(slot => `${slot.name}=${JSON.stringify(slot.defaultValue)}`);
    if (defaults.length > 0) {
        rows.push(`기본값: ${defaults.map(value => `\`${value}\``).join(', ')} (표의 \`·\`는 기본값과 동일)`);
        rows.push('');
    }
    rows.push('| # | ' + slots.map(slot => slot.name).join(' | ') + ' |');
    rows.push('|---|' + slots.map(() => '---|').join(''));
    for (let index = 0; index < count; index++) {
        rows.push(`| ${index + 1} | ${slots.map(slot => formatInstanceCell(slot, index)).join(' | ')} |`);
    }
    return rows.join('\n');
}

function formatInstanceCell(slot: PropSlot, index: number): string {
    const value = slot.values[index] ?? '';
    if (value === slot.defaultValue) return '`·`';
    return `\`${escapePipe(value)}\``;
}

function applyReplacements(code: string, replacements: Array<{ start: number; end: number; text: string }>): string {
    return replacements
        .sort((a, b) => b.start - a.start)
        .reduce((current, replacement) => (
            current.slice(0, replacement.start) + replacement.text + current.slice(replacement.end)
        ), code);
}

function inferComponentName(tag: string, index: number): string {
    const cleanTag = tag.replace(/[^A-Za-z0-9]/g, '');
    const suffix = index === 0 ? '' : `${index + 1}`;
    return `Repeated${cleanTag.charAt(0).toUpperCase()}${cleanTag.slice(1)}${suffix}`;
}

function indent(value: string, spaces: number): string {
    const padding = ' '.repeat(spaces);
    return value.split('\n').map(line => `${padding}${line}`).join('\n');
}

function escapePipe(value: string): string {
    return value.replace(/\|/g, '\\|');
}

function mostFrequent(values: string[]): string {
    const counts = new Map<string, number>();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);

    let best = values[0] ?? '';
    let bestCount = 0;
    for (const [value, count] of counts) {
        if (count > bestCount) {
            best = value;
            bestCount = count;
        }
    }
    return best;
}

function normalizeName(name: string): string {
    return name.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
}
