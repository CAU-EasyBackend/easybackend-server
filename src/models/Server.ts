import { Document, Schema, model } from 'mongoose';

export interface IServer extends Document {
  instanceId: string;
  serverName: string;
  runningVersion: number;
  latestVersion: number;
  port: number;
}

const serverSchema: Schema = new Schema({
  instanceId: { type: String, required: true },
  serverName: { type: String, required: true },
  runningVersion: { type: Number, required: true },
  latestVersion: { type: Number, required: true },
  port: { type: Number, required: true },
});

const Server = model<IServer>('Server', serverSchema);

export default Server;
