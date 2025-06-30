import {
  BACKEND_ROOT_URL,
  FRONTEND_URL,
  JIGSAW_AI_SERVER_URL,
} from './envDefaults';

/**
 * Generates the URL for accepting a referral invite.
 *
 * @param referral_id - The ID of the referral.
 * @param referral_code - The referral code.
 * @returns The URL for accepting the referral invite.
 */
export const REFERRAL_INVITE_ACCEPT_URL = (
  referral_uuid: string,
  referral_code: string,
): string =>
  `${FRONTEND_URL}sign-up?referral=${referral_code}&referral_uuid=${referral_uuid}`;

/**
 * Generates the URL for accepting a job invite.
 *
 * @param job_id - The ID of the job.
 * @param referral_code - The referral code.
 * @returns The URL for accepting the job invite.
 */
export const JOB_INVITE_ACCEPT_URL = (
  job_id: number,
  referral_code: string,
  referral_uuid?: string,
): string =>
  `${FRONTEND_URL}job/view-job/${job_id}?referral=${referral_code}&${
    referral_uuid ? `referral_uuid=${referral_uuid}` : ''
  }`;

/**
 * Generates the URL for verifying a user's email.
 *
 * @param email_token - The token for email verification.
 * @param password_reset_token - The token for password reset.
 * @returns The URL for verifying the user's email.
 */
export const VERIFY_EMAIL_URL = (
  email_token: string,
  password_reset_token: string,
): string =>
  `${FRONTEND_URL}verify-user?email_token=${email_token}&password_reset_token=${password_reset_token}`;

/**
 * Generates the URL for resetting a user's password.
 *
 * @param password_reset_token - The token for password reset.
 * @returns The URL for resetting the user's password.
 */
export const RESET_PASSWORD_URL = (password_reset_token: string): string =>
  `${FRONTEND_URL}reset-password/${password_reset_token}`;

/**
 * Generates the URL for the calendar dashboard.
 *
 * @returns The URL for the calendar dashboard.
 */
export const CALENDAR_DASHBOARD_URL = `${FRONTEND_URL}calendar-dashboard`;

/**
 * Generates the URL for the scheduled interview.
 *
 * @param id - The ID of the scheduled interview.
 * @param room_id - The ID of the room.
 * @returns The URL for the scheduled interview.
 */
export const SCHEDULED_INTERVIEW_URL = (id: number, room_id: string): string =>
  `${FRONTEND_URL}scheduled-interview/join-new-event/${id}/${room_id}`;

/**
 * Generates the URL for the payment dashboard.
 *
 * @returns The URL for the payment dashboard.
 */
export const PAYMENT_DASHBOARD_URL = `${FRONTEND_URL}payment-dashboard`;

/**
 * Generates the URL for the onboarding page.
 *
 * @returns The URL for the onboarding page.
 */
export const UNIPILE_NOTIFY_URL = `${BACKEND_ROOT_URL}v1/webhooks/unipile-auth-callback/?youcanauth=asthis`;

/**
 * Generates the URL for the onboarding page.
 *
 * @returns The URL for the onboarding page.
 */
export const UNIPILE_SUCCESS_REDIRECT_URL = `${FRONTEND_URL}prospects`;

/**
 * Generates the URL for the signup link.
 *
 * @param token - The token for the signup link.
 * @returns The URL for the signup link.
 */
export const SIGNUP_LINK_URL = (token: string): string =>
  `${FRONTEND_URL}sign-up?signup_token=${token}`;

/**
 * Generates the URL for the LinkedIn scraper API.
 *
 * @returns The URL for the LinkedIn scraper API.
 */
export const PYTHON_LINKEDIN_SCRAPER_API_URL = `${JIGSAW_AI_SERVER_URL}/api/profile-extractor`;
