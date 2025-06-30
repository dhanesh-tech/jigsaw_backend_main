export const QUESTION_NOT_EXIST: string = 'Question does not exist.';
export const QUESTION_CREATE_ERROR: string = 'Unable to create question.';
export const ASSESSMENT_NOT_EXIST: string = 'Assessment kit does not exist.';
export const ASSESSMENT_QUESTION_NOT_EXIST: string =
  'Assessment kit question does not exist.';
export const ASSESSMENT_ALREADY_ASSIGNED: string =
  'Assessment kit is already assigned.';
export const ASSESSMENT_NOT_ASSIGNED: string =
  'Assessment kit is not assigned yet.';
export const ASSIGNED_ASSESSMENT_NOT_EXIST: string =
  'Assigned assessment does not exist.';
export const ASSIGNED_ASSESSMENT_REVIEWER_ERROR: string =
  'Assessment does not exist or not reviewed by you.';
export const ASSIGNED_ASSESSMENT_NOT_ACCEPTED: string =
  'Assessment is not accepted yet.';
export const STATUS_NOT_VALID: string = 'Status is not valid.';
export const TOO_MANY_QUESTIONS_SKIPPED: string =
  'You have exceeded the count of skipped questions.';
export const QUESTION_DOES_NOT_EXIST_ON_SKILL: string =
  'Question does not exist corresponding to skill and difficulty.';
export const CANDIDATE_RESPONSE_NOT_EXIST: string =
  'Candidate response does not exist.';
export const NOT_AUTHORIZED_TO_RATE_ASSESSMENT: string =
  'Unable to rate. You are not authorized.';
export const USER_ALREADY_EXISTS: string = 'User already exists.';
export const REFERRAL_INVITE_NOT_EXIST: string =
  'Referral invite does not exists.';
export const REFERRAL_CODE_NOT_VALID: string = 'Referral code is not valid.';
export const JOB_REQUIREMENT_ERRORS = {
  CREATE_ERROR: 'Error creating job requirement.',
  RETRIEVE_ERROR: 'Error retrieving job requirement.',
  UPDATE_ERROR: 'Error updating job requirement.',
  DELETE_ERROR: 'Error deleting job requirement.',
  NOT_FOUND: (id: number) => `Job Requirement with ID ${id} not found.`,
  SKILL_REQUIRED: 'At least one skill is required.',
  SKILL_ID_REQUIRED: 'Skill ID is required.',
  SKILL_SAVE_ERROR: 'Error saving job requirement skills.',
};

export const JOB_SKILL_ERRORS = {
  CREATE_ERROR: 'Error creating job skill.',
  RETRIEVE_ERROR: 'Error retrieving job skill.',
  NOT_FOUND: (id: number) => `Job skill with ID ${id} not found.`,
  UPDATE_ERROR: 'Error updating job skill.',
  DELETE_ERROR: 'Error deleting job skill.',
};

export const ASSESSMENT_ASSIGNED_EMAIL_SUBJECT: string =
  'Jigsaw Assessment Assigned';
export const ASSESSMENT_SUBMITTED_EMAIL_SUBJECT: string =
  'Jigsaw Assessment Submitted';
export const ERROR_READING_TEMPLATE: string = 'Failed to read email template';
export const ERROR_TEMPLATE_NOT_FOUND: string =
  'Template file not found at path';
export const ERROR_SENDING_EMAIL: string = 'Failed to send email';
export const ERROR_HANDLING_EVENT: string =
  'Failed to handle assessment assigned event';
export const ASSIGN_ASSESSMENT_ERROR = (userId: number) =>
  `Error occurred while assigning assessment for user with ID ${userId}.`;
export const SUBMIT_ASSESSMENT_ERROR =
  'Error occurred while submitting the assessment';

export const ASSESSMENT_ASSIGNED_EVENT = 'assessment.assigned';
export const ASSESSMENT_SUBMITTED_EVENT = 'assessment.submitted';
export const ASSESSMENT_NOT_FOUND_ERROR = (assessmentId: number) =>
  `Assessment with ID ${assessmentId} not found.`;
export const QUESTION_TIME = 2;

