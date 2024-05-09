import { Document, Schema, model } from 'mongoose';

export interface IServerVersion extends Document {
  serverId: string;
  version: number;
  port: number;
  description: string;
}

const serverVersionSchema: Schema = new Schema({
  serverId: { type: String, required: true },
  version: { type: Number, required: true },
  port: { type: Number, required: true },
  description: { type: String },
});

const ServerVersion = model<IServerVersion>('ServerVersion', serverVersionSchema);

export default ServerVersion;
