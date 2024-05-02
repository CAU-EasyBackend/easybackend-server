import { Request, Response, Router } from 'express';
import wrapAsync from '../helpers/wrapFunction';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import response from '../helpers/response';
import TestService from '../services/testService';
import upload from '../middlewares/multerMiddleware';

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
 *  zip 압축 소스코드 업로드 test api
 *  post: /test/zipUpload
 */
router.post('/zipUpload', upload.single('zipFile'), wrapAsync(async (req: Request, res: Response) => {
  if(!req.file) {
    const responseStatus = BaseResponseStatus.ERROR;
    return res.status(responseStatus.status).json(response(responseStatus));
  }

  const responseStatus = BaseResponseStatus.SUCCESS;
  return res.status(responseStatus.status).json(response(responseStatus));
}));

/**
 *  git clone test api
 *  post: /test/clone
 *  body: repositoryURL
 */
router.post('/clone', wrapAsync(async (req: Request, res: Response) => {
  const { repositoryURL } = req.body;

  const gitCloneResponse = await TestService.gitClone(repositoryURL);
  const responseStatus = BaseResponseStatus.SUCCESS;

  return res.status(responseStatus.status).json(response(responseStatus, gitCloneResponse));
}));

export default router;
