import { Request, Response, Router } from 'express';
import wrapAsync from '../helpers/wrapFunction';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import AuthService from '../services/authService';
import response from '../helpers/response';
import passport from 'passport';

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
  function(req, res) {
    res.redirect('/');
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
