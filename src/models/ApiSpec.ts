import { Document, Schema, model } from 'mongoose';

export interface IApiSpec extends Document {
  name: string;
  ownerUserId: string;
}
