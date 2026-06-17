#!/usr/bin/env node
import { FigmaProxy } from './figma-proxy.js';
import { FigmaNormalizer } from './figma-normalizer.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { resolveBridgePaths } from './paths.js';

async function handoff() {
    console.log("🎨 Figma → React Handoff\n");
    console.log("=".repeat(70));
    
    const bridgePaths = resolveBridgePaths();
    const cacheDir = bridgePaths.cacheDir;
    const testSrcDir = path.join(bridgePaths.projectRoot, 'test', 'src', 'components');
    
    try {
        // 1. Fetch data from Figma.
        console.log("1️⃣  Extracting component from Figma...\n");
        const proxy = new FigmaProxy(cacheDir);
        
        await proxy.connect();
        const rawText = await proxy.getSelectionContext();
        
        // Also fetch a screenshot.
        const screenshot = await proxy.getScreenshot();
        
        await proxy.disconnect();
        
        const componentName = FigmaProxy.extractComponentName(rawText, 'Component');
        
        console.log(`✅ Selected component: ${componentName}\n`);
        
        // 3. Clean and optimize code.
        console.log("2️⃣  Optimizing code...\n");
        const normalizer = new FigmaNormalizer(cacheDir, 'llama3.2', {
            convertSvgToComponent: false, // Compact mode: keep SVG replacement comments.
            assetDir: bridgePaths.assetDir,
        });
        
        const tokens = await normalizer.extractTokens(componentName);
        await normalizer.generateHandoffMarkdown(tokens);
        
        // 4. Read handoff.md.
        const mdContent = await fs.readFile(path.join(cacheDir, 'handoff.md'), 'utf-8');
        
        // 5. Create a component file in the test folder.
        console.log("3️⃣  Creating React component...\n");
        await fs.mkdir(testSrcDir, { recursive: true });
        
        // Extract the code block.
        const codeMatch = mdContent.match(/```tsx\n([\s\S]*?)\n```/);
        let componentCode = codeMatch ? codeMatch[1] : mdContent;
        
        // Fix relative asset imports.
        componentCode = componentCode.replace(/from '\.\/assets\//g, "from '../assets/");
        
        // Save the component file.
        const componentPath = path.join(testSrcDir, `${componentName}.tsx`);
        await fs.writeFile(componentPath, componentCode, 'utf-8');
        console.log(`✅ Component saved: ${componentPath}\n`);
        
        // 6. Save screenshots if available.
        if (screenshot && screenshot.length > 0) {
            const screenshotDir = path.join(bridgePaths.projectRoot, 'test', 'public', 'screenshots');
            await fs.mkdir(screenshotDir, { recursive: true });
            
            for (let i = 0; i < screenshot.length; i++) {
                const shot = screenshot[i];
                if (shot.type === 'image' && shot.data) {
                    const screenshotPath = path.join(screenshotDir, `${componentName}_${i}.png`);
                    const buffer = Buffer.from(shot.data, 'base64');
                    await fs.writeFile(screenshotPath, buffer);
                    console.log(`✅ Screenshot saved: ${screenshotPath}`);
                }
            }
        }
        
        // 7. Copy handoff.md into the test folder.
        await fs.writeFile(path.join(testSrcDir, `${componentName}_handoff.md`), mdContent, 'utf-8');
        console.log(`\n✅ Handoff document saved: ${testSrcDir}/${componentName}_handoff.md`);
        
        console.log("\n" + "=".repeat(70));
        console.log("🎉 Done!\n");
        console.log("📁 Generated files:");
        console.log(`   - ${componentPath}`);
        console.log(`   - ${testSrcDir}/${componentName}_handoff.md`);
        console.log("\n🚀 Next steps:");
        console.log("   1. Review the component in test/src/components");
        console.log("   2. Import and use the component in App.tsx");
        console.log("   3. Check the result at http://localhost:5173");
        console.log("=".repeat(70));
        
    } catch (error) {
        console.error("\n❌ Error:", error);
        process.exit(1);
    }
}

handoff();
