import { Request, Response, Router } from 'express';
import upload from '../middlewares/multerMiddleware';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import response from '../helpers/response';
import wrapAsync from '../helpers/wrapFunction';
import DeploymentsService from '../services/deploymentsService';
import {isAuthenticated} from '../middlewares/passport-github';
import mongoose from 'mongoose';
const router = Router();

/**
 *  백엔드 배포 (zip 업로드) api
 *  post: /api/deployments/new/zip
 */
router.post('/new/zip', isAuthenticated, upload.single('zipFile'), wrapAsync(async (req: Request, res: Response) => {
  if(!req.file) {
    const responseStatus = BaseResponseStatus.ZIP_UPLOAD_ERROR;
    return res.status(responseStatus.status).json(response(responseStatus));
  }
  const userId = req.user!.userId;
  const frameworkType: string = req.body.frameworkType;
  const zipPath: string = req.file.path;

  const responseStatus = BaseResponseStatus.DEPLOYMENT_SUCCESS;
  const result = await DeploymentsService.deployNewServer(userId, zipPath, frameworkType);

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

/**
 *  백엔드 업데이트 (zip 업로드) api
 *  post: /api/deployments/:instanceId/update/zip
 */
router.patch('/:instanceId/update/zip', isAuthenticated, upload.single('zipFile'), wrapAsync(async (req: Request, res: Response) => {
  
  if(!req.file) {
    const responseStatus = BaseResponseStatus.ZIP_UPLOAD_ERROR;
    return res.status(responseStatus.status).json(response(responseStatus));
  }
  const userId = req.user!.userId;
  const instanceId: string = req.params.instanceId;
  const frameworkType: string = req.body.frameworkType;
  const zipPath: string = req.file.path;

  const responseStatus = BaseResponseStatus.DEPLOYMENT_SUCCESS;
  const result = await DeploymentsService.updateServer(userId, instanceId, zipPath, frameworkType);

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));




/**
 *  백엔드 배포 (github repository clone) api
 *  post: /api/deployments/new/github
 *  body: repositoryURL
 */
router.post('/new/github', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { repositoryURL, frameworkType } = req.body;

  const responseStatus = BaseResponseStatus.SUCCESS;
  const result = await DeploymentsService.gitCloneDeploy(userId, null, repositoryURL, frameworkType);

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

/**
 *  백엔드 업데이트 (github repository clone) api
 *  post: /api/deployments/:instanceId/update/github
 *  params: instanceID
 *  body: repositoryURL
 */
router.patch('/:instanceId/update/github', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const instanceId: string = req.params.instanceId
  const { repositoryURL, frameworkType } = req.body;

  const responseStatus = BaseResponseStatus.DEPLOYMENT_SUCCESS;
  const result = await DeploymentsService.gitCloneDeploy(userId, instanceId, repositoryURL, frameworkType);

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

export default router;
