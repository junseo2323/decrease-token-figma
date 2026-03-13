import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as fs from 'fs/promises';

async function main() {
    console.log("Starting MCP client...");
    const transport = new StdioClientTransport({
        command: "node",
        args: ["./build/index.js"]
    });
    
    const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
    
    await client.connect(transport);
    console.log("Connected to figma-bridge MCP server.");
    
    console.log("Calling get_optimized_figma_handoff...");
    const result = await client.callTool({
        name: "get_optimized_figma_handoff",
        arguments: {}
    });
    
    await fs.writeFile("handoff_result.json", JSON.stringify(result, null, 2));
    console.log("Result saved to handoff_result.json");
    
    process.exit(0);
}

main().catch(console.error);
