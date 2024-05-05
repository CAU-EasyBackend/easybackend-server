import passport from 'passport';
import { Strategy as GithubStrategy, Profile } from 'passport-github2';
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
  }, async (accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user?: any) => void) => {
    const githubID = profile.id;
    done(null, { githubID });
  }));

  passport.serializeUser((user, done) => {
    done(null, user.githubID);
  });

  passport.deserializeUser(async (id, done) => {
    done(null, { id });
  });
}

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
