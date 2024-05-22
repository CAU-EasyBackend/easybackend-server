import { Document, Schema, model } from 'mongoose';

export interface IApiSpec extends Document {
  projectName: string;
  ownerUserId: string;
  yamlContent: string;
}

const apiSpecSchema: Schema = new Schema({
  projectName: { type: String, required: true },
  ownerUserId: { type: String, required: true, ref: 'User' },
  yamlContent: { type: String, required: true },
});

apiSpecSchema.index({ projectName: 1, ownerUserId: 1 }, { unique: true });

const ApiSpec = model<IApiSpec>('ApiSpec', apiSpecSchema);

export default ApiSpec;
