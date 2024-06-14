import { IBaseResponseStatus } from './baseResponseStatus';

class HttpError extends Error {
  responseStatus: IBaseResponseStatus

  constructor(responseStatus: IBaseResponseStatus) {
    super(responseStatus.message);
    this.responseStatus = responseStatus;
  }
}

export default HttpError;
