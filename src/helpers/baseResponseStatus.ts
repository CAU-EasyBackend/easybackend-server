interface IBaseResponseStatus {
  status: number;
  success: boolean;
  message: string;
}

const BaseResponseStatus: any = {
  //디폴트
  SUCCESS: { status: 200, success: true, message: '성공' },
  ERROR: { status: 400, success: false, message: '실패' },
  NOT_FOUND: { status: 404, success: false, message: '404 Not Found' },
  SERVER_ERROR: { status: 500, success: false, message: 'Internal Server Error' },

  //git
  GIT_CLONE_ERROR: { status: 400, success: false, message: 'Git Clone Error' }
};

export { IBaseResponseStatus, BaseResponseStatus };
