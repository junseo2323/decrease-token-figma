import { FigmaNormalizer } from './figma-normalizer';

async function main() {
    // 기본 모델 llama3.2 사용
    const normalizer = new FigmaNormalizer('./.figma_cache', 'llama3.2');

    try {
        // 1주 차에 저장된 selection_Container.tsx 파일을 분석
        const tokens = await normalizer.extractTokens("Container");

        // 분석된 JSON을 바탕으로 md 파일 생성
        await normalizer.generateHandoffMarkdown(tokens);

        console.log("\n🎉 2주 차 파이프라인(Ollama 압축) 정상 작동 완료!");

    } catch (err) {
        console.error("테스트 중 에러:", err);
    }
}

main();