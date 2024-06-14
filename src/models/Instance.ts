import { Document, Schema, model } from 'mongoose';

export interface IInstance extends Document {
  instanceName: string;
  instanceNumber: number;
  ownerUserId: string;
  status: 'creating' | 'running' | 'stopped' | 'terminated';
  IP: string;
}

const instanceSchema: Schema = new Schema({
  instanceName: { type: String, required: true, unique: true },
  instanceNumber: { type: Number, required: true },
  ownerUserId: { type: String, required: true, ref: 'User' },
  status: { type: String, required: true },
  IP: { type: String },
});

const Instance = model<IInstance>('Instance', instanceSchema);

export default Instance;
