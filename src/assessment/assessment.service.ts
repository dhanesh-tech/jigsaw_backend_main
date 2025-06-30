import { HttpException, Injectable } from '@nestjs/common';
import { AssessmentKitQuestion } from './entities/assessmentQuestion.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AssessmentKit } from './entities/assessment.entity';
import { AssessmentKitSkill } from './entities/assessmentSkill.entity';
import { MasterService } from 'src/master/master.service';
import { CreateAssessmentDto, UpdateAssessmentDto } from './dto/assessment.dto';
import { getAssignedAssessmentCountByStatusQuery } from './utilities/helpers';
import {
  CreateAssessmentSkillDto,
  SkillDifficultyLevelDto,
  UpdateAssessmentSkillDto,
} from './dto/assessmentSkill.dto';
import { AssessmentQuestionDto } from './dto/assessmentQuestion.dto';
import { QUESTION_STATUS } from 'src/master/utilities/enum';
import { AssignedAssessmentKit } from 'src/assign-assessment/entities/assignAssessment.entity';
import {
  ASSESSMENT_QUESTION_NOT_EXIST,
  ASSESSMENT_NOT_EXIST,
  QUESTION_CREATE_ERROR,
} from 'src/_jigsaw/constants';
import { ADMIN_USER_ID } from 'src/_jigsaw/envDefaults';
import { classSerialiser } from 'src/_jigsaw/helpersFunc';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(AssessmentKit)
    private assessmentRepository: Repository<AssessmentKit>,

    @InjectRepository(AssessmentKitSkill)
    private assessmentSkillRepository: Repository<AssessmentKitSkill>,

    @InjectRepository(AssessmentKitQuestion)
    private assessmentQuestionRepository: Repository<AssessmentKitQuestion>,

    @InjectRepository(AssignedAssessmentKit)
    private assignAssessmentRepository: Repository<AssignedAssessmentKit>,

    private readonly masterService: MasterService,
  ) {}

  // create assessment kit
  async createAssessmentKit(
    createAssessmentDto: CreateAssessmentDto,
    user_id: number,
  ): Promise<AssessmentKit> {
    const assessmentKit = this.assessmentRepository.create({
      ...createAssessmentDto,
      created_by_id: { id: user_id },
    });

    return await this.assessmentRepository.save(assessmentKit);
  }

  // get all assessment kits based on status
  async findAllAssessmentKit(
    user_id: number,
    status: string,
  ): Promise<AssessmentKit[]> {
    const assessments = await this.assessmentRepository.find({
      where: { created_by_id: { id: user_id }, status },
      relations: ['skills', 'skills.skill_id'],
    });
    return assessments;
  }

  // get one assessment kit details
  // along with the count of candidates with different statuses
  async findOneAssessmentKit(assessment_id: number): Promise<AssessmentKit> {
    const [assessmentKit] = await this.assessmentRepository.find({
      where: { id: assessment_id },
      relations: ['skills', 'skills.skill_id'],
    });

    if (!assessmentKit) {
      throw new HttpException(ASSESSMENT_NOT_EXIST, 400);
    }

    // using sql query to get status_count
    const countByStatusQuery =
      await getAssignedAssessmentCountByStatusQuery(assessment_id);
    let assessmentAssigns = [];

    // query string is returned by checking assessment_id
    if (countByStatusQuery)
      assessmentAssigns =
        await this.assignAssessmentRepository.query(countByStatusQuery);

    // // returning status_count on the Assessment kit object
    assessmentKit['status_count'] = assessmentAssigns;

    return assessmentKit;
  }

  // find assessment details based on hash_id
  // since, it is public api so, we check user_id and return the assigned_assessment_details if it exists
  async findAssessmentKitDetails(
    hash_id: string,
    user_id: number,
  ): Promise<AssessmentKit> {
    const [assessmentKit] = await this.assessmentRepository.find({
      where: { hash_id },
      relations: ['skills', 'skills.skill_id'],
    });

    if (!assessmentKit) {
      throw new HttpException(ASSESSMENT_NOT_EXIST, 400);
    }

    // send assessment assigned details if loggedin user fetches the api
    if (user_id) {
      const [assignedAssessment] = await this.assignAssessmentRepository.find({
        where: { candidate_id: { id: user_id }, assessment_id: { hash_id } },
      });
      assessmentKit['assigned_assessment_details'] = assignedAssessment;
    }

    return assessmentKit;
  }

  // update an assessment kit
  async updateAssessmentKit(
    assessment_id: number,
    updateAssessmentDto: UpdateAssessmentDto,
    user_id: number,
  ): Promise<AssessmentKit> {
    const [assessmentKit] = await this.assessmentRepository.find({
      where: { id: assessment_id, created_by_id: { id: user_id } },
      relations: ['skills', 'skills.skill_id'],
    });

    if (!assessmentKit) {
      throw new HttpException(ASSESSMENT_NOT_EXIST, 400);
    }
    Object.assign(assessmentKit, updateAssessmentDto);
    return await this.assessmentRepository.save(assessmentKit);
  }

  // detete an assessment kit
  async removeAssessmentKit(
    assessment_id: number,
    user_id: number,
  ): Promise<void> {
    const [assessmentKit] = await this.assessmentRepository.find({
      where: { id: assessment_id, created_by_id: { id: user_id } },
    });
    if (!assessmentKit) {
      throw new HttpException(ASSESSMENT_NOT_EXIST, 400);
    }
    await this.assessmentRepository.delete(assessment_id);
    return;
  }

  // create skill on an assessment kit
  async createAssessmentKitSkill(
    createAssessmentSkillDto: CreateAssessmentSkillDto,
  ): Promise<AssessmentKitSkill> {
    const assessmentKitSkill = this.assessmentSkillRepository.create(
      createAssessmentSkillDto,
    );

    return await this.assessmentSkillRepository.save(assessmentKitSkill);
  }

  // update one assessment kit skill
  async updateAssessmentKitSkill(
    skill_id: number,
    updateAssessmentSkillDto: UpdateAssessmentSkillDto,
  ): Promise<AssessmentKitSkill> {
    await this.assessmentSkillRepository.update(
      skill_id,
      updateAssessmentSkillDto,
    );
    return await this.assessmentSkillRepository.findOneBy({ id: skill_id });
  }

  // remove one assessment kit skill
  async removeAssessmentKitSkill(skill_id: number): Promise<void> {
    await this.assessmentSkillRepository.delete(skill_id);
  }

  // create one assessment kit question
  // the question will be first created in question bank with status pending
  async createAssessmentKitQuestion(
    questionDto: AssessmentQuestionDto,
    user_id: number,
  ): Promise<AssessmentKitQuestion> {
    const {
      question_text,
      time_to_answer_in_minutes,
      difficulty_level,
      skill_id,
      topic_id,
    } = questionDto;
    const createdQuestion = await this.masterService.createQuestion(
      {
        question_text,
        time_to_answer_in_minutes,
        difficulty_level,
        status: QUESTION_STATUS.pending,
        skill_id,
        topic_id,
      },
      user_id,
    );

    if (!createdQuestion) {
      throw new HttpException(QUESTION_CREATE_ERROR, 400);
    }

    const assessmentQuestion = await this.assessmentQuestionRepository.create({
      question_bank_question_id: { id: createdQuestion.id },
      assessment_id: { id: +questionDto.assessment_id },
    });
    return await this.assessmentQuestionRepository.save(assessmentQuestion);
  }

  // update assessment kit question
  // the question will be updated in question bank directly
  async updateAssessmentKitQuestion(
    question_id: number,
    questionDto: AssessmentQuestionDto,
    user_id: number,
  ): Promise<AssessmentKitQuestion> {
    const [assessmentQuestion] = await this.assessmentQuestionRepository.find({
      where: { id: question_id },
      relations: ['question_bank_question_id'],
    });

    if (!assessmentQuestion) {
      throw new HttpException(ASSESSMENT_QUESTION_NOT_EXIST, 400);
    }
    const updatedQuestion = await this.masterService.updateQuestion(
      +assessmentQuestion.question_bank_question_id.id,
      questionDto,
      user_id,
    );
    assessmentQuestion.question_bank_question_id = updatedQuestion;
    return assessmentQuestion;
  }

  // the question will be removed from assessment kit but not question bank
  async removeAssessmentKitQuestion(question_id: number): Promise<void> {
    await this.assessmentQuestionRepository.delete(question_id);
  }

  // the question will be first created in question bank with status pending
  async findAllAssessmentKitQuestions(
    assessment_id: number,
  ): Promise<AssessmentKitQuestion[]> {
    return await this.assessmentQuestionRepository.find({
      where: { assessment_id: { id: assessment_id } },
      relations: [
        'question_bank_question_id',
        'question_bank_question_id.skill_id',
        'question_bank_question_id.topic_id',
      ],
    });
  }

  /**
   * Retrieves all user skill assessment kits based on the provided user ID and skills.
   *
   * @param user_id - The ID of the user for whom the assessment kits are being retrieved.
   * @param skills - An array of skill difficulty level DTOs to filter the assessment kits.
   * @returns A promise that resolves to an array of AssessmentKit objects.
   *
   * This method performs the following steps:
   * 1. Fetches all assessment kits created by the admin user.
   * 2. Filters the assessment kits based on the provided skills.
   * 4. Fetches all assigned assessment kits for the candidate that are not completed.
   */
  async getAllUserSkillAssessmentKits(
    user_id: number,
    skills: SkillDifficultyLevelDto[],
  ): Promise<AssessmentKit[]> {
    const assessmentKits = await this.assessmentRepository.find({
      where: {
        created_by_id: { id: +ADMIN_USER_ID },
      },
      relations: ['skills', 'skills.skill_id'],
    });

    // if assessment kits does not exist return empty array
    if (!assessmentKits) {
      return [];
    }

    const filteredSkillAssessments = assessmentKits.filter((asmt_kit) => {
      //assuming assessment kits only contain one skill
      // todo => change to a better service or raw query later
      return skills.some(
        (skill) =>
          asmt_kit.skills[0]?.skill_id?.id === skill?.skill_id &&
          asmt_kit.skills[0]?.difficulty_level === skill?.difficulty_level,
      );
    });

    if (!filteredSkillAssessments.length) {
      return [];
    }

    // find assigned assessment kits of candidate which are still not completed
    const assignedKits = await this.assignAssessmentRepository.find({
      where: {
        candidate_id: { id: user_id },
      },
      relations: ['assessment_id'],
    });

    // if there are no assigned assessment kits return assessments
    if (!assignedKits.length) {
      return filteredSkillAssessments;
    }

    // if there is assigned assessment kits filter all the assessment kits which are not assigned
    const filterAssessments = filteredSkillAssessments.filter((asmt_kit) => {
      return !assignedKits.some(
        (asgn_kit) => asgn_kit?.assessment_id?.id === asmt_kit?.id,
      );
    });
    return filterAssessments.map((asmt_kit) =>
      classSerialiser(AssessmentKit, asmt_kit),
    );
  }
}
