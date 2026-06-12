import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

import { hashRawText, NodeCacheManager } from '../cache-manager.js';
import { ComponentRegistry } from '../component-registry.js';
import { buildDiffHandoff } from '../diff-handoff.js';
import { deduplicateSubtrees } from '../subtree-deduper.js';
import { getOllamaCandidatePaths, resolveOllamaBinary } from '../ollama-helper.js';

const repeatedCode = `function ChatScreen() {
  return (
    <div className="screen">
      <div className="bubble left"><span>Hello</span><span>14:02</span></div>
      <div className="bubble right"><span>Hi</span><span>14:03</span></div>
      <div className="bubble left"><span>Done</span><span>14:04</span></div>
    </div>
  );
}`;

test('hash cache distinguishes hits and misses', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'figma-bridge-cache-'));
    const manager = new NodeCacheManager(path.join(root, '.figma_cache'));
    const raw = 'function Card() { return <div>Hi</div>; }';
    const hash = hashRawText(raw);
    const dir = manager.getNodeDir('Card', hash);

    assert.equal(await manager.exists('Card', hash), false);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'handoff.md'), '# handoff', 'utf-8');
    await manager.writeMeta(dir, {
        componentName: 'Card',
        hash,
        nodeIds: [],
        createdAt: new Date().toISOString(),
        figmaName: 'Card',
    });

    assert.equal(await manager.exists('Card', hash), true);
    assert.equal(await manager.exists('Card', hashRawText(raw + ' changed')), false);
});

test('ollama bootstrap honors OLLAMA_BIN before PATH candidates', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'figma-bridge-ollama-'));
    const fakeOllama = path.join(root, 'ollama');
    await fs.writeFile(fakeOllama, '#!/bin/sh\n', 'utf-8');

    const candidates = getOllamaCandidatePaths({
        OLLAMA_BIN: fakeOllama,
        PATH: `/tmp/elsewhere${path.delimiter}${root}`,
    } as NodeJS.ProcessEnv);

    assert.equal(candidates[0], fakeOllama);
    assert.equal(await resolveOllamaBinary({ OLLAMA_BIN: fakeOllama, PATH: '' } as NodeJS.ProcessEnv), fakeOllama);
});

test('deduplicateSubtrees extracts repeated structures only at three or more instances', () => {
    const deduped = deduplicateSubtrees(repeatedCode);
    assert.match(deduped.code, /function RepeatedDiv/);
    assert.match(deduped.code, /<RepeatedDiv/);
    assert.equal(deduped.components[0].instanceCount, 3);

    const twoItems = repeatedCode.replace('      <div className="bubble left"><span>Done</span><span>14:04</span></div>\n', '');
    const unchanged = deduplicateSubtrees(twoItems);
    assert.equal(unchanged.code, twoItems);
    assert.equal(unchanged.components.length, 0);
});

test('registry hash match replaces repeated component definition with reuse instruction', () => {
    const first = deduplicateSubtrees(repeatedCode);
    const reused = deduplicateSubtrees(repeatedCode, {
        components: [{
            name: 'MessageBubble',
            filePath: 'src/components/MessageBubble.tsx',
            structureHash: first.components[0].structureHash,
            props: ['text', 'text2', 'variant'],
            source: 'bridge',
            lastSeen: new Date().toISOString(),
        }],
    });

    assert.doesNotMatch(reused.code, /function RepeatedDiv/);
    assert.match(reused.code, /기존 컴포넌트 재사용: src\/components\/MessageBubble\.tsx/);
    assert.match(reused.code, /<MessageBubble/);
});

test('component registry treats broken JSON as empty and scans source components', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'figma-bridge-registry-'));
    const cacheDir = path.join(root, '.figma_cache');
    const componentsDir = path.join(root, 'src', 'components');
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.mkdir(componentsDir, { recursive: true });
    await fs.writeFile(path.join(cacheDir, 'registry.json'), '{ broken', 'utf-8');
    await fs.writeFile(path.join(componentsDir, 'Button.tsx'), `
export interface ButtonProps { label: string; disabled?: boolean }
export function Button({ label }: ButtonProps) { return <button>{label}</button>; }
`, 'utf-8');

    const registry = new ComponentRegistry(root, cacheDir);
    assert.deepEqual(await registry.read(), { components: [] });
    const data = await registry.syncFromSourceComponents();

    assert.equal(data.components[0].name, 'Button');
    assert.deepEqual(data.components[0].props, ['label', 'disabled']);
});

test('registry upsert keeps entries with same generic name but different structure hashes', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'figma-bridge-upsert-'));
    const cacheDir = path.join(root, '.figma_cache');
    const registry = new ComponentRegistry(root, cacheDir);

    await registry.upsert({
        name: 'RepeatedDiv',
        filePath: 'src/components/RepeatedDiv.tsx',
        structureHash: 'aaaaaaaa',
        props: ['text'],
        source: 'bridge',
    });
    await registry.upsert({
        name: 'RepeatedDiv',
        filePath: 'src/components/RepeatedDiv.tsx',
        structureHash: 'bbbbbbbb',
        props: ['imageSrc'],
        source: 'bridge',
    });
    // 같은 해시는 새 항목이 아니라 기존 항목 갱신이어야 한다
    await registry.upsert({
        name: 'RepeatedDiv',
        filePath: 'src/components/RepeatedDiv.tsx',
        structureHash: 'aaaaaaaa',
        props: ['text', 'variant'],
        source: 'bridge',
    });

    const data = await registry.read();
    assert.equal(data.components.length, 2);
    assert.deepEqual(
        data.components.map(component => component.structureHash).sort(),
        ['aaaaaaaa', 'bbbbbbbb']
    );
    assert.deepEqual(
        data.components.find(component => component.structureHash === 'aaaaaaaa')?.props,
        ['text', 'variant']
    );
});

test('diff handoff summarizes small changes and falls back above forty percent', () => {
    const previousMarkdown = '# Old\n```tsx\nfunction ChatInput() {\n  return <button className="bg-[#3B82F6]">전송</button>;\n}\n```';
    const currentMarkdown = '# New\n```tsx\nfunction ChatInput() {\n  return <button className="bg-[#2563EB]">보내기</button>;\n}\n```';
    const diff = buildDiffHandoff({
        componentName: 'ChatInput',
        previousHash: 'aaaaaaaa',
        currentHash: 'bbbbbbbb',
        previousMarkdown,
        currentMarkdown,
        screenshotPaths: ['/tmp/screenshot.png'],
    });

    assert.equal(diff.fallback, false);
    assert.match(diff.markdown, /텍스트 변경: "전송" -> "보내기"/);
    assert.match(diff.markdown, /className 변경: "bg-\[#3B82F6\]" -> "bg-\[#2563EB\]"/);

    const fallback = buildDiffHandoff({
        componentName: 'BigChange',
        previousHash: 'aaaaaaaa',
        currentHash: 'cccccccc',
        previousMarkdown: '# Old\n```tsx\n<div>\n  <span>A</span>\n  <span>B</span>\n</div>\n```',
        currentMarkdown: '# New\n```tsx\n<section>\n  <h1>C</h1>\n  <p>D</p>\n  <button>E</button>\n</section>\n```',
    });

    assert.equal(fallback.fallback, true);
    assert.match(fallback.markdown, /변경이 많아 전체를 다시 전달합니다/);
});
