import express from 'express';
import cors from 'cors';
import methodOverride from 'method-override';

class ExpressServer {
  private app;
  private port;
  constructor() {
    this.app = express();
    this.port = 8080;
    this.setupMiddleware();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(methodOverride());
  }

  launch() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

export default ExpressServer;
