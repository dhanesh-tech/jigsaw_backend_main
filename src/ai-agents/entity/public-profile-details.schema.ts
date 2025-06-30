// src/user-linkedin-details/schemas/user-linkedin-detail.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PublicProfileDetailsDocument = PublicProfileDetails & Document;

@Schema({ timestamps: true })
export class PublicProfileDetails {
  @Prop({ required: true, default: 'UserProfile' })
  object: string;

  @Prop({ required: true, default: 'LINKEDIN' })
  provider: string;

  @Prop({ required: false })
  provider_id: string;

  @Prop({ required: true })
  public_identifier: string;

  @Prop({ required: false })
  first_name: string;

  @Prop({ required: false })
  last_name: string;
}

export const PublicProfileDetailsSchema =
  SchemaFactory.createForClass(PublicProfileDetails);
