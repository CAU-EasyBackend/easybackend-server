import {Request, Response, Router} from 'express';
import {isAuthenticated} from '../middlewares/passport-github';
import wrapAsync from '../helpers/wrapFunction';
import ProjectsService from '../services/projectsService';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import response from '../helpers/response';

const router = Router();

/**
 * 프로젝트 목록 조회 api
 * get: /api/projects/list
 */
router.get('/list', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const projects = await ProjectsService.getProjectList(userId);

  const responseStatus = BaseResponseStatus.SUCCESS;

  return res.status(responseStatus.status).json(response(responseStatus, projects));
}));

/**
 * api 명세 yaml 조회 api
 * get: /api/projects/:projectId/apiSpec
 */
router.get('/:projectId/apiSpec', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const projectId = req.params.projectId;

  const apiSpec = await ProjectsService.getApiSpec(userId, projectId);

  res.setHeader('Content-Type', 'test/yaml');
  res.setHeader('Content-Disposition', `attachment; filename=${apiSpec.projectName}.yaml`);
  res.send(apiSpec.yamlContent);
}));

export default router;