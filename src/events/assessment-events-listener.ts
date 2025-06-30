import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../email/email.service';
import { SendEmailDto } from '../email/dto/send-email.dto';
import * as fs from 'fs';
import * as path from 'path';
import {
  ASSESSMENT_ASSIGNED_EMAIL_SUBJECT,
  ASSESSMENT_ASSIGNED_EVENT,
  ASSESSMENT_NOT_FOUND_ERROR,
  ASSESSMENT_SUBMITTED_EMAIL_SUBJECT,
  ASSESSMENT_SUBMITTED_EVENT,
  ERROR_HANDLING_EVENT,
  ERROR_SENDING_EMAIL,
  ERROR_TEMPLATE_NOT_FOUND,
  PROFILE_ASSESSMENT_QUESTIONS_TOTAL_COUNT,
  QUESTION_TIME,
} from 'src/_jigsaw/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { AssignedAssessmentKit } from 'src/assign-assessment/entities/assignAssessment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AssessmentEventsListener {
  constructor(
    private readonly emailService: EmailService,
    @InjectRepository(AssignedAssessmentKit)
    private readonly assignAssessmentRepository: Repository<AssignedAssessmentKit>,
    private readonly logger: Logger,
  ) {}

  /**
   * Handles the event triggered when an assessment is assigned.
   * Retrieves the assessment details, prepares the email template,
   * and sends the email to the candidate.
   *
   * @param assessmentId - The ID of the assigned assessment.
   */
  @OnEvent(ASSESSMENT_ASSIGNED_EVENT)
  async handleAssessmentAssignedEvent(assessmentId: number) {
    try {
      // Retrieve the assigned assessment details using the assessmentId
      const [candidateAssignedAssessment] =
        await this.assignAssessmentRepository.find({
          where: { id: assessmentId },
          relations: [
            'assigned_by_id',
            'reviewed_by_id',
            'candidate_id',
            'candidate_id.skills',
          ],
        });

      // Check if the assigned assessment exists
      if (!candidateAssignedAssessment) {
        this.logger.error(ASSESSMENT_NOT_FOUND_ERROR(assessmentId));
        return;
      }

      // Extract relevant details for the email
      const candidateEmail = candidateAssignedAssessment.candidate_id.email;
      const candidateName = candidateAssignedAssessment.candidate_id.full_name;
      const mentorName = candidateAssignedAssessment.assigned_by_id.full_name;
      const assessmentName = 'Jigsaw Skill Assessment';
      const skills =
        candidateAssignedAssessment.candidate_id.skills
          ?.map((skill) => skill.skill_id.skill_name)
          ?.filter((skill) => skill !== null && skill !== undefined)
          .join(', ') || 'No skills specified';
      const totalQuestions = PROFILE_ASSESSMENT_QUESTIONS_TOTAL_COUNT;
      const estimatedTime = totalQuestions * QUESTION_TIME;

      // Define the path to the email template
      const templatePath = path.join(
        __dirname,
        '..',
        'templates',
        'assessment-assigned.html',
      );
      let templateContent: string;
      try {
        // Check if the template file exists and read its content
        await fs.promises.access(templatePath); // This will throw an error if the file doesn't exist
        templateContent = await fs.promises.readFile(templatePath, 'utf8');
      } catch (error) {
        this.logger.error(`${ERROR_TEMPLATE_NOT_FOUND}: ${templatePath}`);
        return;
      }

      // Replace placeholders in the template with dynamic values
      templateContent = templateContent
        .replace('{{candidateName}}', candidateName)
        .replace('{{mentorName}}', mentorName)
        .replace('{{assessmentName}}', assessmentName)
        .replace('{{skills}}', skills)
        .replace('{{totalQuestions}}', totalQuestions.toString())
        .replace('{{estimatedTime}}', estimatedTime.toString());

      // Prepare the email DTO with the recipient, subject, and body
      const emailDto: SendEmailDto = {
        recipient: candidateEmail,
        subject: ASSESSMENT_ASSIGNED_EMAIL_SUBJECT,
        body: templateContent,
      };

      // Attempt to send the email using the EmailService
      try {
        await this.emailService.sendSendgridEmail(emailDto);
      } catch (error) {
        this.logger.error(`${ERROR_SENDING_EMAIL}: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`${ERROR_HANDLING_EVENT}: ${error.message}`);
    }
  }

  /**
   * Handles the event triggered when an assessment is submitted.
   * Retrieves the assigned assessment details, prepares the email template,
   * and sends the email to the mentor.
   *
   * @param assessmentId - The ID of the submitted assessment.
   */
  @OnEvent(ASSESSMENT_SUBMITTED_EVENT)
  async handleAssessmentSubmittedEvent(assessmentId: number) {
    // Retrieve the assigned assessment details using the assessmentId
    const assignedAssessment = await this.assignAssessmentRepository.findOne({
      where: { id: assessmentId },
      relations: ['assigned_by_id'],
    });

    // Check if the assigned assessment exists
    if (!assignedAssessment) {
      this.logger.error(ASSESSMENT_NOT_FOUND_ERROR(assessmentId));
      return;
    }

    // Extract the mentor's email from the assigned assessment
    const mentorEmail = assignedAssessment?.assigned_by_id?.email;

    // Define the path to the email template
    const templatePath = path.join(
      __dirname,
      '..',
      'templates',
      'assesment-submitted.html',
    );
    let templateContent: string;
    try {
      // Check if the template file exists and read its content
      await fs.promises.access(templatePath); // This will throw an error if the file doesn't exist
      templateContent = await fs.promises.readFile(templatePath, 'utf8');
    } catch (error) {
      this.logger.error(`${ERROR_TEMPLATE_NOT_FOUND}: ${templatePath}`);
      return;
    }

    // Prepare the email DTO with the recipient, subject, and body
    const emailDto: SendEmailDto = {
      recipient: mentorEmail,
      subject: ASSESSMENT_SUBMITTED_EMAIL_SUBJECT,
      body: templateContent,
    };

    // Attempt to send the email using the EmailService
    try {
      await this.emailService.sendSendgridEmail(emailDto);
    } catch (error) {
      this.logger.error(`${ERROR_SENDING_EMAIL}: ${error.message}`);
    }
  }
}
