import { IBaseResponseStatus } from './baseResponseStatus';

interface ResponseFormat {
  success: boolean;
  message: string;
  result?: any;
}

const response = (responseStatus: IBaseResponseStatus, result?: any): ResponseFormat => {
  return {
    success: responseStatus.success,
    message: responseStatus.message,
    result: result
  };
};

export default response;
