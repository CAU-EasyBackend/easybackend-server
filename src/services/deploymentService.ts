import simpleGit from 'simple-git';
import JSZip from 'jszip';
import { promises as fs } from 'fs';
import path from 'path';

class DeploymentService {
  async deployNewServer(username: string, zipPath: string){
    /*
    const instanceIndex = DB에서 해당 username의 유저가 소유한 인스턴스 중 가장 마지막 인스턴스의 인덱스 + 1;
    const instanceName = username + '-' + instanceIndex;
    await 배포함수(zipPath, instanceName, 1);
     */
  }

  async updateServer(username: string, instanceID: string, zipPath: string){
    /*
    const serverVersion = DB에서 해당 instanceName의 서버 버전 + 1;
    await 배포함수(zipPath, instanceName, serverVersion);
     */
  }

  async gitCloneDeploy(username: string, instanceID: string | null, repositoryURL: string) {
    const parsedURL = new URL(repositoryURL);
    const pathParts = parsedURL.pathname.split('/').filter((part) => part !== '');
    const repositoryUsername = pathParts[0];
    const repositoryName = pathParts[1].replace('.git', '');

    const dirPath: string = 'uploads/deploy/' + repositoryUsername + '/' + repositoryName;
    const zipPath: string = 'uploads/deploy/' + repositoryName + '.zip';

    const git = simpleGit();
    await git.clone(repositoryURL, dirPath);
    await this.compressFolder(dirPath, zipPath);

    if(instanceID) {
      await this.updateServer(username, instanceID, zipPath);
    } else {
      await this.deployNewServer(username, zipPath);
    }
  }

  async compressFolder(dirPath: string, zipPath: string) {
    const zip = new JSZip();
    await this.addDirectoryToZip(zip, dirPath);

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    await fs.writeFile(zipPath, zipContent);
  }

  async addDirectoryToZip(zip: JSZip, dirPath: string, basePath: string = '') {
    const files = await fs.readdir(dirPath);

    for(const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if(stat.isDirectory()) {
        const subDir = zip.folder(path.join(basePath, file))!;
        await this.addDirectoryToZip(subDir, filePath, path.join(basePath, file));
      } else {
        const content = await fs.readFile(filePath);
        zip.file(path.join(basePath, file), content);
      }
    }
  }
}

export default new DeploymentService();
