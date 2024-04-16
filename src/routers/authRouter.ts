import { Request, Response, Router } from 'express';
import wrapAsync from '../helpers/wrapFunction';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import AuthService from '../services/authService';
import response from '../helpers/response';

const router = Router();

/**
 * GITHUB login api
 * get: /auth/login
 */
router.get('/login', wrapAsync(async (req: Request, res: Response) => {
  const githubLoginURL = await AuthService.getGithubLoginURL();

  return res.redirect(githubLoginURL);
}));

/**
 * GITHUB callback api
 * get: /auth/callback
 */
router.get('/callback', wrapAsync(async (req: Request, res: Response) => {
  const { code } = req.query;

  const user = await AuthService.getGithubUserData(code as string);
}));

export default router;
