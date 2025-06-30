import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository, DataSource } from 'typeorm';
import { AssignedAssessmentKit } from './entities/assignAssessment.entity';
import {
  CreateAssignedAssessmentDto,
  UpdateAssignedAssessmentDto,
} from './dto/assignAssessment.dto';
import { ASSESSMENT_ASSIGN_STATUS } from './utilities/enum';
import {
  ASSESSMENT_ASSIGNED_EVENT,
  ASSESSMENT_NOT_ASSIGNED,
  ASSESSMENT_SUBMITTED_EVENT,
  ASSIGN_ASSESSMENT_ERROR,
  ASSIGNED_ASSESSMENT_NOT_ACCEPTED,
  ASSIGNED_ASSESSMENT_NOT_EXIST,
  ASSIGNED_ASSESSMENT_REVIEWER_ERROR,
  NO_ASSESSMENT_FOUND_WITH_SKILL,
  SUBMIT_ASSESSMENT_ERROR,
} from 'src/_jigsaw/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserSkills } from 'src/user-skills/entities/userSkill.entity';
import { AssessmentKit } from 'src/assessment/entities/assessment.entity';
import { classSerialiser } from 'src/_jigsaw/helpersFunc';
import { getUserSkillsQuery } from 'src/user-skills/utilities/helpers';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AssignAssessmentService {
  constructor(
    @InjectRepository(AssignedAssessmentKit)
    private assignAssessmentRepository: Repository<AssignedAssessmentKit>,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: Logger,
    @InjectRepository(UserSkills)
    private userSkillRepository: Repository<UserSkills>,
    @InjectRepository(AssessmentKit)
    private assessmentRepository: Repository<AssessmentKit>,
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectDataSource()
    private readonly dataSourceRepository: Repository<DataSource>,
  ) {}

  /**
   * Assigns an assessment kit to a candidate and emits an event to notify the candidate.
   *
   * This method creates a new assigned assessment kit, saves it to the database, and then triggers
   * the `assessment.assigned` event, passing the ID of the saved assessment. If any errors occur during
   * these processes, they are caught and logged for debugging purposes.
   *
   * @param createAssignedAssessmentDto - The data transfer object containing the information needed to create a new assigned assessment kit.
   * @param user_id - The ID of the user assigning the assessment kit.
   * @returns A promise that resolves to the saved `AssignedAssessmentKit` entity.
   * @throws An error with detailed logging if the assessment kit creation or event emission fails.
   */
  async createAssignedAssessmentKit(
    createAssignedAssessmentDto: CreateAssignedAssessmentDto,
    user_id: number,
  ): Promise<AssignedAssessmentKit> {
    try {
      // Create a new assessment assignment instance with the provided DTO and assigner ID.
      const newAssignedAssessmentKit = this.assignAssessmentRepository.create({
        ...createAssignedAssessmentDto,
        assigned_by_id: { id: user_id },
        status: ASSESSMENT_ASSIGN_STATUS.assigned,
      });

      // Save the new assessment assignment in the database.
      const savedAssessment = await this.assignAssessmentRepository.save(
        newAssignedAssessmentKit,
      );

      // Emit an event to send email to candidate indicating that an assessment has been assigned.
      //todo(future) : pass whole object when we move to queue
      this.eventEmitter.emit(ASSESSMENT_ASSIGNED_EVENT, savedAssessment.id);

      return savedAssessment;
    } catch (error) {
      // Log the error with detailed context for debugging
      this.logger.error(ASSIGN_ASSESSMENT_ERROR(user_id), {
        error: error.message,
        stack: error.stack,
        userId: user_id,
        assessmentDto: createAssignedAssessmentDto,
      });
      throw error;
    }
  }

  // find assigned assessment details
  async findCandidateAssignedAssessmentKitDetails(
    assigned_id: number,
  ): Promise<AssignedAssessmentKit> {
    const [candidateAssignedAssessment] =
      await this.assignAssessmentRepository.find({
        where: { id: assigned_id },
        relations: [
          'assigned_by_id',
          'reviewed_by_id',
          'candidate_id',
          'candidate_id.referral_invite',
        ],
      });

    return candidateAssignedAssessment;
  }

  // find all candidates assigned in an assessment kit filtered by status
  async findAssessmentKitAssignedCandidates(
    assessment_id: number,
    status: string,
  ): Promise<AssignedAssessmentKit[]> {
    let assessmentStatus = [];

    if (status) {
      // if status is accepted then, all candidates should also come except assigned
      if (status === ASSESSMENT_ASSIGN_STATUS.accepted) {
        assessmentStatus = [
          ASSESSMENT_ASSIGN_STATUS.accepted,
          ASSESSMENT_ASSIGN_STATUS.completed,
          ASSESSMENT_ASSIGN_STATUS.rejected,
          ASSESSMENT_ASSIGN_STATUS.shortlisted,
        ];
      } else {
        assessmentStatus = [status];
      }
    }

    // query to run based on status
    const query = assessmentStatus.length
      ? { assessment_id: { id: assessment_id }, status: In(assessmentStatus) }
      : { assessment_id: { id: assessment_id } };
    return await this.assignAssessmentRepository.find({
      where: query,
      relations: ['candidate_id', 'assigned_by_id', 'reviewed_by_id'],
    });
  }

  // accept to review the assessment kit
  async acceptAssessmentKitToReview(
    assigned_id: number,
    user_id: number,
  ): Promise<AssignedAssessmentKit> {
    const assessment = await this.assignAssessmentRepository.findOneBy({
      id: assigned_id,
    });
    if (!assessment) {
      throw new HttpException(ASSIGNED_ASSESSMENT_NOT_EXIST, 400);
    }

    // if reviewed by is not null then, only another person can be assigned
    if (assessment.reviewed_by_id) {
      throw new HttpException(ASSIGNED_ASSESSMENT_REVIEWER_ERROR, 400);
    }

    await this.assignAssessmentRepository.update(
      { id: assigned_id },
      { reviewed_by_id: { id: user_id } },
    );

    return assessment;
  }

  // add assessment kit remark by reviewee
  async assessmentKitRemarkByReviewee(
    assigned_id: number,
    user_id: number,
    remark: UpdateAssignedAssessmentDto,
  ): Promise<AssignedAssessmentKit> {
    const { remark_by_reviewee, remark_by_assignee } = remark;
    const remarkData = {};
    const [assessment] = await this.assignAssessmentRepository.find({
      where: {
        id: assigned_id,
        reviewed_by_id: { id: user_id },
      },
      relations: ['reviewed_by_id'],
    });
    if (!assessment) {
      throw new HttpException(ASSIGNED_ASSESSMENT_REVIEWER_ERROR, 400);
    }

    // check if remark is present then, add to remarkData
    if (remark_by_reviewee) {
      remarkData['remark_by_reviewee'] = remark_by_reviewee;
    }
    if (remark_by_assignee) {
      remarkData['remark_by_assignee'] = remark_by_assignee;
    }

    await this.assignAssessmentRepository.update(
      { id: assigned_id },
      remarkData,
    );
    return { ...assessment, ...remarkData };
  }

  // mark assigned assessment status as shortlisted by reviewee
  async shortlistCandidateAssessmentKit(
    assigned_id: number,
    user_id: number,
  ): Promise<AssignedAssessmentKit> {
    const [assessment] = await this.assignAssessmentRepository.find({
      where: {
        id: assigned_id,
        reviewed_by_id: { id: user_id },
      },
      relations: ['reviewed_by_id'],
    });
    if (!assessment) {
      throw new HttpException(ASSIGNED_ASSESSMENT_REVIEWER_ERROR, 400);
    }

    await this.assignAssessmentRepository.update(
      { id: assigned_id },
      { status: ASSESSMENT_ASSIGN_STATUS.shortlisted },
    );

    assessment.status = ASSESSMENT_ASSIGN_STATUS.shortlisted;

    return assessment;
  }

  // mark assigned assessment status as rejected by reviewee
  async rejectCandidateAssessmentKit(
    assigned_id: number,
    user_id: number,
  ): Promise<AssignedAssessmentKit> {
    const [assessment] = await this.assignAssessmentRepository.find({
      where: {
        id: assigned_id,
        reviewed_by_id: { id: user_id },
      },
      relations: ['reviewed_by_id'],
    });
    if (!assessment) {
      throw new HttpException(ASSIGNED_ASSESSMENT_REVIEWER_ERROR, 400);
    }

    await this.assignAssessmentRepository.update(
      { id: assigned_id },
      { status: ASSESSMENT_ASSIGN_STATUS.rejected },
    );

    assessment.status = ASSESSMENT_ASSIGN_STATUS.rejected;

    return assessment;
  }

  // find all assigned assessments by candidate
  async findAllAssignedAssessmentKit(
    candidate_id: number,
  ): Promise<AssignedAssessmentKit[]> {
    return await this.assignAssessmentRepository.find({
      where: { candidate_id: { id: candidate_id } },
      relations: ['assigned_by_id', 'reviewed_by_id'],
    });
  }

  // get assigned assessment kit details by candidate
  async findAssignedAssessmentKitDetails(
    assigned_id: number,
    candidate_id: number,
  ): Promise<AssignedAssessmentKit> {
    const [assignedAssessment] = await this.assignAssessmentRepository.find({
      where: { id: assigned_id, candidate_id: { id: candidate_id } },
      relations: ['assigned_by_id', 'reviewed_by_id'],
    });

    return assignedAssessment;
  }

  // accpet assessment kit by candidate
  // if already assigned status is changed else, create a new row with status as accpeted
  async acceptAssessmentKitByCandidate(
    assessment_id: number,
    candidate_id: number,
  ): Promise<AssignedAssessmentKit> {
    const data = {
      status: ASSESSMENT_ASSIGN_STATUS.accepted,
    };

    const assignedAssessmentKit =
      await this.assignAssessmentRepository.findOneBy({
        candidate_id: { id: candidate_id },
        assessment_id: { id: assessment_id },
      });

    // already assigned update status
    if (assignedAssessmentKit) {
      if (assignedAssessmentKit?.status !== ASSESSMENT_ASSIGN_STATUS.assigned) {
        return assignedAssessmentKit;
      }
      assignedAssessmentKit.status = ASSESSMENT_ASSIGN_STATUS.accepted;
      return await this.assignAssessmentRepository.save(assignedAssessmentKit);
    } else {
      // not assigned create new
      const newAssignedAssessmentKit = this.assignAssessmentRepository.create({
        ...data,
        candidate_id: { id: candidate_id },
        assessment_id: { id: assessment_id },
      });
      return await this.assignAssessmentRepository.save(
        newAssignedAssessmentKit,
      );
    }
  }

  /**
   * Submits an assigned assessment kit for a candidate.
   *
   * @param {number} assigned_id - The ID of the assigned assessment kit.
   * @param {number} candidate_id - The ID of the candidate submitting the assessment.
   * @returns {Promise<AssignedAssessmentKit>} - The updated assigned assessment kit.
   * @throws {HttpException} - If the assigned assessment is not accepted.
   */
  async submitAssessmentKitCandidate(
    assigned_id: number,
    candidate_id: number,
  ): Promise<AssignedAssessmentKit> {
    try {
      // Retrieve the assigned assessment based on ID, candidate ID, and status
      const assignedAssessment = await this.assignAssessmentRepository.findOne({
        where: {
          id: assigned_id,
          candidate_id: { id: candidate_id },
          status: ASSESSMENT_ASSIGN_STATUS.accepted,
        },
        relations: ['assigned_by_id'],
      });

      // If no valid assigned assessment is found, throw an exception
      if (!assignedAssessment) {
        throw new HttpException(ASSIGNED_ASSESSMENT_NOT_ACCEPTED, 400);
      }

      // Update the status to completed
      assignedAssessment.status = ASSESSMENT_ASSIGN_STATUS.completed;

      // Save the updated assessment status
      const savedAssessment =
        await this.assignAssessmentRepository.save(assignedAssessment);

      // Emit an event for the completed assessment, sending an email if a mentor's email exists
      if (assignedAssessment?.assigned_by_id?.email) {
        this.eventEmitter.emit(ASSESSMENT_SUBMITTED_EVENT, savedAssessment.id);
      }
      return savedAssessment;
    } catch (error) {
      this.logger.error(
        `${SUBMIT_ASSESSMENT_ERROR} for assigned_id: ${assigned_id}, candidate_id: ${candidate_id}. Error: ${error.message}`,
      );
      throw error;
    }
  }

  // mark the assessment kit as declined
  async declineAssessmentKitCandidate(
    id: number,
    candidate_id: number,
  ): Promise<AssignedAssessmentKit> {
    const assignedAssessment = await this.assignAssessmentRepository.findOneBy({
      id,
      candidate_id: { id: candidate_id },
      status: ASSESSMENT_ASSIGN_STATUS.assigned,
    });
    if (!assignedAssessment) {
      throw new HttpException(ASSESSMENT_NOT_ASSIGNED, 400);
    }

    assignedAssessment.status = ASSESSMENT_ASSIGN_STATUS.declined;

    return await this.assignAssessmentRepository.save(assignedAssessment);
  }

  // get all assigned assessment kits on candidate's public profile
  async getPublicProfileAssessmentKits(
    hash_id: string,
  ): Promise<AssignedAssessmentKit[]> {
    const assessments = await this.assignAssessmentRepository.find({
      where: { candidate_id: { hash_id: hash_id } },
    });
    return assessments;
  }

  /**
   * get all reviewed assessments kits by mentor
   * @param  user_id
   * @returns {AssignedAssessmentKit[]} - fetch all reviewed assessment kits
   */
  async findAllReviewedAssessmentKits(
    user_id: number,
  ): Promise<AssignedAssessmentKit[]> {
    const assessments = await this.assignAssessmentRepository.find({
      where: { reviewed_by_id: { id: user_id } },
      relations: ['candidate_id'],
    });
    return assessments;
  }

  /**
   * get all assessment kits which are to be reviewed
   * condition is it should belong to mentor skills, mentor has not referred the user
   * @param  user_id
   * @returns {AssignedAssessmentKit[]}
   */
  async findAssessmentKitsToReview(
    user_id: number,
  ): Promise<AssignedAssessmentKit[]> {
    // find all user skills
    const userSkills = await this.userSkillRepository.find({
      where: { user_id: { id: user_id } },
      relations: ['skill_id'],
    });

    // get all assessment kits and skills
    // as all assessments are created by Jigsaw as an admin only so,
    // removed the condition for user_id
    const assessmentKits = await this.assessmentRepository.find({
      relations: ['skills', 'skills.skill_id'],
    });

    // if assessment kits does not exist return empty array
    if (!assessmentKits) {
      return [];
    }

    const filteredSkillAssessments = assessmentKits.filter((asmt_kit) => {
      //assuming assessment kits only contain one skill
      // todo => change to a better service or raw query later
      return userSkills.some(
        (usk) => asmt_kit.skills[0]?.skill_id?.id === usk?.skill_id?.id,
      );
    });

    if (!filteredSkillAssessments.length) {
      throw new HttpException(NO_ASSESSMENT_FOUND_WITH_SKILL, 400);
    }

    const assessmentKitIds = filteredSkillAssessments.map((item) => item?.id);

    // find assigned assessment kits not reviewed
    const assignedKits = await this.assignAssessmentRepository.find({
      where: {
        assessment_id: { id: In(assessmentKitIds) },
        reviewed_by_id: IsNull(),
        status: ASSESSMENT_ASSIGN_STATUS.completed,
      },
      relations: [
        'candidate_id',
        'candidate_id.skills',
        'candidate_id.referral_invite',
        'candidate_id.referral_invite.referred_by_id',
      ],
    });

    // if length 0 kits return assignedKits
    if (!assignedKits.length) {
      // Transform each assigned assessments to exclude sensitive fields
      return assignedKits.map((kit) => {
        return classSerialiser(AssignedAssessmentKit, kit);
      });
    }

    // filter those assessments whose candidates are referred by user
    // or not referred by anyone
    const filteredAssignedAssessments = assignedKits.filter(
      (asn_kit) =>
        asn_kit.candidate_id?.referral_invite?.referred_by_id.id === +user_id ||
        asn_kit.candidate_id?.referral_invite?.referred_by_id === null,
    );

    // Transform each assigned assessments to exclude sensitive fields
    return filteredAssignedAssessments.map((kit) => {
      return classSerialiser(AssignedAssessmentKit, kit);
    });
  }

  /**
   * Retrieves the profile assessment for a given user.
   *
   * @param {number} user_id - The ID of the user for whom the profile assessment is being retrieved.
   * @returns {Promise<ProfileAssessmentDto>} A promise that resolves to the profile assessment data.
   * @throws {HttpException} Throws an exception if no skills are found for the user.
   */
  async getProfileAssessment(user_id: number): Promise<AssignedAssessmentKit> {
    // get all skills for a user
    const skills = await this.dataSourceRepository.query(
      getUserSkillsQuery(user_id),
    );

    if (!skills.length) {
      throw new HttpException(NO_ASSESSMENT_FOUND_WITH_SKILL, 400);
    }

    const assignedAssessment = await this.assignAssessmentRepository.findOne({
      where: { candidate_id: { id: user_id } },
    });

    if (!assignedAssessment) {
      const newAssignedAssessment =
        await this.assignAssessmentRepository.create({
          candidate_id: { id: user_id },
          status: ASSESSMENT_ASSIGN_STATUS.pending,
        });
      return await this.assignAssessmentRepository.save(newAssignedAssessment);
    }

    return assignedAssessment;
  }
}
