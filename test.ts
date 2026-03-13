import { FigmaProxy } from './figma-proxy';

async function main() {
    console.log("1️⃣ 스크립트 실행 시작!"); // 이 로그조차 안 뜨면 ts-node 세팅 자체의 문제입니다.

    const proxy = new FigmaProxy();

    try {
        console.log("2️⃣ 로컬 Figma MCP 프로세스 연결 시도 중...");
        await proxy.connect();

        console.log(`3️⃣ 피그마 데이터 요청 시작 (피그마 앱 켜져 있는지 확인!)...`);
        const data = await proxy.getSelectionContext();

        console.log('\n✅ 성공! 가져온 데이터 일부:');
        console.log(JSON.stringify(data).substring(0, 200) + '... (생략)');

    } catch (error) {
        console.error("\n❌ 실행 중 에러 발생! 세부 내용:");
        console.error(error);
    } finally {
        await proxy.disconnect();
        console.log("4️⃣ 프록시 연결 종료됨");
    }
}

// 💡 최상단에서 발생하는 에러를 놓치지 않기 위해 catch 추가
main().catch((err) => {
    console.error("🔥 치명적인 에러:", err);
});