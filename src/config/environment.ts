import dotenv from 'dotenv';

function configureEnvironment() {
const environment: string | undefined = process.env.NODE_ENV;

  if (!environment) {
    console.error('Error loading .env file');
    process.exit(1);
  }

  if (environment === 'production') {
    dotenv.config({ path: 'src/config/private/.env.production' });
    console.log('production 환경 설정 완료');
  } else if (environment === 'development') {
    dotenv.config({ path: 'src/config/private/.env.development' });
    console.log('development 환경 설정 완료');
  }
}

export default configureEnvironment;
