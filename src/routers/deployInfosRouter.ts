import {Request, Response, Router} from 'express';
import {isAuthenticated} from '../middlewares/passport-github';
import wrapAsync from '../helpers/wrapFunction';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import DeployInfosService from '../services/deployInfosService';
import response from '../helpers/response';

const router = Router();

/**
 * 서버 배포 정보 종합 조회 api
 * get: /api/deployInfos/statusAll
 */
router.get('/statusAll', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const responseStatus = BaseResponseStatus.SUCCESS;
  const result = await DeployInfosService.getStatusAll(req.user!.userId);

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

/**
 * 인스턴스 목록 조회 api
 * get: /api/deployInfos/instances
 */
router.get('/instances', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const responseStatus = BaseResponseStatus.SUCCESS;
  const result = await DeployInfosService.getInstanceList(req.user!.userId);

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

export default router;
