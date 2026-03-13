const fs = require('fs');
const text = fs.readFileSync('/Users/seojuno/.gemini/antigravity/brain/62fdb8eb-31b3-4991-9727-8cd5ca324bdd/.system_generated/steps/273/output.txt', 'utf-8');

let code = text;
const funcIndex = code.indexOf('function ');
if (funcIndex !== -1) {
    code = code.substring(funcIndex);
}

// 2. 인라인 <svg> 태그 처리
code = code.replace(/<svg[^>]*data-name="([^"]+)"[\s\S]*?<\/svg>/g, (match, name) => '{/* SVG Icon */}');
code = code.replace(/<svg[\s\S]*?<\/svg>/g, '{/* SVG Icon */}');

// 3. 사진 변수 제거
code = code.replace(/const img.*? = "http:\/\/localhost.*?;\n/g, '');

// 4. 노드 ID 삭제
code = code.replace(/\sdata-node-id="[^"]+"/g, '');

// 5. 절대 좌표 및 고정 픽셀 제거
code = code.replace(/(?:\s|^)(absolute|relative|fixed|shrink-0|flex-none)(?=\s|")/g, '');
code = code.replace(/(?:\s|^)(top|bottom|left|right|inset(?:-[xy])?|-?translate-[xy]|z|w|h|min-w|min-h|max-w|max-h|size)-[^"\s]+/g, '');

// 6. 빈 className 정리
code = code.replace(/className="([^"]*)"/g, (match, p1) => {
    const cleaned = p1.replace(/\s+/g, ' ').trim();
    return cleaned ? `className="${cleaned}"` : '';
});
code = code.replace(/ className=""/g, '');

const rawSize = text.length;
const optimizedSize = code.length;

console.log(`- 원본 텍스트 크기: ${rawSize} 자`);
console.log(`- 최적화된 텍스트 크기: ${optimizedSize} 자`);
console.log(`- 절감률: ${((1 - optimizedSize/rawSize)*100).toFixed(1)}%`);
