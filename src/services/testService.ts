import simpleGit from 'simple-git';
import JSZip from 'jszip';
import { promises as fs } from 'fs';
import path from 'path';

class TestService {
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

  async compressFolder(dirPath: string) {
    const zip = new JSZip();
    await this.addDirectoryToZip(zip, dirPath);

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    await fs.writeFile(dirPath + '.zip', zipContent);
  }

  async gitClone(repositoryURL: string) {
    const parsedURL = new URL(repositoryURL);
    const pathParts = parsedURL.pathname.split('/').filter((part) => part !== '');
    const username = pathParts[0];
    const repositoryName = pathParts[1].replace('.git', '');

    const git = simpleGit();
    await git.clone(repositoryURL, 'copySourceCode/' + username + '/' + repositoryName);
    await this.compressFolder('copySourceCode/' + username + '/' + repositoryName);

    return;
  }
}

export default new TestService();
