import { Request, Response, Router } from 'express';
import wrapAsync from '../helpers/wrapFunction';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import response from '../helpers/response';
import {isAuthenticated} from '../middlewares/passport-github';

const router = Router();

/**
 *  test api
 *  get: /test
 */
router.get('/', wrapAsync(async (req: Request, res: Response) => {
  const responseStatus = BaseResponseStatus.SUCCESS;

  return res.status(responseStatus.status).json(response(responseStatus));
}));

/**
 *  test auth api
 *  get: /test/auth
 */
router.get('/auth', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const responseStatus = BaseResponseStatus.SUCCESS;

  return res.status(responseStatus.status).json(response(responseStatus));
}));

/**
 *  test auth api
 *  get: /test/auth/userInfo
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

export default router;