export const JOB_PUBLISHED_EVENT: string = 'job.published';
export const ERROR_SENDING_MESSAGE: string = 'Failed to send message';

export const INVALID_USER: string = 'Invalid user.';
export const INVALID_USER_ROLE: string =
  'Invalid user role. Action not allowed.';
export const HASHED_CODE_LENGTH: number = 5;
export const JOB_TEAM_MEMEBER_INVITED_EVENT: string =
  'jobs.team.member.invites';
export const JOB_TEAM_MEMEBER_INVITED_SUBJECT: string =
  'Invited to collaborate on Jigsaw!';
export const MENTOR_NOT_FOUND = 'Mentor not found.';
export const JOB_REQ_NOT_FOUND_ERROR = (jobRequirementId: number) =>
  `Job Requirement with ID ${jobRequirementId} not found.`;
export const REFERRAL_USER_EMAIL_INVITE_EVENT: string =
  'referral.user.email.invites';
export const REFERRAL_USER_EMAIL_INVITE_SUBJECT: string =
  'Jigsawapp: Your Skills Are in Demand – Here’s What’s Next';
export const REFERRAL_ALREADY_EXISTS: string = 'User referral already exists.';
export const USER_SKILL_ALREADY_EXIST: string = 'User skill already exists.';
export const USER_SKILL_DOES_NOT_EXIST: string = 'User skill does not exists.';
export const NO_ASSESSMENT_FOUND_WITH_SKILL: string =
  'No assessment found with user skill and difficulty level.';

export const REFERRAL_INVITE_LIMIT: number = 100;
export const REFERRAL_INVITE_LIMIT_REACHED_ERROR: string =
  'Referral invite limit has been reached.';

export const SOMETHING_WENT_WRONG: string =
  'Oops! Something went wrong on our side. We are working to fix it as quickly as possible.';

export const ALREADY_CONSIDERED_ON_SIMILAR_JOBS_LIKE_THIS: string =
  'You have already been considered for similar jobs like this.';

export const JOB_APPLICATION_NOT_FOUND_OR_NO_PERMISSION: string =
  'Job application not found or you do not have permission to access it.';

export const SKILL_ID_ARRAY_REQUIRED: string =
  'Skill ids are required as an array.';

export const CALENDAR_EVENT_NOT_FOUND: string =
  'Calendar event does not exist or unauthorised.';

export const CALENDAR_EVENT_CUSTOME_FIELD_NOT_FOUND: string =
  'Calendar event custom field does not exist or unauthorised.';

export const CALENDAR_AVAILABILITY_NOT_FOUND: string =
  'Calendar availability does not exist or unauthorised.';

export const CALENDAR_AVAILABILITY_TIMING_NOT_FOUND: string =
  'Calendar availability timing does not exist or unauthorised.';

export const JOB_EMAIL_INVITE_TO_APPLY_EVENT: string = 'job.email.invite.apply';
export const JOB_EMAIL_INVITE_TO_APPLY_SUBJECT = (jobtitle: string) =>
  `Invited to apply to ${jobtitle} on Jigsaw.`;

export const WEEK_SPECIFIC_DATE_REQUIRED: string =
  'Either week_day or specific_date is required';

export const CALENDAR_EVENT_AVAILABILITY_NOT_FOUND: string =
  'Calendar event availability does not exist or unauthorised.';

export const NOT_AUTHORIZED_TO_SCHEDULE_EVENT: string =
  'You are not authorized to schedule the event.';

export const NOT_AUTHORIZED_TO_JOIN_SCHEDULED_EVENT: string =
  'You are not authorized to join the scheduled event.';

export const SCHEDULED_EVENT_DOES_NOT_EXIST_UNAUTHORIZED: string =
  'Scheduled event does not exist or unauthorized.';

export const EVENT_INVITATION_NOT_FOUND: string =
  'Event invitation does not exist.';

export const USER_REFERRAL_CODE_LENGTH: number = 6;
export const MAX_COLLISION_HASH_ATTEMPT: number = 100;

export const USER_EMAIL_SIGNUP_EVENT: string = 'user.email.signup';
export const USER_FORGOT_PASSWORD_EVENT: string = 'user.forgot.password';
export const NEW_USER_SIGNUP_REFERRAL_CODE_EVENT: string =
  'new.user.signup.referral.code';

