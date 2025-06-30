import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateJobRequirementDto } from './dto/job-requirement.dto';
import { JobRequirement } from './entities/jobRequirement.entity';
import {
  JOB_REQUIREMENT_ERRORS as ERRORS,
  JOB_EMAIL_INVITE_TO_APPLY_EVENT,
} from 'src/_jigsaw/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JobRequirementSkill } from './entities/jobRequirementSkill.entity';
import {
  CreateJobRequirementSkillDto,
  UpdateJobRequirementSkillDto,
} from './dto/job-requirement-skill.dto';
import { JobPostStatus } from './utilities/enum';
import { classSerialiser } from 'src/_jigsaw/helpersFunc';
import { JobApplication } from 'src/job-application/entities/job-application.entity';
import { USER_ROLE } from 'src/users/utilities/enum';
import { ValidEmailDto } from 'src/email/dto/send-email.dto';

@Injectable()
export class JobRequirementService {
  constructor(
    @InjectRepository(JobRequirement)
    private readonly jobRequirementRepository: Repository<JobRequirement>,
    @InjectRepository(JobRequirementSkill)
    private readonly jobRequirementSkillRepository: Repository<JobRequirementSkill>,

    @InjectRepository(JobApplication)
    private readonly jobApplicationRepository: Repository<JobApplication>,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Creates a new Job Requirement.
   *
   * @param createJobRequirementDto - The DTO containing job requirement data.
   * @param user_id - The ID of the user creating the job requirement.
   * @returns The created JobRequirement entity.
   * @throws BadRequestException if data validation fails.
   */
  async create(
    jobDto: UpdateJobRequirementDto,
    user_id: number,
  ): Promise<JobRequirement> {
    // Create the job requirement entity
    const jobRequirement = this.jobRequirementRepository.create({
      ...jobDto,
      posted_by_id: { id: user_id },
    });

    // Save the job requirement
    const savedJobRequirement =
      await this.jobRequirementRepository.save(jobRequirement);

    //todo -> Emit event to publish on telegram channel

    return savedJobRequirement;
  }

  /**
   * Retrieves all Job Requirements, optionally filtered by status.
   *
   * @returns A list of Job Requirements.
   */
  async findAllPublishedJobs(): Promise<JobRequirement[]> {
    const jobRequirements = await this.jobRequirementRepository.find({
      where: { status: JobPostStatus.PUBLISH },
      relations: [
        'country_id',
        'state_id',
        'city_id',
        'company_industry_id',
        'posted_by_id',
        'skills',
        'skills.skill_id',
      ],
      order: { created_at: 'DESC' },
    });

    // Transform each jobRequirement to exclude sensitive fields
    return jobRequirements.map((jobRequirement) => {
      return classSerialiser(JobRequirement, jobRequirement);
    });
  }

  /**
   * Retrieves the Job Requirements for the current user, optionally filtered by status.
   *
   * @param user_id The ID of the user.
   * @param status The status to filter job requirements by.
   * @returns A list of the current user's Job Requirements.
   */
  async findMyRequirements(
    user_id: number,
    status?: string,
  ): Promise<JobRequirement[]> {
    const whereCondition = status
      ? {
          posted_by_id: { id: user_id },
          status: status?.toLowerCase() as JobPostStatus,
        }
      : { posted_by_id: { id: user_id } };
    const jobRequirements = await this.jobRequirementRepository.find({
      where: whereCondition,
      relations: [
        'country_id',
        'state_id',
        'city_id',
        'company_industry_id',
        'posted_by_id',
        'skills',
        'skills.skill_id',
      ],
      order: { created_at: 'DESC' },
    });

    // Transform each jobRequirement to exclude sensitive fields
    return jobRequirements.map((jobRequirement) => {
      return classSerialiser(JobRequirement, jobRequirement);
    });
  }

  /**
   * Retrieves a job requirement by ID.
   *
   * @param id - The ID of the job requirement.
   * @returns The JobRequirement entity.
   * @throws NotFoundException if the job requirement is not found.
   */
  async findOne(
    id: number,
    user_id: number,
    user_role: USER_ROLE,
  ): Promise<JobRequirement> {
    const jobRequirement = await this.jobRequirementRepository.findOne({
      where: { id },
      relations: [
        'country_id',
        'state_id',
        'city_id',
        'company_industry_id',

        'posted_by_id',
      ],
    });

    if (!jobRequirement) {
      throw new NotFoundException(ERRORS.NOT_FOUND(id));
    }

    // find job skills for the job requirement
    const jobsSkills = await this.jobRequirementSkillRepository.find({
      where: { jobrequirement_id: { id: id } },
      order: { created_at: 'DESC' },
      relations: ['skill_id'],
    });
    jobRequirement['skills'] = jobsSkills;

    // find job application for the job requirement only for loggedin candidate
    if (user_role === USER_ROLE.candidate) {
      const jobApplication = await this.jobApplicationRepository.findOne({
        where: { jobrequirement_id: { id: id }, candidate_id: { id: user_id } },
      });
      jobRequirement['job_application'] = jobApplication;
    }

    return classSerialiser(JobRequirement, jobRequirement);
  }

  /**
   * Updates an existing job requirement.
   *
   * @param id - The ID of the job requirement.
   * @param updateJobRequirementDto - The DTO containing updated job requirement data.
   * @returns The updated JobRequirement entity.
   * @throws NotFoundException if the job requirement is not found.
   * @throws BadRequestException if data validation fails.
   */
  async update(
    id: number,
    updateJobRequirementDto: UpdateJobRequirementDto,
    userId: number,
  ): Promise<JobRequirement> {
    const jobRequirement = await this.jobRequirementRepository.findOne({
      where: { id, posted_by_id: { id: userId } },
    });

    if (!jobRequirement) {
      throw new BadRequestException(`${ERRORS.UPDATE_ERROR}`);
    }

    Object.assign(jobRequirement, updateJobRequirementDto);

    return await this.jobRequirementRepository.save(jobRequirement);
  }

  /**
   * Deletes a job requirement.
   *
   * @param id - The ID of the job requirement.
   * @throws NotFoundException if the job requirement is not found.
   */
  async remove(id: number, userId: number): Promise<void> {
    const jobRequirement = await this.jobRequirementRepository.findOne({
      where: { id, posted_by_id: { id: userId } },
    });
    if (!jobRequirement) {
      throw new BadRequestException(`${ERRORS.DELETE_ERROR}`);
    }
    await this.jobRequirementRepository.remove(jobRequirement);
  }

  /**
   * Creates a new JobRequirementSkill.
   *
   * @param createJobSkillDto - The DTO containing job skill data.
   * @returns The created JobRequirementSkill entity.
   * @throws BadRequestException if data validation fails.
   */
  async createSkill(
    createJobSkillDto: CreateJobRequirementSkillDto,
    userId: number,
  ): Promise<JobRequirementSkill> {
    const [jobRequirement] = await this.jobRequirementRepository.find({
      where: { id: +createJobSkillDto.jobrequirement_id },
      relations: ['posted_by_id'],
    });

    if (!jobRequirement) {
      throw new HttpException(ERRORS.RETRIEVE_ERROR, 404);
    }
    // Check if the current user is the creator of the job requirement
    if (jobRequirement.posted_by_id.id !== userId) {
      throw new UnauthorizedException();
    }

    const jobSkill =
      this.jobRequirementSkillRepository.create(createJobSkillDto);
    return await this.jobRequirementSkillRepository.save(jobSkill);
  }

  /**
   * Retrieves a job skill by ID.
   *
   * @param id - The ID of the job skill.
   * @returns The JobRequirementSkill entity.
   * @throws NotFoundException if the job skill is not found.
   */
  async findSkillById(id: number): Promise<JobRequirementSkill> {
    const jobSkill = await this.jobRequirementSkillRepository.findOne({
      where: { id },
      relations: ['jobrequirement_id', 'skill_id'],
    });
    if (!jobSkill) {
      throw new NotFoundException(ERRORS.NOT_FOUND(id));
    }
    return jobSkill;
  }

  /**
   * Updates an existing job skill.
   *
   * @param id - The ID of the job skill.
   * @param updateJobSkillDto - The DTO containing updated job skill data.
   * @returns The updated JobRequirementSkill entity.
   * @throws NotFoundException if the job skill is not found.
   * @throws BadRequestException if data validation fails.
   */
  async updateSkill(
    id: number,
    updateJobSkillDto: UpdateJobRequirementSkillDto,
    userId: number,
  ): Promise<JobRequirementSkill> {
    const jobSkill = await this.jobRequirementSkillRepository.findOne({
      where: { id },
      relations: [
        'jobrequirement_id',
        'skill_id',
        'jobrequirement_id.posted_by_id',
      ],
    });

    // Check if the current user is the creator of the job requirement
    if (jobSkill.jobrequirement_id.posted_by_id.id !== userId) {
      throw new UnauthorizedException();
    }

    Object.assign(jobSkill, updateJobSkillDto);
    return await this.jobRequirementSkillRepository.save(jobSkill);
  }

  /**
   * Deletes a job skill.
   *
   * @param id - The ID of the job skill.
   * @throws NotFoundException if the job skill is not found.
   */
  async removeSkillById(id: number, userId: number): Promise<void> {
    const jobSkill = await this.jobRequirementSkillRepository.findOne({
      where: { id },
      relations: [
        'jobrequirement_id',
        'skill_id',
        'jobrequirement_id.posted_by_id',
      ],
    });

    // Check if the current user is the creator of the job requirement
    if (jobSkill.jobrequirement_id.posted_by_id.id !== userId) {
      throw new UnauthorizedException();
    }
    await this.jobRequirementSkillRepository.remove(jobSkill);
  }

  /**
   * Sends email invites to candidates for a job requirement.
   *
   * @param jobId - The ID of the job requirement.
   * @param candidateEmails - An array of candidate email addresses.
   * @param user_id - The ID of the user sending the invites.
   * @throws NotFoundException if the job requirement is not found.
   * @throws UnauthorizedException if the user is not authorized to send invites.
   */
  async sendEmailInvites(
    jobId: number,
    candidateEmails: ValidEmailDto[],
    user_id: number,
  ): Promise<void> {
    const jobRequirement = await this.jobRequirementRepository.findOne({
      where: { id: jobId, posted_by_id: { id: user_id } },
      relations: ['posted_by_id'],
    });

    if (!jobRequirement) {
      throw new NotFoundException(ERRORS.NOT_FOUND(jobId));
    }

    this.eventEmitter.emit(
      JOB_EMAIL_INVITE_TO_APPLY_EVENT,
      jobRequirement,
      candidateEmails,
    );
  }

  /**
   * Retrieves a job requirement by ID for a specific user.
   *
   * @param job_id - The ID of the job requirement.
   * @param user_id - The ID of the user.
   * @returns The JobRequirement entity.
   */
  async findMyJobRequirement(
    job_id: number,
    user_id: number,
  ): Promise<JobRequirement> {
    const jobRequirement = await this.jobRequirementRepository.findOne({
      where: {
        id: job_id,
        posted_by_id: { id: user_id },
      },
    });
    return jobRequirement;
  }
}
