import { SupportedProvider } from 'unipile-node-sdk';

// enum representing the status of the LinkedIn profile extraction process
export enum ProfileExtractionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// 5 minutes
export const UNIPILE_AUTH_LINK_EXPIRATION_TIME = 5 * 60 * 1000;
export const UNIPILE_CONNECT_PROVIDERS: SupportedProvider[] = ['LINKEDIN'];
