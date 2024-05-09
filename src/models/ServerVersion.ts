import { Document, Types, Schema, model } from 'mongoose';

export interface IServerVersion extends Document {
  serverId: Types.ObjectId;
  version: number;
  port: number;
  description: string;
}

const serverVersionSchema: Schema = new Schema({
  serverId: { type: Schema.Types.ObjectId, required: true, ref: 'Server' },
  version: { type: Number, required: true },
  port: { type: Number },
  description: { type: String },
});

const ServerVersion = model<IServerVersion>('ServerVersion', serverVersionSchema);

export default ServerVersion;
