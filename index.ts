#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as fs from 'fs/promises';
import * as path from 'path';

import { FigmaProxy } from './figma-proxy.js';
import { FigmaNormalizer } from './figma-normalizer.js';
import { ensureOllamaReady } from './ollama-helper.js';
import { resolveBridgePaths } from './paths.js';
import { hashRawText, NodeCacheManager } from './cache-manager.js';
import { ComponentRegistry } from './component-registry.js';
import { buildDiffHandoff } from './diff-handoff.js';
import { ensureAgentRuleFiles } from './agent-rules.js';
import { getProfileHandoffFilename, resolveProfile } from './target-profiles.js';

type ScreenshotMode = 'path' | 'inline' | 'none';
type HandoffMode = 'auto' | 'full' | 'diff';

interface HandoffArgs {
    projectRoot?: string;
    screenshot?: ScreenshotMode;
    force_refresh?: boolean;
    mode?: HandoffMode;
    target?: string;
    styling?: string;
}

interface RegistryArgs {
    projectRoot?: string;
    target?: string;
    styling?: string;
}

const server = new Server(
    {
        name: "figma-cost-optimizer-bridge",
        version: "1.0.0",
    },
    { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_optimized_figma_handoff",
                description: "피그마에서 현재 선택된 요소를 토큰 최적화 핸드오프로 변환합니다. 타겟 웹 프레임워크와 스타일링 방식을 지정할 수 있습니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectRoot: {
                            type: "string",
                            description: "에셋과 캐시를 저장할 프로젝트 루트. 생략하면 FIGMA_BRIDGE_ROOT 또는 현재 cwd를 사용합니다.",
                        },
                        screenshot: {
                            enum: ["path", "inline", "none"],
                            default: "path",
                            description: "스크린샷 반환 방식. path는 PNG를 캐시에 저장하고 절대 경로만 전달합니다.",
                        },
                        force_refresh: {
                            type: "boolean",
                            default: false,
                            description: "해시가 같아도 캐시를 무시하고 전체 파이프라인을 다시 실행합니다.",
                        },
                        mode: {
                            enum: ["auto", "full", "diff"],
                            default: "auto",
                            description: "auto는 이전 버전이 있으면 diff, 없으면 full 핸드오프를 반환합니다.",
                        },
                        target: {
                            enum: ["react", "vue", "svelte", "html"],
                            default: "react",
                            description: "핸드오프를 생성할 타겟 웹 프레임워크입니다.",
                        },
                        styling: {
                            enum: ["tailwind", "styled-components", "emotion", "css-modules", "inline"],
                            default: "tailwind",
                            description: "뼈대 코드의 디자인 토큰을 최종 구현으로 변환할 스타일링 방식입니다.",
                        },
                    },
                },
            },
            {
                name: "sync_component_registry",
                description: "프로젝트의 src/components 아래 컴포넌트를 타겟 프레임워크 확장자 기준으로 스캔해 로컬 컴포넌트 레지스트리를 갱신합니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectRoot: {
                            type: "string",
                            description: "스캔할 프로젝트 루트. 생략하면 FIGMA_BRIDGE_ROOT 또는 현재 cwd를 사용합니다.",
                        },
                        target: {
                            enum: ["react", "vue", "svelte", "html"],
                            default: "react",
                            description: "스캔할 컴포넌트 확장자를 결정하는 타겟 프레임워크입니다.",
                        },
                        styling: {
                            enum: ["tailwind", "styled-components", "emotion", "css-modules", "inline"],
                            default: "tailwind",
                            description: "프로필 해석용 스타일링 방식입니다. 레지스트리 스캔에서는 확장자 결정 외 영향이 없습니다.",
                        },
                    },
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "sync_component_registry") {
        const args = request.params.arguments as RegistryArgs | undefined;
        const profile = resolveProfile(args?.target, args?.styling);
        const bridgePaths = resolveBridgePaths(args?.projectRoot);
        await ensureAgentRules(bridgePaths.projectRoot);
        const registry = new ComponentRegistry(bridgePaths.projectRoot, bridgePaths.cacheDir, profile.componentExtensions);
        const data = await registry.syncFromSourceComponents();
        return {
            content: [{
                type: "text",
                text: `레지스트리 동기화 완료(${profile.label}, ${profile.componentExtensions.join(', ')}): ${data.components.length}개 컴포넌트\n파일: ${path.join(bridgePaths.cacheDir, 'registry.json')}`,
            }],
        };
    }

    if (request.params.name !== "get_optimized_figma_handoff") {
        throw new Error(`알 수 없는 도구입니다: ${request.params.name}`);
    }

    const args = request.params.arguments as HandoffArgs | undefined;
    const profile = resolveProfile(args?.target, args?.styling);
    const handoffFilename = getProfileHandoffFilename(profile);
    const bridgePaths = resolveBridgePaths(args?.projectRoot);
    await ensureAgentRules(bridgePaths.projectRoot);
    const cacheDir = bridgePaths.cacheDir;
    const screenshotMode = args?.screenshot ?? 'path';
    const mode = args?.mode ?? 'auto';
    const proxy = new FigmaProxy(cacheDir);
    const normalizer = new FigmaNormalizer(cacheDir, 'llama3.2', {
        assetDir: bridgePaths.assetDir,
        projectRoot: bridgePaths.projectRoot,
        profile,
    });
    const nodeCache = new NodeCacheManager(cacheDir);

    try {
        await proxy.connect();
        // 1. 코드 가져오기
        const rawText = await proxy.getSelectionContext();
        const componentName = FigmaProxy.extractComponentName(rawText);
        const hash = hashRawText(rawText);
        const nodeDir = nodeCache.getNodeDir(componentName, hash);
        const cached = await handoffExists(nodeDir, handoffFilename);

        if (cached && !args?.force_refresh) {
            console.error(`⚡ 해시 캐시 히트: ${componentName}_${hash}`);
            await proxy.disconnect();
            const mdContent = await fs.readFile(path.join(nodeDir, handoffFilename), 'utf-8');
            const screenshotPaths = await listScreenshotPaths(nodeDir);
            return { content: await buildToolContent(mdContent, screenshotMode, screenshotPaths) };
        }

        // 2. 스크린샷 가져오기 — XML(복수 선택)이면 최상위 프레임별로 각각 캡처
        const isXml = rawText.trimStart().startsWith('<');
        let screenshotContent: any[] | null = null;
        const nodeIds = isXml
            ? [...rawText.matchAll(/^<frame id="([^"]+)"/gm)].map(m => m[1])
            : [];

        if (screenshotMode !== 'none' && isXml) {
            // 들여쓰기 없이 시작하는 최상위 <frame id="..."> 추출
            if (nodeIds.length > 1) {
                console.error(`🖼️  복수 선택 감지 (${nodeIds.length}개) — 각 프레임 스크린샷 개별 캡처`);
                screenshotContent = await proxy.getScreenshots(nodeIds);
            } else {
                screenshotContent = await proxy.getScreenshot(nodeIds[0]);
            }
        } else if (screenshotMode !== 'none') {
            screenshotContent = await proxy.getScreenshot();
        }

        await proxy.disconnect();
        await fs.mkdir(nodeDir, { recursive: true });
        await fs.writeFile(path.join(nodeDir, 'raw.txt'), rawText, 'utf-8');
        const screenshotPaths = await saveScreenshots(screenshotContent, nodeDir);
        const previous = await nodeCache.findPrevious(componentName, hash);

        // 3. 코드 정제 (V3 무손실 압축)
        const tokens = await normalizer.extractTokens(componentName, rawText);
        const fullHandoffPath = path.join(nodeDir, handoffFilename);
        await normalizer.generateHandoffMarkdown(tokens, {
            outputPath: fullHandoffPath,
            screenshotPaths: screenshotMode === 'path' ? screenshotPaths : undefined,
            profile,
        });

        let mdContent = await fs.readFile(fullHandoffPath, 'utf-8');
        const previousMd = previous ? await readHandoffIfExists(previous.dir, handoffFilename) : null;
        const shouldDiff = mode === 'diff' || (mode === 'auto' && previousMd);
        if (shouldDiff && previous && previousMd) {
            const diff = buildDiffHandoff({
                componentName,
                previousHash: previous.meta.hash,
                currentHash: hash,
                previousMarkdown: previousMd,
                currentMarkdown: mdContent,
                screenshotPaths: screenshotMode === 'path' ? screenshotPaths : undefined,
            });
            mdContent = diff.markdown;
            // 캐시의 handoff.md는 항상 전체본을 유지한다 — diff는 별도 파일로만 저장
            // (덮어쓰면 캐시 히트와 다음 diff 비교가 diff 문서를 기준으로 동작해 깨진다)
            await fs.writeFile(path.join(nodeDir, 'diff.md'), mdContent, 'utf-8');
            console.error(diff.fallback
                ? `↩️  변경량 ${(diff.changedLineRatio * 100).toFixed(1)}%로 전체 핸드오프를 반환합니다.`
                : `✅ Diff 핸드오프 생성 완료 (${(diff.changedLineRatio * 100).toFixed(1)}% 변경)`);
        }

        await nodeCache.writeMeta(nodeDir, {
            componentName,
            hash,
            nodeIds,
            createdAt: new Date().toISOString(),
            figmaName: componentName,
            target: profile.framework,
            styling: profile.styling,
        });
        await nodeCache.prune(componentName, 2);

        await fs.mkdir(cacheDir, { recursive: true });
        await fs.writeFile(path.join(cacheDir, 'handoff.md'), mdContent, 'utf-8');
        return { content: await buildToolContent(mdContent, screenshotMode, screenshotPaths, screenshotContent) };

    } catch (error: any) {
        try { await proxy.disconnect(); } catch (_) { }
        return {
            isError: true,
            content: [{ type: "text", text: `에러 발생: ${error.message}` }],
        };
    }
});

