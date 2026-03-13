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

    private async ensureCacheDir() {
        await fs.mkdir(this.cacheDir, { recursive: true }).catch(() => { });
    }

    public async connect() {
        await this.client.connect(this.transport);
        console.log("✅ 로컬 Figma MCP (포트 3845)에 성공적으로 연결되었습니다.");
    }

    public async getSelectionContext() {
        await this.ensureCacheDir();
        try {
            console.log("⏳ 피그마에서 현재 선택된 요소를 가져오는 중...");
            const response = await this.client.callTool({
                name: "get_design_context",
                arguments: {}
            });
            const contentArray = response.content as any[];
            const rawText = contentArray.find((c: any) => c.type === 'text')?.text;
            if (!rawText) throw new Error("응답이 비어있습니다. 피그마에서 요소를 선택했는지 확인해주세요.");

            const match = rawText.match(/function\s+([A-Za-z0-9_]+)/);
            const componentName = match ? match[1] : "UnknownComponent";
            const cachePath = path.join(this.cacheDir, `selection_${componentName}.tsx`);

            await fs.writeFile(cachePath, rawText, 'utf-8');
            return rawText;
        } catch (error) {
            console.error("❌ 선택된 노드 가져오기 실패:", error);
            throw error;
        }
    }

    // 💡 새롭게 추가된 스크린샷 캡처 함수!
    public async getScreenshot() {
        try {
            console.log("📸 피그마에서 스크린샷 캡처 중...");
            const response = await this.client.callTool({
                name: "get_screenshot",
                arguments: {}
            });
            // 이미지 데이터(base64 배열)를 그대로 반환합니다.
            return response.content as any[];
        } catch (error) {
            console.error("❌ 스크린샷 가져오기 실패 (생략하고 텍스트만 전달합니다):", error);
            return null;
        }
    }

    public async disconnect() {
        await this.transport.close();
    }
}