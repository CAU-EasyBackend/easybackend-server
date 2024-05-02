import { Request, Response, Router } from 'express';
import upload from '../middlewares/multerMiddleware';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import response from '../helpers/response';
import wrapAsync from '../helpers/wrapFunction';
import DeploymentService from '../services/deploymentService';

const router = Router();

/**
 *  백엔드 배포 (zip 업로드) api
 *  post: /deployment/zip
 */
router.post('/zip', upload.single('zipFile'), (req: Request, res: Response) => {
  if(!req.file) {
    const responseStatus = BaseResponseStatus.ERROR;
    return res.status(responseStatus.status).json(response(responseStatus));
  }

  const responseStatus = BaseResponseStatus.SUCCESS;
  return res.status(responseStatus.status).json(response(responseStatus));
});

/**
 *  백엔드 배포 (github repository clone) api
 *  post: /deployment/github
 *  body: repositoryURL
 */
router.post('/github', wrapAsync(async (req: Request, res: Response) => {
  const { repositoryURL } = req.body;

  const gitCloneResponse = await DeploymentService.gitClone(repositoryURL);
  const responseStatus = BaseResponseStatus.SUCCESS;

  return res.status(responseStatus.status).json(response(responseStatus, gitCloneResponse));
}));

export default router;
