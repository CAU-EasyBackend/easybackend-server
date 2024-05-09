import { Document, Schema, model } from 'mongoose';

export interface IInstance extends Document {
  instanceName: string;
  ownerUserId: string;
  status: string;
  IP: string;
}

const instanceSchema: Schema = new Schema({
  instanceName: { type: String, required: true, unique: true },
  ownerUserId: { type: String, required: true },
  status: { type: String, required: true },
  IP: { type: String, required: true },
});

const Instance = model<IInstance>('Instance', instanceSchema);

export default Instance;
