import ApiSpec from '../models/ApiSpec';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import HttpError from '../helpers/httpError';
import {OpenAPIGeneratorScript} from '../scripts/OpenAPIGeneratorScript';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

class CodeGensService {
  async generateCode(userId: string, projectId: string, frameworkType: string) {
    const apiSpec = await ApiSpec.findById(projectId);
    if(!apiSpec) {
      throw new HttpError(BaseResponseStatus.UNKNOWN_PROJECT);
    } else if(apiSpec.ownerUserId !== userId) {
      throw new HttpError(BaseResponseStatus.FORBIDDEN_USER);
    }

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
  }
}

export default new CodeGensService();
