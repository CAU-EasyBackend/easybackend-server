import mongoose from 'mongoose';

function connectDatabase() {
  const mongodbURI: string | undefined = process.env.MONGODB_URI;

  if (!mongodbURI) {
    console.error('MONGODB_URI not defined in .env file');
    process.exit(1);
  }

  mongoose.connect(mongodbURI)
    .then(() => {
      console.log('MongoDB에 연결되었습니다.');
    })
    .catch((err: Error) => {
      console.error('MongoDB 연결 오류:', err);
    });
}

export default connectDatabase;
