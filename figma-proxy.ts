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

    public static extractComponentName(text: string, fallback: string = 'UnknownComponent'): string {
        return extractComponentName(text, fallback);
    }

    private async ensureCacheDir() {
        await fs.mkdir(this.cacheDir, { recursive: true }).catch(() => { });
    }

    public async connect() {
        await this.client.connect(this.transport);
        console.error("✅ Connected to the local Figma MCP server on port 3845.");
    }

    public async getSelectionContext() {
        await this.ensureCacheDir();
        try {
            console.error("⏳ Fetching the current Figma selection...");
            const response = await this.client.callTool({
                name: "get_design_context",
                arguments: {}
            });
            const contentArray = response.content as any[];
            const rawText = contentArray.find((c: any) => c.type === 'text')?.text;
            if (!rawText) throw new Error("The response is empty. Make sure an element is selected in Figma.");

            // Extract the component name from JSX (`function`) or XML (`name` attribute).
            const componentName = FigmaProxy.extractComponentName(rawText);
            const cachePath = path.join(this.cacheDir, `selection_${componentName}.tsx`);

            await fs.writeFile(cachePath, rawText, 'utf-8');
            return rawText;
        } catch (error) {
            console.error("❌ Failed to fetch the selected node:", error);
            throw error;
        }
    }

    public async getScreenshot(nodeId?: string) {
        try {
            console.error(`📸 Capturing Figma screenshot...${nodeId ? ` (nodeId: ${nodeId})` : ''}`);
            const args: Record<string, string> = {};
            if (nodeId) args.nodeId = nodeId;
            const response = await this.client.callTool({
                name: "get_screenshot",
                arguments: args,
            });
            return response.content as any[];
        } catch (error) {
            console.error(`❌ Failed to capture screenshot${nodeId ? ` (${nodeId})` : ''}: ${(error as Error).message}`);
            return null;
        }
    }

    // Fetch screenshots sequentially for multiple node IDs.
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
        await this.client.close();
    }
}

export function extractComponentName(text: string, fallback: string = 'UnknownComponent'): string {
    // JSX format: function ComponentName
    const jsxMatch = text.match(/function\s+([A-Za-z0-9_]+)/);
    if (jsxMatch) return jsxMatch[1];

    // XML format: use the first name attribute and convert it into a valid identifier.
    const xmlMatch = text.match(/name="([^"]+)"/);
    if (xmlMatch) {
        return xmlMatch[1]
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
            .replace(/^[^a-zA-Z]/, 'C')
            .substring(0, 40) || fallback;
    }

    return fallback;
}
