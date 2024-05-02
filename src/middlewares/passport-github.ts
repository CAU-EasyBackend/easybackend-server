import passport from 'passport';
import { Strategy as GithubStrategy } from 'passport-github2';
import session from 'express-session';
import { Request, Response, NextFunction } from 'express';

export function sessionMiddleware() {
  const session_secret : string | undefined = process.env.SESSION_SECRET;
  if(!session_secret) {
    console.error('Error loading .env file');
    process.exit(1);
  }

  return session({
    secret: session_secret,
    resave: false,
    saveUninitialized: false
  });
}

export function configurePassport() {
  const serverURL: string | undefined = process.env.SERVER_URL;
  const githubClientID: string | undefined = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret: string | undefined = process.env.GITHUB_CLIENT_SECRET;
  if(!serverURL || !githubClientID || !githubClientSecret) {
    console.error('Error loading .env file');
    process.exit(1);
  }
  const githubCallbackURL = `${serverURL}/auth/callback`;

  passport.use(new GithubStrategy({
    clientID: githubClientID,
    clientSecret: githubClientSecret,
    callbackURL: githubCallbackURL,
  }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
    console.log(profile);
  }));

  /*
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });*/
}

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
