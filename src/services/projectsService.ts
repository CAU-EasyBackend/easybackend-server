import ApiSpec, {IApiSpec} from '../models/ApiSpec';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import HttpError from '../helpers/httpError';

class ProjectsService {
  async getProjectList(userId: string) {
    const projectList: IApiSpec[] = await ApiSpec.find({ ownerUserId: userId }).sort({ projectName: 1 }).exec();
    const projects = await Promise.all(projectList.map(async (project) => ({
      projectId: project._id,
      projectName: project.projectName,
    })));

    return { projects: projects };
  }

  async getApiSpec(userId: string, projectId: string) {
    const apiSpec: IApiSpec | null = await ApiSpec.findById(projectId);
    if(!apiSpec) {
      throw new HttpError(BaseResponseStatus.UNKNOWN_PROJECT);
    } else if(apiSpec.ownerUserId !== userId) {
      throw new HttpError(BaseResponseStatus.FORBIDDEN_USER);
    }

    return apiSpec;
  }
}

export default new ProjectsService();
