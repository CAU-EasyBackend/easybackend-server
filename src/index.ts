import ExpressServer from './config/expressServer';

const expressServer = new ExpressServer();
expressServer.launch();

/*
const launchServer = async()=> {
  try {
    const expressServer = new ExpressServer();
    expressServer.launch();
  } catch(error) {

  }
};
*/