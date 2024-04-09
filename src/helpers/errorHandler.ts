import { Request, Response, NextFunction } from 'express';
import response from './response';
import HttpError from './httpError';
import {BaseResponseStatus} from './baseResponseStatus';
import {GitError} from 'simple-git';

function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  console.error(error);

  if(error instanceof HttpError) {
    const status = error.responseStatus.status;
    return res.status(status).json(response(error.responseStatus));
  } else if(error instanceof GitError) {
    const status = BaseResponseStatus.GIT_CLONE_ERROR.status;
    return res.status(status).json(response(BaseResponseStatus.GIT_CLONE_ERROR));
  } else {
    const status = BaseResponseStatus.SERVER_ERROR.status
    return res.status(status).json(response(BaseResponseStatus.SERVER_ERROR));
  }
}

export default errorHandler;
