import { IUser } from './models/User';

declare global {
  namespace Express {
    interface User extends IUser {
      accessToken?: string;
    }
    interface Request {
      user?: User;
    }
  }
}
