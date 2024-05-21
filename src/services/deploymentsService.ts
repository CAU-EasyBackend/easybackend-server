import simpleGit from 'simple-git';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import Instance, {IInstance} from '../models/Instance';
import User from '../models/User';
import Server, {IServer} from '../models/Server';
import ServerVersion from '../models/ServerVersion';
import HttpError from '../helpers/httpError';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';

class DeploymentsService {
  async deployNewServer(userId: string, zipPath: string){
    const username: string = (await User.findOne({ userId }))!.username;

    //삭제된 인스턴스가 있는지 확인하고, 있다면 빠른 인스턴스 번호인 것부터 할당
    let newInstance: IInstance | null = await Instance.findOne({
      ownerUserId: userId, status: 'terminated'
    }).sort({ instanceNumber: 1 });

    if(newInstance) {
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

    //await 배포함수(zipPath, newInstance.instanceName, newServerVersion.version);
    newInstance.status = 'running';
    await newInstance.save();
    await newServer.save();
    await newServerVersion.save();
  }

  async updateServer(userId: string, instanceId: string, zipPath: string){
    const instance: IInstance | null = await Instance.findOne({ _id: instanceId });
    if(!instance) {
      throw new HttpError(BaseResponseStatus.UNKNOWN_INSTANCE);
    } else if(instance.ownerUserId !== userId) {
      throw new HttpError(BaseResponseStatus.FORBIDDEN_USER);
    }

    //인스턴스 하나에 서버 1개만 가능한 것으로 제한하고 구현, 만약 여러개를 지원하려면 수정 필요
    const server: IServer | null = await Server.findOne({ instanceId: instance._id });
    if(!server) {
      throw new HttpError(BaseResponseStatus.UNKNOWN_SERVER);
    }

    const newServerVersion = new ServerVersion({
      serverId: server._id,
      version: server.latestVersion + 1,
    });
    server.runningVersion = server.latestVersion;
    server.latestVersion = newServerVersion.version;

    //await 배포함수(zipPath, instance.instanceName, newServerVersion.version);
    instance.status = 'running';
    await instance.save();
    await server.save();
    await newServerVersion.save();
  }

  async gitCloneDeploy(userId: string, instanceId: string | null, repositoryURL: string) {
    const parsedURL = new URL(repositoryURL);
    const pathParts = parsedURL.pathname.split('/').filter((part) => part !== '');
    const repositoryUsername = pathParts[0];
    const repositoryName = pathParts[1].replace('.git', '');

    const uploadFolder = path.resolve(__dirname, '..', '..', 'temps', 'uploads', userId, 'sourceCodes');
    if(!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }

    const dirPath: string = path.join(uploadFolder, repositoryUsername, repositoryName);
    const zipPath: string = path.join(uploadFolder, repositoryName + '.zip');

    const git = simpleGit();
    await git.clone(repositoryURL, dirPath);
    await this.compressFolder(dirPath, zipPath);

    if(instanceId) {
      await this.updateServer(userId, instanceId, zipPath);
    } else {
      await this.deployNewServer(userId, zipPath);
    }
  }

  async compressFolder(dirPath: string, zipPath: string) {
    const zip = new JSZip();
    await this.addDirectoryToZip(zip, dirPath);

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    await fs.promises.writeFile(zipPath, zipContent);
  }

  async addDirectoryToZip(zip: JSZip, dirPath: string, basePath: string = '') {
    const files = await fs.promises.readdir(dirPath);

    for(const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.promises.stat(filePath);

      if(stat.isDirectory()) {
        const subDir = zip.folder(path.join(basePath, file))!;
        await this.addDirectoryToZip(subDir, filePath, path.join(basePath, file));
      } else {
        const content = await fs.promises.readFile(filePath);
        zip.file(path.join(basePath, file), content);
      }
    }
  }
}

export default new DeploymentsService();
