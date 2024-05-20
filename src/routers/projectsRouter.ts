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

export default router;
