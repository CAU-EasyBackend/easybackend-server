import ApiSpec, {IApiSpec} from '../models/ApiSpec';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import HttpError from '../helpers/httpError';
import {OpenAPIGeneratorScript} from '../scripts/OpenAPIGeneratorScript';
import {OpenAPIChangeScript} from '../scripts/OpenAPIChangeScript'; //곽영헌 추가
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import ZipService from './zipService';
import {Octokit} from '@octokit/rest';
import simpleGit from 'simple-git';

class CodeGensService {
  async generateCode(userId: string, apiSpec: IApiSpec, frameworkType: string) {
    const yamlFileFolder = path.resolve(__dirname, '..', '..', 'temps', 'apiSpecs', userId);
    if(!fs.existsSync(yamlFileFolder)) {
      fs.mkdirSync(yamlFileFolder, { recursive: true });
    }
    const yamlFilePath = path.join(yamlFileFolder, `${apiSpec.projectName}.yaml`);
    fs.writeFileSync(yamlFilePath, apiSpec.yamlContent, 'utf-8');

    let framework = 'nodejs-express-server';
    if(frameworkType === 'express') {
      framework = 'nodejs-express-server';
    } else if(frameworkType === 'spring') {
      framework = 'spring';
    }

    const generatorFolder = path.resolve(__dirname, '..', '..', 'temps', 'generatedCodes', userId, apiSpec.projectName);
    if(!fs.existsSync(generatorFolder)) {
      fs.mkdirSync(generatorFolder, { recursive: true });
    }

    const script = OpenAPIGeneratorScript(yamlFilePath, framework, generatorFolder); 
    execSync(script); 

    let version=1; //곽영헌 추가, 적절한 버전 선택해야 함, 초기엔 ver1로 생성하고 ++를 함, 한편 꼭 데모때 업데이트되어 버전 1,2,3.. 에 대해 증명하는 방법이 version을 출력하는것만 있는게 아님, 
    //코드 생성단계에서 이 코드가 
    //어느 서버, 인스턴스의 몇번째 버전에서 쓰일지 확정되지 않았기 때문. 
    const ChangeScript=OpenAPIChangeScript(version++); //곽영헌 추가, 일단은 버전 비스무리하게 가는데 위에 말한대로 생성한 코드가 어느 서버 인스턴스의 몇번째 버전에서 쓰일지 확정이 아님
    
     
    const expressServerPath = path.join(generatorFolder, 'expressServer.js'); //expressServer.js 바꿔쓰기

  
    if (fs.existsSync(expressServerPath)) {//곽영헌 추가, 바꿔쓰기
      fs.unlinkSync(expressServerPath); //곽영헌 추가, 바꿔쓰기
    }

    fs.writeFileSync(expressServerPath, ChangeScript, 'utf-8'); //곽영헌 추가 바꿔쓰기



    return {
      projectName: apiSpec.projectName,
      dirPath: generatorFolder,
    }
  }

  async zipGeneratedCode(userId: string, projectId: string, frameworkType: string) {
    const apiSpec = await ApiSpec.findById(projectId);
    if(!apiSpec) {
      throw new HttpError(BaseResponseStatus.UNKNOWN_PROJECT);
    } else if(apiSpec.ownerUserId !== userId) {
      throw new HttpError(BaseResponseStatus.FORBIDDEN_USER);
    }

    const generateResult = await this.generateCode(userId, apiSpec, frameworkType);

    const projectName = generateResult.projectName;
    const dirPath = generateResult.dirPath;
    const zipPath = path.resolve(dirPath, '..', `${projectName}.zip`);

    await ZipService.compressFolder(dirPath, zipPath);

    return {
      projectName,
      zipPath,
    }
  }

  async uploadGithubGeneratedCode(userId: string, accessToken: string, projectId: string, frameworkType: string) {
    const apiSpec = await ApiSpec.findById(projectId);
    if(!apiSpec) {
      throw new HttpError(BaseResponseStatus.UNKNOWN_PROJECT);
    } else if(apiSpec.ownerUserId !== userId) {
      throw new HttpError(BaseResponseStatus.FORBIDDEN_USER);
    }

    const octokit = new Octokit({ auth: accessToken });
    const repo = await octokit.repos.createForAuthenticatedUser({
      name: apiSpec.projectName,
      private: true,
    });

    const generateResult = await this.generateCode(userId, apiSpec, frameworkType);
    const dirPath = generateResult.dirPath;

    const git = simpleGit(dirPath);
    await git.init();
    await git.add('.');
    await git.commit('initial commit');
    await git.addRemote('origin', repo.data.clone_url);
    await git.push('origin', 'main');

    return {
      projectName: generateResult.projectName,
      repositoryURL: repo.data.html_url,
    }
  }
}

export default new CodeGensService();
