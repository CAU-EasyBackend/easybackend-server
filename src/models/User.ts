import { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  username: string;
}

const userSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
});

const User = model<IUser>('User', userSchema);

export default User;
