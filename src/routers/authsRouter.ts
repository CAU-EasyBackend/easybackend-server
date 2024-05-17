import {Request, Response, Router} from 'express';
import passport from 'passport';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import response from '../helpers/response';

const router = Router();

/**
 * GITHUB login api
 * get: /api/auths/login
 */
router.get('/login', passport.authenticate('github'));

/**
 * GITHUB callback api
 * get: /api/auths/callback
 */
router.get('/callback', passport.authenticate('github', { failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    const frontEndURL: string | undefined = process.env.FRONTEND_URL;
    if(!frontEndURL) {
      const responseStatus = BaseResponseStatus.ERROR;
      return res.status(responseStatus.status).json(response(responseStatus));
    }
    res.redirect(frontEndURL);
  }
);

export default router;
