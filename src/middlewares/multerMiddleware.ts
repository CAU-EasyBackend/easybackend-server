import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadFolder = path.resolve(__dirname, '..', '..', 'uploads');
if(!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

export default upload;
