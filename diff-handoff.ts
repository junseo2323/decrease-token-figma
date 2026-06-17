export interface DiffHandoffResult {
    markdown: string;
    fallback: boolean;
    changedLineRatio: number;
}

export function buildDiffHandoff(params: {
    componentName: string;
    previousHash: string;
    currentHash: string;
    previousMarkdown: string;
    currentMarkdown: string;
    screenshotPaths?: string[];
}): DiffHandoffResult {
    const previousCode = extractCodeBlock(params.previousMarkdown);
    const currentCode = extractCodeBlock(params.currentMarkdown);
    const previousLines = previousCode.split(/\r?\n/);
    const currentLines = currentCode.split(/\r?\n/);
    const changes = lineChanges(previousLines, currentLines);
    const addedLineCount = changes.filter(change => change.kind === 'added').length;
    const removedLineCount = changes.filter(change => change.kind === 'removed').length;
    const changedLineCount = Math.max(addedLineCount, removedLineCount);
    const totalLineCount = Math.max(previousLines.length, currentLines.length, 1);
    const changedLineRatio = changedLineCount / totalLineCount;

    if (changedLineRatio > 0.4) {
        return {
            markdown: params.currentMarkdown.replace(
                /^# /,
                '# Too many lines changed; sending the full handoff again\n\n# '
            ),
            fallback: true,
            changedLineRatio,
        };
    }

    const textPairs = pairValues(extractVisibleTexts(previousCode), extractVisibleTexts(currentCode));
    const classPairs = pairValues(extractClassValues(previousCode), extractClassValues(currentCode));
    const addedFragments = collectChangedFragments(changes, 'added');
    const removedFragments = collectChangedFragments(changes, 'removed');
    const screenshotSection = params.screenshotPaths?.length
        ? `\n## Latest Screenshots\n${params.screenshotPaths.map(file => `- ${file}`).join('\n')}\n\n> Before deciding layout, read the image file paths above with the Read tool.\n`
        : '';

    const markdown = `# Diff Handoff: ${params.componentName} (previous ${params.previousHash} -> current ${params.currentHash})
${screenshotSection}
This screen has already been implemented. Apply only the changes listed below. Do not rewrite unrelated code.

## Changes
${formatPairs('Text change', textPairs)}
${formatPairs('className change', classPairs)}
${formatFragments('Added JSX fragments', addedFragments)}
${formatFragments('Removed JSX fragments', removedFragments)}
`;

    return { markdown, fallback: false, changedLineRatio };
}

function extractCodeBlock(markdown: string): string {
    const match = markdown.match(/```tsx\n([\s\S]*?)\n```/);
    return match ? match[1] : markdown;
}

type Change = { kind: 'same' | 'added' | 'removed'; line: string };

function lineChanges(previous: string[], current: string[]): Change[] {
    const rows = previous.length + 1;
    const cols = current.length + 1;
    const dp = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

    for (let i = previous.length - 1; i >= 0; i--) {
        for (let j = current.length - 1; j >= 0; j--) {
            dp[i][j] = previous[i] === current[j]
                ? dp[i + 1][j + 1] + 1
                : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
    }

    const changes: Change[] = [];
    let i = 0;
    let j = 0;
    while (i < previous.length && j < current.length) {
        if (previous[i] === current[j]) {
            changes.push({ kind: 'same', line: previous[i] });
            i++;
            j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            changes.push({ kind: 'removed', line: previous[i++] });
        } else {
            changes.push({ kind: 'added', line: current[j++] });
        }
    }
    while (i < previous.length) changes.push({ kind: 'removed', line: previous[i++] });
    while (j < current.length) changes.push({ kind: 'added', line: current[j++] });

    return changes;
}

function extractVisibleTexts(code: string): string[] {
    const values: string[] = [];
    const regex = />\s*([^<>{}\n][^<>{}]*)\s*</g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(code)) !== null) {
        const value = match[1].trim();
        if (value) values.push(value);
    }
    return values;
}

function extractClassValues(code: string): string[] {
    return [...code.matchAll(/className=(?:"([^"]*)"|\{([^}]*)\})/g)]
        .map(match => match[1] ?? match[2] ?? '')
        .filter(Boolean);
}

function pairValues(previous: string[], current: string[]): Array<[string, string]> {
    const count = Math.max(previous.length, current.length);
    const pairs: Array<[string, string]> = [];
    for (let index = 0; index < count; index++) {
        const before = previous[index] ?? '';
        const after = current[index] ?? '';
        if (before !== after) pairs.push([before, after]);
    }
    return pairs;
}

function collectChangedFragments(changes: Change[], kind: 'added' | 'removed'): string[] {
    return changes
        .filter(change => change.kind === kind)
        .map(change => change.line.trim())
        .filter(line => line.startsWith('<') || line.startsWith('{') || line.includes('className='))
        .slice(0, 12);
}

function formatPairs(label: string, pairs: Array<[string, string]>): string {
    if (pairs.length === 0) return '';
    return pairs
        .map(([before, after], index) => `${index + 1}. ${label}: "${before}" -> "${after}"`)
        .join('\n');
}

function formatFragments(label: string, fragments: string[]): string {
    if (fragments.length === 0) return '';
    return `\n### ${label}\n\n\`\`\`tsx\n${fragments.join('\n')}\n\`\`\``;
}
