import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { JOB_APPLICATION_STATUS } from '../utilities/enum';

/**
 * Data Transfer Object (DTO) for creating a job application.
 *
 * This class is used to encapsulate the data required to create a new job application.
 *
 * @class JobApplicationDto
 *
 * @property {number} jobrequirement_id - The ID of the job requirement. This field is required.
 * @property {number} candidate_id - The ID of the candidate applying for the job. This field is required.
 * @property {JOB_APPLICATION_STATUS} application_status - The current status of the job application. This field is required and must be a valid enum value of JOB_APPLICATION_STATUS.
 * @property {string} [application_feedback] - Optional feedback for the application. This field is optional and must be a string if provided.
 */
export class JobApplicationDto {
  @IsNotEmpty()
  jobrequirement_id: number;

  @IsNotEmpty()
  candidate_id: number;

  @IsEnum(JOB_APPLICATION_STATUS)
  application_status: JOB_APPLICATION_STATUS;

  @IsOptional()
  @IsString()
  application_feedback?: string;
}

/**
 * Data Transfer Object (DTO) for updating a job application.
 *
 * This class is used to encapsulate the data required to update a job application.
 *
 * @class JobApplicationUpdateDto
 *
 * @property {JOB_APPLICATION_STATUS} [application_status] - The current status of the job application. This field is optional and must be a valid enum value of JOB_APPLICATION_STATUS.
 * @property {string} [application_feedback] - Feedback or comments regarding the job application. This field is optional and must be a string.
 */
export class JobApplicationUpdateDto {
  @IsOptional()
  @IsEnum(JOB_APPLICATION_STATUS)
  application_status?: JOB_APPLICATION_STATUS;

  @IsOptional()
  @IsString()
  application_feedback?: string;
}