export const USER_EMAIL_SIGNUP_SUBJECT: string = 'Welcome to Jigsaw!';
export const USER_PASSWORD_RESET_SUBJECT: string = 'Password Reset Request';

export const TOKEN_NOT_VALID: string = 'Invalid token';
export const TOKEN_EXPIRED: string = 'Token expired';
export const TOKEN_ALREADY_USED: string = 'Token already used';

export const INVALID_USER_EMAIL_PASSWORD: string = 'Invalid email or password';

export const EMAIL_VERIFICATION_SUCCESS: string = 'Email successfully verified';

export const PASSWORD_RESET_SUCCESS: string = 'Password successfully reset';

export const PASSWORD_RESET_LINK_SENT: string =
  'Password reset link has been sent to your email';

export const ERROR_GETTING_PROFILE_FROM_GOOGLE: string =
  'Error getting profile from google';

export const WRONG_CRON_JOB_CALLED = (job_name: string): string =>
  `Wrong cron job called in ${job_name} `;

export const PROFILE_ASSESSMENT_QUESTIONS_PER_SKILL: number = 3;
export const PROFILE_ASSESSMENT_QUESTIONS_TOTAL_COUNT: number = 10;

export const REFERRAL_DOES_NOT_EXIST: string = 'Referral does not exist.';

export const QUESTION_ALREADY_FLAGGED_MORE_THAN_THRESHOLD: string =
  'Question already flagged more than threshold times';

export const FLAGGED_QUESTION_THRESHOLD: number = 4;
export const APPROVED_QUESTION_THRESHOLD: number = 2;

export const FLAGGED_QUESTION_THRESHOLD_IN_LAST_24_HOURS: number = 7;

export const SKIPPED_QUESTION_THRESHOLD_IN_LAST_24_HOURS: number =
  FLAGGED_QUESTION_THRESHOLD_IN_LAST_24_HOURS + 5;

export const JIGSAW_CALENDAR_INTERVIEW_TITLE: string =
  'One on One Interview on Jigsawapp';

export const JIGSAW_CALENDAR_INTERVIEW_DESCRIPTION = (url: string): string =>
  `Join your one on one interview from the link below:
  ${url}. For any queries, please contact us at info@jigsawapp.co`;

export const INVALID_WEBHOOK_SIGNATURE: string = 'Invalid webhook signature';

export const NO_INTERVIEW_OR_ASSESSMENT_RESPONSE_FOUND: string =
  'No interview or assessment response found for the recording.';

// Chat Exceptions
export const CHAT_EXCEPTIONS_USER_ID_REQUIRED: string = 'User ID required';
export const CHAT_EXCEPTIONS_PEER_NOT_EXIST: string = 'Peer does not exist';

export const SQS_MESSAGE_SEND_ERROR: string = 'Failed to send message to SQS';

export const STRIPE_ACCOUNT_CREATE_ERROR: string =
  'Failed to create Stripe account';

export const STRIPE_ACCOUNT_FETCH_ERROR: string =
  'Failed to fetch Stripe account';

export const STRIPE_ACCOUNT_DELETE_ERROR: string =
  'Failed to delete Stripe account';

export const STRIPE_ACCOUNT_SESSION_CREATE_ERROR: string =
  'Failed to create Stripe account session';

export const STRIPE_ACCOUNT_NOT_FOUND: string =
  'Stripe account not found. Please create a new account.';

export const ACCOUNT_COUNTRY_NOT_FOUND: string =
  'Account country not found. Update your account details with a valid country.';

export const LINKEDIN_PROFILE_URL_REGEX =
  /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+$/;

export const LENGTH_SHOULD_NOT_BE_EMPTY = (key: string): string =>
  `${key} length should not be empty`;

export const INVALID_LINKEDIN_PROFILE_URL = (key: string): string =>
  `${key} is not a valid LinkedIn profile URL`;

export const USER_NOT_ONBOARDED_ERROR: string =
  'User is not onboarded. Please complete the onboarding process.';

export const USER_ALREADY_ONBOARDED_ERROR: string =
  'User is already onboarded. Please login to continue.';
