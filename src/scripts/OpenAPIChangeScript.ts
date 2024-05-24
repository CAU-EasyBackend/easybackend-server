export function OpenAPIChangeScript(version: number) { //아래 코드는 기본적으로 자동 생성되는 expressServer.js에서 중간에 this.app.get에서 validator 안거치고 바로 가는거 이용해서 야매로 추가한 코드임
  return `const http = require('http'); 
  const fs = require('fs');
  const path = require('path');
  const swaggerUI = require('swagger-ui-express');
  const jsYaml = require('js-yaml');
  const express = require('express');
  const cors = require('cors');
  const cookieParser = require('cookie-parser');
  const bodyParser = require('body-parser');
  const { OpenApiValidator } = require('express-openapi-validator');
  const logger = require('./logger');
  const config = require('./config');
  
  class ExpressServer {
    constructor(port, openApiYaml) {
      this.port = port;
      this.app = express();
      this.openApiPath = openApiYaml;
      try {
        this.schema = jsYaml.safeLoad(fs.readFileSync(openApiYaml));
      } catch (e) {
        logger.error('failed to start Express Server', e.message);
      }
      this.setupMiddleware();
    }
  
    setupMiddleware() {
      this.app.use(cors());
      this.app.use(bodyParser.json({ limit: '14MB' }));
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: false }));
      this.app.use(cookieParser());
  
      this.app.get('/cau', (req, res) => res.send(\`서버가 열렸습니다. VER ${version}\`)); //버전 숫자 1은 이 코드 외부에서 들어옴
    }
  
    launch() {
      new OpenApiValidator({
        apiSpec: this.openApiPath,
        operationHandlers: path.join(__dirname),
        fileUploader: { dest: config.FILE_UPLOAD_PATH },
      }).install(this.app)
        .catch(e => console.log(e))
        .then(() => {
          this.app.use((err, req, res, next) => {
            res.status(err.status || 500).json({
              message: err.message || err,
              errors: err.errors || '',
            });
          });
  
          http.createServer(this.app).listen(this.port);
          console.log(\`Listening on port \${this.port}\`);
        });
    }
  
    async close() {
      if (this.server !== undefined) {
        await this.server.close();
        console.log(\`Server on port \${this.port} shut down\`);
      }
    }
  }
  
  module.exports = ExpressServer;`;
}
