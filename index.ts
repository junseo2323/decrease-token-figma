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
        // 2. 스크린샷 이미지 가져오기
        const screenshotContent = await proxy.getScreenshot();
        await proxy.disconnect();

        const match = rawText.match(/function\s+([A-Za-z0-9_]+)/);
        const componentName = match ? match[1] : "UnknownComponent";

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