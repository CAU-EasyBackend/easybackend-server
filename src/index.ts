import configureEnvironment from './config/environment';
import configureExpressApp from './config/expressServer';
import connectDatabase from './config/database';

configureEnvironment();
connectDatabase();

const server_port = process.env.SERVER_PORT || 80;
const server = configureExpressApp();
server.listen(server_port, () => {
  console.log(`Server is running on port ${server_port}`);
});
