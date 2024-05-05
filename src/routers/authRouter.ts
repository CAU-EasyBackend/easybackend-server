import {Request, Response, Router} from 'express';
import wrapAsync from '../helpers/wrapFunction';
import AuthService from '../services/authService';
import passport from 'passport';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import response from '../helpers/response';

const router = Router();

/**
 * GITHUB login api
 * get: /auth/login
 */
router.get('/login', passport.authenticate('github'));

/**
 * GITHUB callback api
 * get: /auth/callback
 */
router.get('/callback', passport.authenticate('github', { failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    const responseStatus = BaseResponseStatus.SUCCESS;
    return res.status(responseStatus.status).json(response(responseStatus));
  }
);

/**
 * GITHUB login api
 * get: /auth/login 임시
 */
router.get('/login2', wrapAsync(async (req: Request, res: Response) => {
  const githubLoginURL = await AuthService.getGithubLoginURL();

  return res.redirect(githubLoginURL);
}));

/**
 * GITHUB callback api
 * get: /auth/callback 임시
 */
router.get('/callback2', wrapAsync(async (req: Request, res: Response) => {
  const { code } = req.query;

  const user = await AuthService.getGithubUserData(code as string);
}));

export default router;
