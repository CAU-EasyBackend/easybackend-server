import {Request, Response, Router} from 'express';
import {isAuthenticated} from '../middlewares/passport-github';
import wrapAsync from '../helpers/wrapFunction';
import CodeGensService from '../services/codeGensService';

const router = Router();

/**
 * api 명세 기반 코드 생성 api (zip 다운)
 * get: /api/codeGens/zip
 */

router.get('/zip', isAuthenticated, wrapAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const projectId = req.body.projectId;
  const frameworkType: string = req.body.frameworkType;

  const result = await CodeGensService.zipGeneratedCode(userId, projectId, frameworkType);
  res.download(result.zipPath, `${result.projectName}.zip`);
}));

export default router;
