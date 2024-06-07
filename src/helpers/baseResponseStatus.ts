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
  REPO_ALREADY_EXISTS: { status: 400, success: false, message: '이미 존재하는 레포지토리' },

  //프로젝트 API 명세
  UNKNOWN_PROJECT: { status: 404, success: false, message: '존재 하지 않은 프로젝트' },
  YAML_UPLOAD_ERROR: { status: 400, success: false, message: 'Yaml 파일 전송 에러' },

  //배포
  DEPLOYMENT_SUCCESS: { status: 200, success: true, message: '배포 성공' },
  ZIP_UPLOAD_ERROR: { status: 400, success: false, message: 'Zip 파일 업로드 에러' },
  UNKNOWN_INSTANCE: { status: 404, success: false, message: '존재 하지 않은 인스턴스' },
  UNKNOWN_SERVER: { status: 404, success: false, message: '존재 하지 않은 서버' },
  STATUS_INSTANCE: { status: 200, success: true, message: '인스턴스 상태반환 성공'},
  STATUS_SERVER: { status: 200, success: true, message: '서버 상태반환 성공'},
  TERMINATE_INSTANCE: { status: 200, success: true, message: '인스턴스 삭제 성공'},
  TERMINATE_SERVER: { status: 200, success: true, message: '서버 삭제 성공'},
  LOG_FETCH_ERROR: {status: 400, success:false, message:'로그 가져오기 실패'}
};

export { IBaseResponseStatus, BaseResponseStatus };
