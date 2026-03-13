import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import * as fs from 'fs/promises';
import * as path from 'path';

export class FigmaProxy {
    private client: Client;
    private transport: SSEClientTransport;
    private cacheDir: string;

    constructor(cacheDir: string = './.figma_cache') {
        this.cacheDir = cacheDir;
        const serverUrl = new URL("http://127.0.0.1:3845/sse");
        this.transport = new SSEClientTransport(serverUrl);

        this.client = new Client(
            { name: "figma-proxy-bridge", version: "1.0.0" },
            { capabilities: {} }
        );
    }

    private extractComponentName(text: string): string {
        // JSX 포맷: function ComponentName
        const jsxMatch = text.match(/function\s+([A-Za-z0-9_]+)/);
        if (jsxMatch) return jsxMatch[1];

        // XML 포맷: 첫 번째 name 속성에서 추출 후 유효한 식별자로 변환
        const xmlMatch = text.match(/name="([^"]+)"/);
        if (xmlMatch) {
            return xmlMatch[1]
                .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
                .replace(/^[^a-zA-Z]/, 'C')
                .substring(0, 40) || 'UnknownComponent';
        }

        return 'UnknownComponent';
    }

    private async ensureCacheDir() {
        await fs.mkdir(this.cacheDir, { recursive: true }).catch(() => { });
    }

    public async connect() {
        await this.client.connect(this.transport);
        console.error("✅ 로컬 Figma MCP (포트 3845)에 성공적으로 연결되었습니다.");
    }

    public async getSelectionContext() {
        await this.ensureCacheDir();
        try {
            console.error("⏳ 피그마에서 현재 선택된 요소를 가져오는 중...");
            const response = await this.client.callTool({
                name: "get_design_context",
                arguments: {}
            });
            const contentArray = response.content as any[];
            const rawText = contentArray.find((c: any) => c.type === 'text')?.text;
            if (!rawText) throw new Error("응답이 비어있습니다. 피그마에서 요소를 선택했는지 확인해주세요.");

            // JSX(function 키워드) 또는 XML(name 속성)에서 컴포넌트명 추출
            const componentName = this.extractComponentName(rawText);
            const cachePath = path.join(this.cacheDir, `selection_${componentName}.tsx`);

            await fs.writeFile(cachePath, rawText, 'utf-8');
            return rawText;
        } catch (error) {
            console.error("❌ 선택된 노드 가져오기 실패:", error);
            throw error;
        }
    }

    // 💡 새롭게 추가된 스크린샷 캡처 함수!
    public async getScreenshot(nodeId?: string) {
        try {
            console.error(`📸 피그마 스크린샷 캡처 중...${nodeId ? ` (nodeId: ${nodeId})` : ''}`);
            const args: Record<string, string> = {};
            if (nodeId) args.nodeId = nodeId;
            const response = await this.client.callTool({
                name: "get_screenshot",
                arguments: args,
            });
            return response.content as any[];
        } catch (error) {
            console.error(`❌ 스크린샷 가져오기 실패${nodeId ? ` (${nodeId})` : ''}: ${(error as Error).message}`);
            return null;
        }
    }

    // 여러 nodeId에 대해 스크린샷을 순차적으로 가져옴
    public async getScreenshots(nodeIds: string[]): Promise<any[]> {
        const results: any[] = [];
        for (const nodeId of nodeIds) {
            const content = await this.getScreenshot(nodeId);
            if (content && content.length > 0) {
                results.push(...content);
            }
        }
        return results;
    }

    public async disconnect() {
        await this.transport.close();
    }
}