import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProfileDetailsDocument = ProfileDetails & Document;

/**
 * Schema representing detailed information of a user profile.
 *
 * @property {MongooseSchema.Types.ObjectId} _id - The unique identifier for the row.
 * @property {string} name - The full name of the user.
 * @property {string} title - The professional title of the user.
 * @property {string} company - The company where the user is currently employed.
 * @property {string} current_position - The current position of the user.
 * @property {string} top_skills - The top skills of the user.
 * @property {string} location - The location of the user.
 * @property {string} linkedin_url - The LinkedIn URL of the user.
 * @property {string} about - A brief summary or bio of the user.
 * @property {boolean} open_to_work - Indicates if the user is open to work.
 * @property {boolean} hiring - Indicates if the user is hiring.
 * @property {Array<{name: string}>} skills - An array of skills associated with the user.
 * @property {Array<Object>} experience - An array of experience records of the user.
 * @property {Array<Object>} education - An array of education records of the user.
 * @property {Date} created_at - The timestamp when the profile details were created.
 * @property {Date} updated_at - The timestamp when the profile details were last updated.
 */
@Schema({ timestamps: true })
export class ProfileDetails {
  @Prop({ type: MongooseSchema.Types.ObjectId })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  company: string;

  @Prop({ required: false })
  current_position: string;

  @Prop({ required: false })
  location: string;

  @Prop({ required: false })
  top_skills: string[];

  @Prop({ required: false })
  linkedin_url: string;

  @Prop({ required: false })
  about: string;

  @Prop({ required: false })
  open_to_work: boolean;

  @Prop({ required: false })
  hiring: boolean;

  @Prop({ type: [{ name: String }], required: false })
  skills: { name: string }[];

  @Prop({
    type: [
      {
        location: String,
        companyLinkedinUrl: String,
        companyId: String,
        companyUniversalName: String,
        companyName: String,
        duration: String,
        position: String,
        employmentType: String,
        description: String,
        startDate: {
          month: String,
          year: Number,
          text: String,
        },
        endDate: {
          month: String,
          year: Number,
          text: String,
        },
      },
    ],
    required: false,
  })
  experience: {
    location: string;
    companyLinkedinUrl: string;
    companyId: string;
    companyUniversalName: string;
    companyName: string;
    duration: string;
    position: string;
    employmentType: string;
    description: string;
    startDate: {
      month: string;
      year: number;
      text: string;
    };
    endDate: {
      month: string;
      year: number;
      text: string;
    };
  }[];

  @Prop({
    type: [
      {
        title: String,
        period: String,
        link: String,
        degree: String,
        startDate: {
          month: String,
          year: Number,
          text: String,
        },
        endDate: {
          month: String,
          year: Number,
          text: String,
        },
      },
    ],
    required: false,
  })
  education: {
    title: string;
    period: string;
    link: string;
    degree: string;
    startDate: {
      month: string;
      year: number;
      text: string;
    };
    endDate: {
      month: string;
      year: number;
      text: string;
    };
  }[];
}

export const ProfileDetailsSchema =
  SchemaFactory.createForClass(ProfileDetails);
ProfileDetailsSchema.index(
  { linkedin_url: 1 },
  { unique: true, name: 'profile_details_linkedin_url_unique' },
);
