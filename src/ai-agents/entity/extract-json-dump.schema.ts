import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ExtractJsonDumpDocument = ExtractJsonDump & Document;

/**
 * Schema representing a JSON dump of extracted profile data.
 *
 * @property {JSON} data - The JSON object containing the extracted profile data.
 * @property {string} platform - The platform of the profile data.
 */
@Schema({ timestamps: true })
export class ExtractJsonDump {
  @Prop({ type: MongooseSchema.Types.ObjectId })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  data: JSON;

  @Prop({ required: true })
  platform: string;
}

export const ExtractJsonDumpSchema =
  SchemaFactory.createForClass(ExtractJsonDump);