async function saveScreenshots(screenshotContent: any[] | null, nodeDir: string): Promise<string[]> {
    if (!screenshotContent?.length) return [];
    const paths: string[] = [];
    let imageIndex = 0;

    for (const item of screenshotContent) {
        if (item.type !== 'image' || !item.data) continue;
        const filename = imageIndex === 0 ? 'screenshot.png' : `screenshot_${imageIndex + 1}.png`;
        const screenshotPath = path.join(nodeDir, filename);
        await fs.writeFile(screenshotPath, Buffer.from(item.data, 'base64'));
        paths.push(screenshotPath);
        imageIndex++;
    }

    return paths;
}

async function listScreenshotPaths(nodeDir: string): Promise<string[]> {
    const files = await fs.readdir(nodeDir).catch(() => []);
    return files
        .filter(file => /^screenshot(?:_\d+)?\.png$/.test(file))
        .sort()
        .map(file => path.join(nodeDir, file));
}

async function handoffExists(nodeDir: string, filename: string): Promise<boolean> {
    try {
        await fs.access(path.join(nodeDir, filename));
        return true;
    } catch {
        return false;
    }
}

async function readHandoffIfExists(nodeDir: string, filename: string): Promise<string | null> {
    try {
        return await fs.readFile(path.join(nodeDir, filename), 'utf-8');
    } catch {
        return null;
    }
}

