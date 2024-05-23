import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import methodOverride from 'method-override';
import apiRouter from '../routers/apiRouter';
import errorHandler from '../helpers/errorHandler';
import HttpError from '../helpers/httpError';
import {BaseResponseStatus} from '../helpers/baseResponseStatus';
import passport from 'passport';
import {configurePassport, sessionMiddleware} from '../middlewares/passport-github';

function configureExpressApp() {
  const app = express();

  // Middleware
  app.use(sessionMiddleware());
  app.use(passport.initialize());
  app.use(passport.session());

  configurePassport();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const frontEndURL: string | undefined = process.env.FRONTEND_URL;
  if(!frontEndURL) {
    console.error('Error loading .env file');
    process.exit(1);
  }
  app.use(cors({
    origin: frontEndURL,
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  }));
  app.use(methodOverride());

  // Router
  app.use('/api', apiRouter);

  // Error handler
  app.use((req: Request, res: Response, next: NextFunction) => {
    throw new HttpError(BaseResponseStatus.NOT_FOUND);
  });
  app.use(errorHandler);

  return app;
}

export default configureExpressApp;
