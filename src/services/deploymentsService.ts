import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import Instance, { IInstance } from '../models/Instance';
import User from '../models/User';
import Server, { IServer } from '../models/Server';
import ServerVersion from '../models/ServerVersion';
import HttpError from '../helpers/httpError';
import DeployService from './deployService'; // DeployService import 추가
import { BaseResponseStatus } from '../helpers/baseResponseStatus';
import ZipService from './zipService';



class DeploymentsService {
  private deployService = DeployService; // DeployService 인스턴스 생성 입니다

  async deployNewServer(userId: string, zipPath: string) {
    const username: string = (await User.findOne({ userId }))!.username;
    //console.log("deployNewServer");

    // 삭제된 인스턴스가 있는지 확인하고, 있다면 빠른 인스턴스 번호인 것부터 할당
    let newInstance: IInstance | null = await Instance.findOne({
      ownerUserId: userId, status: 'terminated'
    }).sort({ instanceNumber: 1 });

    if (newInstance) {
      newInstance.status = 'creating';
      newInstance.IP = '';
    } else {
      const lastInstance = await Instance.findOne({
        ownerUserId: userId
      }).sort({ instanceNumber: -1 });

      const instanceNumber: number = lastInstance ? lastInstance.instanceNumber + 1 : 1;
      const instanceName = username + '-' + instanceNumber;

      newInstance = new Instance({
        instanceName,
        instanceNumber,
        ownerUserId: userId,
        status: 'creating',
      });
    }

    const newServer = new Server({
      instanceId: newInstance._id,
      serverName: 'server',
      runningVersion: 1,
      latestVersion: 1,
    });

    const newServerVersion = new ServerVersion({
      serverId: newServer._id,
      version: 1,
    });




    // DeployService를 이용하여 서버 배포
    const instanceIp = await this.deployService.firstGenerate(newInstance.instanceName); // 인스턴스 IP 생성
   // console.log("here's the naming :", newServerVersion.version);
   // console.log("here's the instance naming :", newInstance.instanceName);
   // console.log("here is the zipPath name :", path.parse(zipPath).name);


    //zipPath의 zip을 /src/services로 위치를 변경하고, 이름을 newInstance.instanceName으로 변경하는 함수가 필요한 부분


    await this.deployService.uploadBackCode(instanceIp, newServerVersion.version, path.parse(zipPath).name, path.dirname(zipPath)); // 코드 업로드
    await this.deployService.executeBackCode(instanceIp, newServerVersion.version, path.parse(zipPath).name); // 코드 실행

    newInstance.status = 'running';
    newInstance.IP = instanceIp; // IP 주소를 인스턴스에 저장
    await newInstance.save();
    await newServer.save();
    await newServerVersion.save();
  }

  async updateServer(userId: string, instanceId: string, zipPath: string) {
    //console.log("updateNewServer");
    const instance: IInstance | null = await Instance.findOne({ _id: instanceId });
    if (!instance) {
      throw new HttpError(BaseResponseStatus.UNKNOWN_INSTANCE);
    } else if (instance.ownerUserId !== userId) {
      throw new HttpError(BaseResponseStatus.FORBIDDEN_USER);
    }

    const server: IServer | null = await Server.findOne({ instanceId: instance._id });
    if (!server) {
      throw new HttpError(BaseResponseStatus.UNKNOWN_SERVER);
    }

    const newServerVersion = new ServerVersion({
      serverId: server._id,
      version: server.latestVersion + 1,
    });
    server.runningVersion = server.latestVersion;
    server.latestVersion = newServerVersion.version;

    // DeployService를 이용하여 서버 업데이트
    await this.deployService.terminateBackCode(instance.IP); // 기존 코드 종료
    await this.deployService.uploadBackCode(instance.IP, newServerVersion.version, path.parse(zipPath).name, path.dirname(zipPath)); // 새 코드 업로드
    await this.deployService.executeBackCode(instance.IP, newServerVersion.version, path.parse(zipPath).name); // 새 코드 실행

    instance.status = 'running';
    await instance.save();
    await server.save();
    await newServerVersion.save();
  }

  async gitCloneDeploy(userId: string, argInstanceId: string | null, repositoryURL: string) {
   // console.log("gitCloneDeploy");
    const parsedURL = new URL(repositoryURL);
    const pathParts = parsedURL.pathname.split('/').filter((part) => part !== '');
    const repositoryUsername = pathParts[0];
    const repositoryName = pathParts[1].replace('.git', '');

    const uploadFolder = path.resolve(__dirname, '..', '..', 'temps', 'uploads', 'sourceCodes', userId);
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }

    const dirPath: string = path.join(uploadFolder, repositoryUsername, repositoryName);
    const zipPath: string = path.join(uploadFolder, repositoryName + '.zip');

    // Delete the existing .zip file if it exists
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    // Delete the directory and its contents if it exists
    if (fs.existsSync(dirPath)) {
      fs.rmdirSync(dirPath, { recursive: true });
    }



    const git = simpleGit();
    await git.clone(repositoryURL, dirPath);
    await ZipService.compressFolder(dirPath, zipPath);

    if (argInstanceId) { //argInstaceId는 매개변수로 들어온 instanceId
      await this.updateServer(userId, argInstanceId, zipPath);
    } else {
      await this.deployNewServer(userId, zipPath);
    }
  }
}



export default new DeploymentsService();