async function buildToolContent(
    mdContent: string,
    screenshotMode: ScreenshotMode,
    screenshotPaths: string[],
    screenshotContent?: any[] | null
): Promise<any[]> {
    const finalContent: any[] = [{ type: "text", text: mdContent }];
    if (screenshotMode !== 'inline') return finalContent;

    if (screenshotContent?.length) {
        finalContent.push(...screenshotContent.filter(item => item.type === 'image'));
        return finalContent;
    }

    for (const screenshotPath of screenshotPaths) {
        const data = await fs.readFile(screenshotPath);
        finalContent.push({
            type: 'image',
            data: data.toString('base64'),
            mimeType: 'image/png',
        });
    }

    return finalContent;
}

async function main() {
    await ensureAgentRules(resolveBridgePaths().projectRoot);

    // Ollama 설치, 서버 실행, 기본 모델 준비까지 MCP가 필수로 보장한다.
    await ensureOllamaReady({ modelName: 'llama3.2' });

    const transport = new StdioServerTransport();
    await server.connect(transport);
}

async function ensureAgentRules(projectRoot: string): Promise<void> {
    try {
        const files = await ensureAgentRuleFiles(projectRoot);
        if (files.length) {
            console.error(`🧭 에이전트 규칙 파일 갱신: ${files.map(file => path.basename(file)).join(', ')}`);
        }
    } catch (error) {
        console.error(`⚠️  에이전트 규칙 파일 작성 실패: ${(error as Error).message}`);
    }
}

main().catch(console.error);
