import mongoose from 'mongoose';

function connectDatabase() {
  const mongodbURL: string | undefined = process.env.MONGODB_URL;

  if (!mongodbURL) {
    console.error('MONGODB_URL not defined in .env file');
    process.exit(1);
  }

  mongoose.connect(mongodbURL)
    .then(() => {
      console.log('MongoDB에 연결되었습니다.');
    })
    .catch((err: Error) => {
      console.error('MongoDB 연결 오류:', err);
    });
}

export default connectDatabase;
