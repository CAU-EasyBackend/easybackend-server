import passport from 'passport';
import { Strategy as GithubStrategy, Profile } from 'passport-github2';
import session from 'express-session';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import createMemoryStore from 'memorystore';

const MemoryStore = createMemoryStore(session);
const sessionExpireTime = 3600000;

export function sessionMiddleware() {
  const session_secret : string | undefined = process.env.SESSION_SECRET;
  if(!session_secret) {
    console.error('Error loading .env file');
    process.exit(1);
  }

  return session({
    secret: session_secret,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: sessionExpireTime,
    }),
    cookie: {
      maxAge: sessionExpireTime,
    },
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
  const githubCallbackURL: string = `${serverURL}/auth/callback`;

  passport.use(new GithubStrategy({
    clientID: githubClientID,
    clientSecret: githubClientSecret,
    callbackURL: githubCallbackURL,
    scope: ['repo'],
  }, async (accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user?: Express.User) => void) => {
    let user: Express.User | null = await User.findOne({githubID: profile.id});
    if(!user) {
      user = await User.create({githubID: profile.id, username: profile.username});
    }
    user.accessToken = accessToken;

    done(null, user);
  }));

  passport.serializeUser((user: Express.User , done) => {
    done(null, {
      _id: user._id,
      githubID: user.githubID,
      username: user.username,
      accessToken: user.accessToken,
    });
  });

  passport.deserializeUser(async (user: Express.User, done) => {
    done(null, user);
  });
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login');
}
