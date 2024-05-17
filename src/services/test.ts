const DeployService = require('./deployService');

const deployService = new DeployService();

async function main() {
    try {
        const ip = await deployService.firstGenerate(); //테라폼으로 인스턴스 생성, 키 권한설정, 필요한 의존성 설치하고 해당 인스턴스의 ip 반환
        console.log(`Instance created with IP: ${ip}`);

        await deployService.uploadBackCode(ip, 1, 'express'); //express.zip이라는 프로젝트가 있다면 이 프로젝트를 업로드하고 expressver1.zip으로 이름을 바꿈
        console.log('Uploaded back code.');

        await deployService.executeBackCode(ip, 1, 'express'); //expressver1.zip을 압축해제 하고 npm start 함.
        console.log('Executed back code.');

        // 테스트 및 기타 작업 수행 후

        await deployService.terminateBackCode(ip); //8080포트를 닫고 지금 사용중인 버전의 모든 파일 제거(파일이름verX.zip은 남겨둠)
        console.log('Terminated back code.');
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
