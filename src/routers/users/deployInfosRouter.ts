import {Request, Response, Router} from 'express';
import {isAuthenticated} from '../../middlewares/passport-github';
import wrapAsync from '../../helpers/wrapFunction';
import {BaseResponseStatus} from '../../helpers/baseResponseStatus';
import DeployInfosService from '../../services/users/deployInfosService';
import response from '../../helpers/response';

const router = Router({ mergeParams: true });

/**
 * 서버 배포 정보 조회 api
 * get: /users/:userId/deployInfos/statusAll
 * params: userId
 */
router.get('/statusAll', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId: string = req.params.userId;
  if(req.user!.userId !== userId) {
    const responseStatus = BaseResponseStatus.FORBIDDEN_USER;
    return res.status(responseStatus.status).json(response(responseStatus));
  }

  const responseStatus = BaseResponseStatus.SUCCESS;
  const result = await DeployInfosService.getStatusAll(userId);

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

export default router;
