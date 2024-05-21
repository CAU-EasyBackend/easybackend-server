import ApiSpec from '../models/ApiSpec';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import HttpError from '../helpers/httpError';
import {OpenAPIGeneratorScript} from '../scripts/OpenAPIGeneratorScript';
import { execSync } from 'child_process';

class CodeGensService {
  async generateCode(userId: string, projectId: string, frameworkType: string) {
    const apiSpec = await ApiSpec.findById(projectId);
    if(!apiSpec) {
      throw new HttpError(BaseResponseStatus.UNKNOWN_PROJECT);
    } else if(apiSpec.ownerUserId !== userId) {
      throw new HttpError(BaseResponseStatus.FORBIDDEN_USER);
    }

    const script = OpenAPIGeneratorScript(apiSpec.projectName, frameworkType, apiSpec.yamlContent);
    execSync(script);
  }
}

export default new CodeGensService();
