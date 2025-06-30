// src/user-linkedin-details/schemas/user-linkedin-detail.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ProfileExtractionStatus } from '../utilities/enums';

export type ExtractedUrlsDocument = ExtractedProfileUrls & Document;

/**
 * Schema representing extracted  URLs from user profiles.
 *
 * @property {user_id} -- is optional as it may not be available during initial extraction.
 * @property {user_url} -- is the  URL that was extracted from the user_url.
 * @property {extracted_url} -- is the  URL that was extracted from the user_url.
 * @property {status} -- is the current status of the  profile extraction process.
 */
@Schema({ timestamps: true })
export class ExtractedProfileUrls {
  @Prop({ type: MongooseSchema.Types.ObjectId })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  user_id: string;

  @Prop({ required: false })
  user_url: string;

  @Prop({ required: true })
  extracted_url: string;

  @Prop({ required: true })
  platform: string;

  @Prop({ required: false })
  notes: string;

  @Prop({
    type: String,
    enum: ProfileExtractionStatus,
    default: ProfileExtractionStatus.PENDING,
  })
  status: ProfileExtractionStatus;
}

export const ExtractedProfileUrlsSchema =
  SchemaFactory.createForClass(ExtractedProfileUrls);
ExtractedProfileUrlsSchema.index(
  { user_url: 1, extracted_url: 1 },
  { unique: true, name: 'profile_urls_extracted_url_unique' },
);
