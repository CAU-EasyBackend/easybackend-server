import ApiSpec, {IApiSpec} from '../models/ApiSpec';

class ProjectsService {
  async getProjectList(userId: string) {
    const projectList: IApiSpec[] = await ApiSpec.find({ ownerUserId: userId }).sort({ projectName: 1 }).exec();
    const projects = await Promise.all(projectList.map(async (project) => ({
      projectName: project.projectName,
    })));

    return { projects: projects };
  }
}

export default new ProjectsService();
