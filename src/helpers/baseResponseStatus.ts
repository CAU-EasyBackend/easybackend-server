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
  ENVIRONMENT_VARIABLE_ERROR: { status: 500, success: false, message: '환경변수 에러' },

  //유저 권한
  FORBIDDEN_USER: { status: 403, success: false, message: '권한 없음' },

  //git
  GIT_CLONE_ERROR: { status: 400, success: false, message: 'Git Clone Error' },

  //프로젝트
  UNKNOWN_PROJECT: { status: 404, success: false, message: '존재 하지 않은 프로젝트' },

  //배포
  DEPLOYMENT_SUCCESS: { status: 200, success: true, message: '배포 성공' },
  ZIP_UPLOAD_ERROR: { status: 400, success: false, message: 'Zip 파일 업로드 에러' },
  UNKNOWN_INSTANCE: { status: 404, success: false, message: '존재 하지 않은 인스턴스' },
  UNKNOWN_SERVER: { status: 404, success: false, message: '존재 하지 않은 서버' },
};

export { IBaseResponseStatus, BaseResponseStatus };
