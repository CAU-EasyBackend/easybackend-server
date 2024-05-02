import { Request, Response, Router } from 'express';
import wrapAsync from '../helpers/wrapFunction';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import response from '../helpers/response';

const router = Router();

/**
 *  test api
 *  get: /test
 */
router.get('/', wrapAsync(async (req: Request, res: Response) => {
  const responseStatus = BaseResponseStatus.SUCCESS;

  return res.status(responseStatus.status).json(response(responseStatus));
}));

export default router;
