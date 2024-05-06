import passport from 'passport';
import { Strategy as GithubStrategy, Profile } from 'passport-github2';
import session from 'express-session';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import axios from 'axios';

const serverURL: string | undefined = process.env.SERVER_URL;
const githubClientID: string | undefined = process.env.GITHUB_CLIENT_ID;
const githubClientSecret: string | undefined = process.env.GITHUB_CLIENT_SECRET;
if(!serverURL || !githubClientID || !githubClientSecret) {
  console.error('Error loading .env file');
  process.exit(1);
}
const githubCallbackURL: string = `${serverURL}/auth/callback`;

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
  passport.use(new GithubStrategy({
    clientID: githubClientID!,
    clientSecret: githubClientSecret!,
    callbackURL: githubCallbackURL,
    scope: ['repo'],
  }, async (accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user?: Express.User) => void) => {
    let user: Express.User | null = await User.findOne({githubID: profile.id});
    if(!user) {
      user = await User.create({githubID: profile.id, username: profile.username, refreshToken});
    } else {
      user.refreshToken = refreshToken;
      await user.save();
    }

    done(null, user);
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login');
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
    client_id: githubClientID,
    client_secret: githubClientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  }, {
    headers: {
      Accept: 'application/json',
    }
  });

  return tokenResponse.data.access_token;
}
