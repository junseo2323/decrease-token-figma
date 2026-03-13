#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as fs from 'fs/promises';
import * as path from 'path';

import { FigmaProxy } from './figma-proxy.js';
import { FigmaNormalizer } from './figma-normalizer.js';

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
                description: "피그마에서 현재 선택된 요소의 '정제된 React 코드'와 '스크린샷 이미지'를 가져와 완벽한 시각적/구조적 정보를 제공합니다.",
                inputSchema: { type: "object", properties: {} },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "get_optimized_figma_handoff") {
        throw new Error(`알 수 없는 도구입니다: ${request.params.name}`);
    }

    const cacheDir = './.figma_cache';
    const proxy = new FigmaProxy(cacheDir);
    const normalizer = new FigmaNormalizer(cacheDir);

    try {
        await proxy.connect();
        // 1. 코드 가져오기
        const rawText = await proxy.getSelectionContext();

        // 2. 스크린샷 가져오기 — XML(복수 선택)이면 최상위 프레임별로 각각 캡처
        const isXml = rawText.trimStart().startsWith('<') && !rawText.includes('function ');
        let screenshotContent: any[] | null;

        if (isXml) {
            // 들여쓰기 없이 시작하는 최상위 <frame id="..."> 추출
            const topLevelIds = [...rawText.matchAll(/^<frame id="([^"]+)"/gm)].map(m => m[1]);
            if (topLevelIds.length > 1) {
                console.error(`🖼️  복수 선택 감지 (${topLevelIds.length}개) — 각 프레임 스크린샷 개별 캡처`);
                screenshotContent = await proxy.getScreenshots(topLevelIds);
            } else {
                screenshotContent = await proxy.getScreenshot(topLevelIds[0]);
            }
        } else {
            screenshotContent = await proxy.getScreenshot();
        }

        await proxy.disconnect();

        // JSX(function 키워드) 또는 XML(name 속성)에서 컴포넌트명 추출
        const jsxMatch = rawText.match(/function\s+([A-Za-z0-9_]+)/);
        const xmlMatch = rawText.match(/name="([^"]+)"/);
        const componentName = jsxMatch
            ? jsxMatch[1]
            : xmlMatch
                ? xmlMatch[1].replace(/[^a-zA-Z0-9]+(.)/g, (_: string, c: string) => c.toUpperCase()).replace(/^[^a-zA-Z]/, 'C').substring(0, 40)
                : 'UnknownComponent';

        // 3. 코드 정제 (V3 무손실 압축)
        const tokens = await normalizer.extractTokens(componentName);
        await normalizer.generateHandoffMarkdown(tokens);

        // 4. Claude에게 전달할 최종 데이터 조립
        const mdContent = await fs.readFile(path.join(cacheDir, 'handoff.md'), 'utf-8');

        const finalContent: any[] = [
            {
                type: "text",
                text: mdContent, // 뼈대와 텍스트가 담긴 마크다운
            }
        ];

        // 스크린샷이 성공적으로 찍혔다면 배열에 이미지 추가!
        if (screenshotContent && screenshotContent.length > 0) {
            finalContent.push(...screenshotContent);
        }

        return { content: finalContent };

    } catch (error: any) {
        try { await proxy.disconnect(); } catch (_) { }
        return {
            isError: true,
            content: [{ type: "text", text: `에러 발생: ${error.message}` }],
        };
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(console.error);