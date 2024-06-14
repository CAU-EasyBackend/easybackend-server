import { Request, Response, Router } from 'express';
import wrapAsync from '../helpers/wrapFunction';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import response from '../helpers/response';
import {isAuthenticated} from '../middlewares/passport-github';
import CodeGensService from '../services/codeGensService';

const router = Router();

/**
 *  test api
 *  get: /api/tests
 */
router.get('/', wrapAsync(async (req: Request, res: Response) => {
  const responseStatus = BaseResponseStatus.SUCCESS;

  return res.status(responseStatus.status).json(response(responseStatus));
}));

/**
 *  test auth api
 *  get: /api/tests/auth
 */
router.get('/auth', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const responseStatus = BaseResponseStatus.SUCCESS;

  return res.status(responseStatus.status).json(response(responseStatus));
}));

/**
 *  test auth api
 *  get: /api/tests/auth/userInfo
 */
router.get('/auth/userInfo', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if(!user) {
    const responseStatus = BaseResponseStatus.ERROR;
    return res.status(responseStatus.status).json(response(responseStatus));
  } else {
    const userInfo = {
      userId: user.userId,
      username: user.username,
      accessToken: user.accessToken,
    }
    const responseStatus = BaseResponseStatus.SUCCESS;
    return res.status(responseStatus.status).json(response(responseStatus, userInfo));
  }
}));

/**
 *  api 명세 기반 코드 생성 test api
 *  get: /api/tests/codeGens
 */
router.get('/codeGens', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const projectId = req.body.projectId;
  const frameworkType: string = req.body.frameworkType;

  const responseStatus = BaseResponseStatus.SUCCESS;
  await CodeGensService.generateCode(userId, projectId, frameworkType);

  return res.status(responseStatus.status).json(response(responseStatus));
}));

export default router;
