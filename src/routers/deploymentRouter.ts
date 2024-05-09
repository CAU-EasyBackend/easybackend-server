import { Request, Response, Router } from 'express';
import upload from '../middlewares/multerMiddleware';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import response from '../helpers/response';
import wrapAsync from '../helpers/wrapFunction';
import DeploymentService from '../services/deploymentService';
import {isAuthenticated} from '../middlewares/passport-github';

const router = Router();

/**
 *  백엔드 배포 (zip 업로드) api
 *  post: /deployment/new/zip
 */
router.post('/new/zip', isAuthenticated, upload.single('zipFile'), wrapAsync(async (req: Request, res: Response) => {
  if(!req.file) {
    const responseStatus = BaseResponseStatus.ZIP_UPLOAD_ERROR;
    return res.status(responseStatus.status).json(response(responseStatus));
  }
  const zipPath: string = req.file.path;

  const responseStatus = BaseResponseStatus.DEPLOYMENT_SUCCESS;
  const result = await DeploymentService.deployNewServer(req.user!.userId, zipPath);

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

/**
 *  백엔드 업데이트 (zip 업로드) api
 *  post: /deployment/:instanceId/update/zip
 */
router.patch('/:instanceId/update/zip', isAuthenticated, upload.single('zipFile'), wrapAsync(async (req: Request, res: Response) => {
  if(!req.file) {
    const responseStatus = BaseResponseStatus.ZIP_UPLOAD_ERROR;
    return res.status(responseStatus.status).json(response(responseStatus));
  }
  const instanceId: string = req.params.instanceId;
  const zipPath: string = req.file.path;

  const responseStatus = BaseResponseStatus.DEPLOYMENT_SUCCESS;
  const result = await DeploymentService.updateServer(req.user!.userId, instanceId, zipPath);

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

/**
 *  백엔드 배포 (github repository clone) api
 *  post: /deployment/new/github
 *  body: repositoryURL
 */
router.post('/new/github', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const { repositoryURL } = req.body;

  const responseStatus = BaseResponseStatus.SUCCESS;
  const result = await DeploymentService.gitCloneDeploy(req.user!.userId, null, repositoryURL);

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

/**
 *  백엔드 업데이트 (github repository clone) api
 *  post: /deployment/:instanceId/update/github
 *  params: instanceID
 *  body: repositoryURL
 */
router.patch('/:instanceId/update/zip', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const instanceId: string = req.params.instanceId
  const { repositoryURL } = req.body;

  const responseStatus = BaseResponseStatus.DEPLOYMENT_SUCCESS;
  const result = await DeploymentService.gitCloneDeploy(req.user!.userId, instanceId, repositoryURL);

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

export default router;
