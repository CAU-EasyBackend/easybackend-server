import { Document, Types, Schema, model } from 'mongoose';

export interface IServer extends Document {
  instanceId: Types.ObjectId;
  serverName: string;
  runningVersion: number;
  latestVersion: number;
  port: number;
}

const serverSchema: Schema = new Schema({
  instanceId: { type: Schema.Types.ObjectId, required: true, ref: 'Instance' },
  serverName: { type: String, required: true },
  runningVersion: { type: Number, required: true },
  latestVersion: { type: Number, required: true },
  port: { type: Number },
});

const Server = model<IServer>('Server', serverSchema);

export default Server;
