import ApiSpec, {IApiSpec} from '../models/ApiSpec';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import HttpError from '../helpers/httpError';
import {OpenAPIGeneratorScript} from '../scripts/OpenAPIGeneratorScript';
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
