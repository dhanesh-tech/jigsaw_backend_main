import dotenv from 'dotenv';
dotenv.config();

export const JIGSAW_SECRET_KEY: string = process.env.JIGSAW_SECRET_KEY;
export const SENDGRID_API_KEY: string = process.env.SENDGRID_API_KEY;
export const PORT: number = parseInt(process.env.PORT);
export const ENVIRONMENT: string = process.env.ENVIRONMENT;
export const FRONTEND_URL: string = process.env.FRONTEND_URL;
export const SQL_DB_TYPE: string = process.env.SQL_DB_TYPE;
export const SQL_DB_HOST: string = process.env.SQL_DB_HOST;
export const SQL_DB_PORT: number = parseInt(process.env.SQL_DB_PORT);
export const SQL_DB_NAME: string = process.env.SQL_DB_NAME;
export const SQL_DB_USER: string = process.env.SQL_DB_USER;
export const SQL_DB_PASSWORD: string = process.env.SQL_DB_PASSWORD;
export const JIGSAW_INFO_EMAIL: string = process.env.JIGSAW_INFO_EMAIL;
export const JIGSAW_TELEGRAM_BOT_API_KEY: string =
  process.env.JIGSAW_TELEGRAM_BOT_API_KEY;
export const JIGSAW_TELEGRAM_GROUP_ID: string =
  process.env.JIGSAW_TELEGRAM_GROUP_ID;

export const ADMIN_USER_ID: string = process.env.ADMIN_USER_ID;
export const SENTRY_DSN: string = process.env.SENTRY_DSN;

export const HMS_APP_ACCESS_KEY: string = process.env.HMS_APP_ACCESS_KEY;
export const HMS_APP_SECRET: string = process.env.HMS_APP_SECRET;
export const HMS_ROOM_TEMPLATE: string = process.env.HMS_ROOM_TEMPLATE;
export const HMS_ROOM_TEMPLATE_ID: string = process.env.HMS_ROOM_TEMPLATE_ID;
export const HMS_ROOM_WEBHOOK_XHMS_KEY: string =
  process.env.HMS_ROOM_WEBHOOK_XHMS_KEY;

export const MUX_TOKEN_ID: string = process.env.MUX_TOKEN_ID;
export const MUX_TOKEN_SECRET: string = process.env.MUX_TOKEN_SECRET;
export const MUX_WEBHOOK_SIGNING_SECRET: string =
  process.env.MUX_WEBHOOK_SIGNING_SECRET;

export const AWS_S3_ACCESS_KEY_ID: string = process.env.AWS_S3_ACCESS_KEY_ID;
export const AWS_S3_SECRET_ACCESS_KEY: string =
  process.env.AWS_S3_SECRET_ACCESS_KEY;
export const AWS_STORAGE_BUCKET_NAME: string =
  process.env.AWS_STORAGE_BUCKET_NAME;
export const AWS_S3_ENDPOINT_URL: string = process.env.AWS_S3_ENDPOINT_URL;
export const AWS_S3_REGION_NAME: string = process.env.AWS_S3_REGION_NAME;
export const AWS_HMS_RECORDING_S3_BUCKET_NAME: string =
  process.env.AWS_HMS_RECORDING_S3_BUCKET_NAME;

// AWS SQS
export const AWS_SQS_REGION_NAME: string = process.env.AWS_SQS_REGION_NAME;
export const AWS_SQS_QUEUE_URL: string = process.env.AWS_SQS_QUEUE_URL;
export const AWS_SQS_PROFILE_EXTRACTOR_QUEUE_URL: string =
  process.env.AWS_SQS_PROFILE_EXTRACTOR_QUEUE_URL;
export const AWS_SQS_PROFILE_EXTRACTOR_MESSAGE_GROUP_ID: string =
  'profile_extractor_agent';
export const AWS_SQS_MESSAGE_GROUP_ID: string = 'transcription_analysis';

// other constants
export const AWS_RESUME_UPLOAD_FOLDER = 'resumes';
export const AWS_PROFILE_IMAGE_UPLOAD_FOLDER = 'profile_image';

// redis
export const REDIS_URL: string = process.env.REDIS_URL;
export const REDIS_HOST: string = process.env.REDIS_HOST;
export const REDIS_PORT: number = parseInt(process.env.REDIS_PORT);

// google
export const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET;

// backend root url
export const BACKEND_ROOT_URL: string = process.env.BACKEND_ROOT_URL;

// chat stream io
export const STREAM_API_KEY: string = process.env.STREAM_API_KEY;
export const STREAM_API_SECRET: string = process.env.STREAM_API_SECRET;

// stripe
export const STRIPE_SECRET_KEY: string = process.env.STRIPE_SECRET_KEY;
export const STRIPE_PUBLISHABLE_KEY: string =
  process.env.STRIPE_PUBLISHABLE_KEY;
export const STRIPE_WEBHOOK_SECRET: string = process.env.STRIPE_WEBHOOK_SECRET;
export const MONGODB_URI: string = process.env.MONGODB_URI;
export const MONGODB_DB_NAME: string = process.env.MONGODB_DB_NAME;
// payment percentage
export const JOB_PAYMENT_PERCENTAGE: number = 10;

// unipile
export const UNIPILE_DSN: string = process.env.UNIPILE_DSN;
export const UNIPILE_ACCESS_TOKEN: string = process.env.UNIPILE_ACCESS_TOKEN;

// ai server
export const JIGSAW_AI_SERVER_URL: string = process.env.JIGSAW_AI_SERVER_URL;
