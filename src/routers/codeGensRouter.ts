import {Request, Response, Router} from 'express';
import {isAuthenticated} from '../middlewares/passport-github';
import wrapAsync from '../helpers/wrapFunction';
import CodeGensService from '../services/codeGensService';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import response from '../helpers/response';

const router = Router();

/**
 * api 명세 기반 코드 생성 api (zip 다운)
 * get: /api/codeGens/zip
 */
router.post('/zip', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const projectId = req.body.projectId;
  const frameworkType: string = req.body.frameworkType;

  const result = await CodeGensService.zipGeneratedCode(userId, projectId, frameworkType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.projectName}.zip"`);
  res.download(result.zipPath);
}));

/**
 * api 명세 기반 코드 생성 api (github 업로드)
 * get: /api/codeGens/github
 */
router.post('/github', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const accessToken = req.user!.accessToken as string;
  const projectId = req.body.projectId;
  const frameworkType: string = req.body.frameworkType;

  const responseStatus = BaseResponseStatus.SUCCESS;
  const result = await CodeGensService.uploadGithubGeneratedCode(userId, accessToken, projectId, frameworkType);

  return res.status(responseStatus.status).json(response(responseStatus, result));
}));

export default router;
