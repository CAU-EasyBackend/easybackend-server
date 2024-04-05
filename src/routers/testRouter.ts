import { Request, Response, Router } from 'express';
import wrapAsync from '../helpers/wrapFunction';

const router = Router();

/**
 *  test api
 *  get: /test
 */
router.get('/', wrapAsync(async (req: Request, res: Response) => {
  return res.status(200).json({message: '성공'});
}));

/**
 *  zip 압축 소스코드 업로드 test api
 *  post: /test/zipUpload
 */
router.post('/zipUpload', wrapAsync(async (req: Request, res: Response) => {

}));

export default router;
