import { Request, Response, Router } from 'express';
import upload from '../middlewares/multerMiddleware';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import response from '../helpers/response';
import wrapAsync from '../helpers/wrapFunction';
import DeploymentsService from '../services/deploymentsService';
import {isAuthenticated} from '../middlewares/passport-github';
import mongoose from 'mongoose';
import { getLogsForInstance } from '../services/logService';
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


//이하 중간데모 이후 작성

/**
 * 인스턴스 상태반환
 * get: /api/deployments/:instanceId/status/instance
 * params: instanceID
 */
router.get('/:instanceId/status/instance', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const instanceId: string = req.params.instanceId
  

  const responseStatus = BaseResponseStatus.DEPLOYMENT_SUCCESS;
  const result = await DeploymentsService.checkInstanceAlive(userId,instanceId)

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));


/**
 * 서버 상태반환
 * get: /api/deployments/:instanceId/status/server
 * params: instanceID
 */
router.get('/:instanceId/status/server', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const instanceId: string = req.params.instanceId
  

  const responseStatus = BaseResponseStatus.DEPLOYMENT_SUCCESS;
  const result = await DeploymentsService.checkServerAlive(userId,instanceId)

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

/**
 * 서버 끄기
 * post: /api/deployments/:instanceId/terminate/server
 * params: instanceID
 */
router.post('/:instanceId/terminate/server', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const instanceId: string = req.params.instanceId
  

  const responseStatus = BaseResponseStatus.DEPLOYMENT_SUCCESS;
  const result = await DeploymentsService.shutdownServer(userId,instanceId)

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

/**
 * 인스턴스 삭제
 * post: /api/deployments/:instanceId/terminate/instance
 * params: instanceID
 */
router.post('/:instanceId/terminate/instance', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const instanceId: string = req.params.instanceId
  

  const responseStatus = BaseResponseStatus.DEPLOYMENT_SUCCESS;
  const result = await DeploymentsService.deleteInstance(userId,instanceId)

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

/**
 * 특정 인스턴스의 로그 반환
 * get: /api/deployments/:instanceId/logs
 * params: instanceID
 */
router.get('/:instanceId/logs', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {

  const instanceId: string = req.params.instanceId;

 
  try {
    const logGroupName = `/aws/instance/${instanceId}-log-group`;
    const logs = await getLogsForInstance(logGroupName);
    const responseStatus = BaseResponseStatus.SUCCESS;
    return res.status(responseStatus.status).json(response(responseStatus, logs));
  } catch (error) {
    const responseStatus = BaseResponseStatus.LOG_FETCH_ERROR; // 적절한 오류 상태 설정
    return res.status(responseStatus.status).json(response(responseStatus));
  }
}));











export default router;
