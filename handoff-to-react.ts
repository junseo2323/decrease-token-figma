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
        // 1. Figma 에서 데이터 가져오기
        console.log("1️⃣  Figma 에서 컴포넌트 추출 중...\n");
        const proxy = new FigmaProxy(cacheDir);
        
        await proxy.connect();
        const rawText = await proxy.getSelectionContext();
        
        // 스크린샷도 가져오기
        const screenshot = await proxy.getScreenshot();
        
        await proxy.disconnect();
        
        const componentName = FigmaProxy.extractComponentName(rawText, 'Component');
        
        console.log(`✅ 선택된 컴포넌트: ${componentName}\n`);
        
        // 3. 코드 정제 및 최적화
        console.log("2️⃣  코드 최적화 중...\n");
        const normalizer = new FigmaNormalizer(cacheDir, 'llama3.2', {
            convertSvgToComponent: false, // Compact 모드로 SVG 주석 처리
            assetDir: bridgePaths.assetDir,
        });
        
        const tokens = await normalizer.extractTokens(componentName);
        await normalizer.generateHandoffMarkdown(tokens);
        
        // 4. handoff.md 읽기
        const mdContent = await fs.readFile(path.join(cacheDir, 'handoff.md'), 'utf-8');
        
        // 5. test 폴더에 컴포넌트 파일 생성
        console.log("3️⃣  React 컴포넌트 생성 중...\n");
        await fs.mkdir(testSrcDir, { recursive: true });
        
        // 코드 블록 추출
        const codeMatch = mdContent.match(/```tsx\n([\s\S]*?)\n```/);
        let componentCode = codeMatch ? codeMatch[1] : mdContent;
        
        // import 문 정리 (상대 경로 수정)
        componentCode = componentCode.replace(/from '\.\/assets\//g, "from '../assets/");
        
        // 컴포넌트 파일 저장
        const componentPath = path.join(testSrcDir, `${componentName}.tsx`);
        await fs.writeFile(componentPath, componentCode, 'utf-8');
        console.log(`✅ 컴포넌트 저장: ${componentPath}\n`);
        
        // 6. 스크린샷 저장 (있는 경우)
        if (screenshot && screenshot.length > 0) {
            const screenshotDir = path.join(bridgePaths.projectRoot, 'test', 'public', 'screenshots');
            await fs.mkdir(screenshotDir, { recursive: true });
            
            for (let i = 0; i < screenshot.length; i++) {
                const shot = screenshot[i];
                if (shot.type === 'image' && shot.data) {
                    const screenshotPath = path.join(screenshotDir, `${componentName}_${i}.png`);
                    const buffer = Buffer.from(shot.data, 'base64');
                    await fs.writeFile(screenshotPath, buffer);
                    console.log(`✅ 스크린샷 저장: ${screenshotPath}`);
                }
            }
        }
        
        // 7. handoff.md 도 test 폴더에 복사
        await fs.writeFile(path.join(testSrcDir, `${componentName}_handoff.md`), mdContent, 'utf-8');
        console.log(`\n✅ Handoff 문서 저장: ${testSrcDir}/${componentName}_handoff.md`);
        
        console.log("\n" + "=".repeat(70));
        console.log("🎉 완료!\n");
        console.log("📁 생성된 파일:");
        console.log(`   - ${componentPath}`);
        console.log(`   - ${testSrcDir}/${componentName}_handoff.md`);
        console.log("\n🚀 다음 단계:");
        console.log("   1. test/src/components 폴더에서 컴포넌트 확인");
        console.log("   2. App.tsx 에서 컴포넌트 import 하여 사용");
        console.log("   3. http://localhost:5173 에서 결과 확인");
        console.log("=".repeat(70));
        
    } catch (error) {
        console.error("\n❌ 에러 발생:", error);
        process.exit(1);
    }
}

handoff();
