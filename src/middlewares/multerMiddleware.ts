import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadFolder = path.resolve(__dirname, '..', '..', 'temps', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user!.userId;

    if(file.fieldname === 'zipFile') {
      const sourceCodeFolder = path.join(uploadFolder, 'sourceCodes', userId);
      if(!fs.existsSync(sourceCodeFolder)) {
        fs.mkdirSync(sourceCodeFolder, { recursive: true });
      }

      cb(null, sourceCodeFolder);
    } else if(file.fieldname === 'yamlFile') {
      const apiSpecFolder = path.join(uploadFolder, 'apiSpecs', userId);
      if(!fs.existsSync(apiSpecFolder)) {
        fs.mkdirSync(apiSpecFolder, { recursive: true });
      }

      cb(null, apiSpecFolder);
    } else {
      const userUploadFolder = path.join(uploadFolder, userId);
      if(!fs.existsSync(userUploadFolder)) {
        fs.mkdirSync(userUploadFolder, { recursive: true });
      }

      cb(null, userUploadFolder);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

export default upload;
