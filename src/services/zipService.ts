import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

class ZipService {
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

export default new ZipService();
