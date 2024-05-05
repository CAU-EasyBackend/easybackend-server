import configureEnvironment from './config/environment';
import configureExpressApp from './config/expressServer';
import connectDatabase from './config/database';

configureEnvironment();
connectDatabase();

const PORT = process.env.PORT || 80;
const server = configureExpressApp();
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
