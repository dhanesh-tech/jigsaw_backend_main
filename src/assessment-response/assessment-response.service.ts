import { HttpException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import {
  QUESTION_RESPONSE_STATUS,
  UNANSWERED_QUESTION_LIMIT,
} from '../assessment-response/utilities/enum';
import { AssessmentCandidateResponse } from '../assessment-response/entities/assessmentCandidateResponse.entity';
import { AutomatedQuestionBank } from 'src/master/entities/automatedQuestionBank.entity';
import {
  UpdateAssessmentCandidateResponseDto,
  NextSkillToAskDto,
} from '../assessment-response/dto/assessmentCandidateResponse.dto';
import {
  getCandidateAllQuestionsResponseQuery,
  getPerSkillQuestionCount,
  getRandomQuestionDifficultyLevel,
  getRandomQuestionQuery,
  selectRandomQuestionQuery,
} from '../assessment-response/utilities/helpers';
import { UpdateAssessmentCandidateResponseRatingDto } from '../assessment-response/dto/assessmentCandidateResponseRating.dto';
import { AssessmentCandidateResponseRating } from '../assessment-response/entities/assessmentCandidateResponseRating.entity';

import { AssignedAssessmentKit } from 'src/assign-assessment/entities/assignAssessment.entity';
import { ASSESSMENT_ASSIGN_STATUS } from 'src/assign-assessment/utilities/enum';
import {
  ASSESSMENT_QUESTION_NOT_EXIST,
  ASSIGNED_ASSESSMENT_NOT_ACCEPTED,
  ASSIGNED_ASSESSMENT_NOT_EXIST,
  CANDIDATE_RESPONSE_NOT_EXIST,
  NOT_AUTHORIZED_TO_RATE_ASSESSMENT,
  PROFILE_ASSESSMENT_QUESTIONS_PER_SKILL,
  PROFILE_ASSESSMENT_QUESTIONS_TOTAL_COUNT,
  QUESTION_DOES_NOT_EXIST_ON_SKILL,
  SKIPPED_QUESTION_THRESHOLD_IN_LAST_24_HOURS,
  TOO_MANY_QUESTIONS_SKIPPED,
} from 'src/_jigsaw/constants';
import { getUserSkillsQuery } from 'src/user-skills/utilities/helpers';
import { classSerialiser } from 'src/_jigsaw/helpersFunc';

@Injectable()
export class AssessmentResponseService {
  constructor(
    @InjectRepository(AssignedAssessmentKit)
    private assignAssessmentRepository: Repository<AssignedAssessmentKit>,

    @InjectRepository(AssessmentCandidateResponse)
    private assessmentCandidateResponseRepository: Repository<AssessmentCandidateResponse>,

    @InjectRepository(AssessmentCandidateResponseRating)
    private assessmentCandidateResponseRatingRepository: Repository<AssessmentCandidateResponseRating>,

    @InjectRepository(AutomatedQuestionBank)
    private questionBankRepository: Repository<AutomatedQuestionBank>,

    @InjectDataSource()
    private readonly dataSourceRepository: Repository<DataSource>,
  ) {}

  // fetch next question on the assessment kit
  // 1.check if assessment is in accepted stage or not
  // 2.pick all assigned questions so, that same question is not repeated
  // 3.pick unanswered question so, that candidate is not allowed more than decided limit
  // 4.to pick random question select skill and skill's difficulty level
  // 5.based on skill difficulty level select one random question from db
  // return question
  async fetchNextAssessmentKitQuestion(
    assessment_id: number,
    candidate_id: number,
  ): Promise<{
    data: AssessmentCandidateResponse | null;
    remaining_count: number;
  }> {
    //find assessment kit based on assigned id
    const [assignedAssessment] = await this.assignAssessmentRepository.find({
      where: { id: assessment_id, candidate_id: { id: candidate_id } },
      relations: [
        'candidate_id',
        'assessment_id',
        'assessment_id.skills',
        'assessment_id.skills.skill_id',
        'assessment_id.questions',
      ],
    });
    if (!assignedAssessment) {
      throw new HttpException(ASSIGNED_ASSESSMENT_NOT_EXIST, 400);
    }
    // if status not accepted throw error
    if (assignedAssessment.status !== ASSESSMENT_ASSIGN_STATUS.accepted) {
      throw new HttpException(ASSIGNED_ASSESSMENT_NOT_ACCEPTED, 400);
    }

    /// get assigned questions from db to check condition 2 & 3
    const assignedQuestions =
      await this.assessmentCandidateResponseRepository.find({
        where: {
          assessment_id: { id: +assignedAssessment.assessment_id.id },
          candidate_id: { id: +candidate_id },
        },
        relations: ['question_id', 'question_id.skill_id'],
      });

    /// if unanswered are more than 5 throw error
    const answeredQuestions = assignedQuestions.filter(
      (item) => item.status === QUESTION_RESPONSE_STATUS.answered,
    );
    const unAnsweredQuestionsCount: number =
      assignedQuestions.length - answeredQuestions.length;
    if (unAnsweredQuestionsCount > UNANSWERED_QUESTION_LIMIT) {
      throw new HttpException(TOO_MANY_QUESTIONS_SKIPPED, 400);
    }

    // if all questions are answered send data with assessment status as completed
    // also update db so, that in future proper error is thrown
    if (
      answeredQuestions.length ===
      assignedAssessment.assessment_id.total_questions
    ) {
      assignedAssessment.status = ASSESSMENT_ASSIGN_STATUS.completed;
      await this.assignAssessmentRepository.save(assignedAssessment);
      return {
        data: null,
        remaining_count: 0,
      };
    }

    // get skills and total_question is assessment kit
    const assessmentSkills = assignedAssessment.assessment_id.skills;
    const total_questions = assignedAssessment.assessment_id.total_questions;

    // get sql query based on assignedquestions, assessment skills
    const query = getRandomQuestionQuery(
      total_questions,
      assessmentSkills,
      answeredQuestions,
      assignedQuestions,
    );

    // fetch question based on query
    // sql injection is prevented as we are just fetching and not using any payload
    const randomQuestion = await this.questionBankRepository.query(query);

    // not abe to fetch question throw error
    if (!randomQuestion) {
      throw new HttpException(QUESTION_DOES_NOT_EXIST_ON_SKILL, 400);
    }

    const data = {
      question_id: randomQuestion[0],
      candidate_id: assignedAssessment.candidate_id,
      assessment_id: assignedAssessment.assessment_id,
      status: QUESTION_RESPONSE_STATUS.sent,
    };

    // save the question which is just assigned/sent to candidate
    const assignQuestion =
      await this.assessmentCandidateResponseRepository.create(data);
    const savedQuestion =
      await this.assessmentCandidateResponseRepository.save(assignQuestion);
    const remainingQuestionCount =
      assignedAssessment.assessment_id.total_questions -
      answeredQuestions.length;

    return {
      data: savedQuestion,
      remaining_count: remainingQuestionCount,
    };
  }

  // save response on one assigned question by candidate
  async saveCandidateQuestionResponse(
    question_id: number,
    candidate_id: number,
    candidateResponse: UpdateAssessmentCandidateResponseDto,
  ): Promise<AssessmentCandidateResponse> {
    const question = await this.assessmentCandidateResponseRepository.findOneBy(
      {
        id: question_id,
        candidate_id: { id: candidate_id },
      },
    );

    question.video_playback_id = candidateResponse.video_playback_id;
    question.video_asset_id = candidateResponse.video_asset_id;
    question.status = QUESTION_RESPONSE_STATUS.answered;

    const savedQuestion =
      await this.assessmentCandidateResponseRepository.save(question);

    // check if all questions are answered
    const allQuestionsAnswered =
      await this.assessmentCandidateResponseRepository.find({
        where: {
          candidate_id: { id: candidate_id },
          status: QUESTION_RESPONSE_STATUS.answered,
        },
      });

    if (
      allQuestionsAnswered.length === PROFILE_ASSESSMENT_QUESTIONS_TOTAL_COUNT
    ) {
      await this.assignAssessmentRepository.update(
        { candidate_id: { id: candidate_id } },
        { status: ASSESSMENT_ASSIGN_STATUS.completed },
      );
    }
    return classSerialiser(AssessmentCandidateResponse, savedQuestion);
  }

  // get all responses on one assessment kit by candidate
  async getCandidateAssessmentResponse(
    assessment_id: number,
    candidate_id: number,
  ): Promise<AssessmentCandidateResponse[]> {
    const questions = await this.assessmentCandidateResponseRepository.find({
      where: {
        assessment_id: { id: assessment_id },
        candidate_id: { id: candidate_id },
        status: QUESTION_RESPONSE_STATUS.answered,
      },
      relations: [
        'question_id',
        'question_id.skill_id',
        'question_id.topic_id',
        'candidate_response_ratings',
        'ai_assessment_question_analysis',
      ],
    });
    return questions;
  }

  // rate candidate's question response by reviewee
  async createCandidateQuestionResponseRating(
    user_id: number,
    ratingdto: UpdateAssessmentCandidateResponseRatingDto,
  ): Promise<AssessmentCandidateResponseRating> {
    const { assessment_candidate_question_response_id } = ratingdto;
    const [candidateResponse] =
      await this.assessmentCandidateResponseRepository.find({
        where: { id: +assessment_candidate_question_response_id },
        relations: ['assessment_id', 'candidate_id'],
      });

    if (!candidateResponse) {
      throw new HttpException(CANDIDATE_RESPONSE_NOT_EXIST, 400);
    }

    // only assessment reviewee should be able to give rating to candidate
    const [assignedAssessment] = await this.assignAssessmentRepository.find({
      where: {
        assessment_id: { id: candidateResponse.assessment_id.id },
        candidate_id: { id: candidateResponse.candidate_id.id },
        reviewed_by_id: { id: user_id },
      },
      relations: ['reviewed_by_id'],
    });

    if (!assignedAssessment) {
      throw new HttpException(NOT_AUTHORIZED_TO_RATE_ASSESSMENT, 400);
    }

    const newResponse =
      await this.assessmentCandidateResponseRatingRepository.create({
        ...ratingdto,
        rated_by_id: { id: user_id },
      });
    return await this.assessmentCandidateResponseRatingRepository.save(
      newResponse,
    );
  }

  // rate candidate's question response by reviewee
  async updateCandidateQuestionResponseRating(
    rating_id: number,
    user_id: number,
    ratingdto: UpdateAssessmentCandidateResponseRatingDto,
  ): Promise<AssessmentCandidateResponseRating> {
    let [savedResponse] =
      await this.assessmentCandidateResponseRatingRepository.find({
        where: { id: rating_id, rated_by_id: { id: user_id } },
        relations: ['rated_by_id'],
      });

    if (!savedResponse) {
      throw new HttpException(NOT_AUTHORIZED_TO_RATE_ASSESSMENT, 400);
    }

    await this.assessmentCandidateResponseRatingRepository.update(
      rating_id,
      ratingdto,
    );

    savedResponse = { ...savedResponse, ...ratingdto };

    return savedResponse;
  }

  /**
   * Retrieves the next skill to ask a user based on their current assessment status and previous responses.
   *
   * 1. Retrieve the user's skills from the database
   * 2. If no skills are found, return null
   * 3. Check if all questions are answered for each skill
   *
   * @param {number} user_id - The ID of the user for whom the skill to ask is being retrieved.
   * @returns {Promise<NextSkillToAskDto>}
   */
  async fetchSkillToAskAndCheckStatus(
    user_id: number,
  ): Promise<NextSkillToAskDto> {
    // Get user skills from the database - db query
    const userSkills = await this.dataSourceRepository.query(
      getUserSkillsQuery(user_id),
    );

    // If no skills are found, return null
    if (!userSkills.length) {
      return null;
    }
    const userSkillids = userSkills.map((skill) => skill.skill_id);

    // Retrieve the assessment responses for the candidate - db query
    const skillResponses = await this.dataSourceRepository.query(
      getCandidateAllQuestionsResponseQuery(user_id, userSkillids),
    );

    // If the candidate has not answered any questions, return the first skill with a default count
    if (!skillResponses.length) {
      return {
        skill_id: userSkills[0].skill_id,
        remaining_count: PROFILE_ASSESSMENT_QUESTIONS_TOTAL_COUNT,
        assigned_question_ids: [],
        difficulty_level: userSkills[0].experience_level, // Default difficulty level
      };
    }

    // Get all answered questions
    const answeredQuestions = skillResponses.filter(
      (response) => response.status === QUESTION_RESPONSE_STATUS.answered,
    );

    const skippedQuestions = skillResponses.filter(
      (question) =>
        question.status === QUESTION_RESPONSE_STATUS.sent ||
        question.status === QUESTION_RESPONSE_STATUS.skipped,
    );

    // skipped questions are more than 5 throw error
    if (skippedQuestions.length > SKIPPED_QUESTION_THRESHOLD_IN_LAST_24_HOURS) {
      throw new HttpException(TOO_MANY_QUESTIONS_SKIPPED, 400);
    }

    // Get all skill IDs from the response
    const assignedQuestionIds = skillResponses.map(
      (response) => response.question_id,
    );

    const perSkillQuestionCount = getPerSkillQuestionCount(
      PROFILE_ASSESSMENT_QUESTIONS_TOTAL_COUNT,
      userSkillids,
    );

    let skillToAsk = null;

    // Check if all questions are answered for each skill
    perSkillQuestionCount.forEach((perSkillCount) => {
      const response = answeredQuestions.filter(
        (val) => val.skill_id === perSkillCount.skill_id,
      );

      // If no response with skill_id found, set skill to ask
      if (!response.length) {
        skillToAsk = perSkillCount.skill_id;
      } else {
        // If answered count is less than or equal to per skill question count, set skill to ask
        if (response.length <= perSkillCount.count) {
          skillToAsk = perSkillCount.skill_id;
        }
      }
    });

    // If no skill to ask, update assessment status as completed
    if (!skillToAsk) {
      await this.assignAssessmentRepository.update(
        { candidate_id: { id: user_id } },
        { status: ASSESSMENT_ASSIGN_STATUS.completed },
      );
    }

    // Get candidate difficulty level from user skills
    const candidateDifficultyLevel = userSkills.find(
      (skill) => skill.skill_id === skillToAsk,
    )?.experience_level;

    const nextSkillToAsk: NextSkillToAskDto = {
      skill_id: skillToAsk,
      remaining_count:
        PROFILE_ASSESSMENT_QUESTIONS_TOTAL_COUNT - answeredQuestions.length,
      assigned_question_ids: assignedQuestionIds,
      difficulty_level: candidateDifficultyLevel,
    };

    return nextSkillToAsk;
  }

  /**
   * Fetches the next assessment question for a candidate based on their skill level and previous responses.
   *
   * 1. Retrieve the skill to ask based on the candidate's current status
   * 2. If no skill is available to ask, return null data and zero remaining count
   * 3. Get a random difficulty level for the question based on the candidate's skill level (e.g. easy, medium, hard)
   * 4. Get random question based on the skill and difficulty level
   *
   * @param candidate_id - The ID of the candidate requesting the next question.
   * @returns AssessmentCandidateResponse - The next question data and the remaining question count.
   */
  async fetchNextProfileAssessmentQuestion(candidate_id: number): Promise<
    | {
        data: AssessmentCandidateResponse | null;
        remaining_count: number;
      }
    | any
  > {
    // Retrieve the skill to ask based on the candidate's current status
    const skillToAsk = await this.fetchSkillToAskAndCheckStatus(candidate_id);

    // If no skill is available to ask, return null data and zero remaining count
    if (!skillToAsk) {
      return {
        data: null,
        remaining_count: 0,
      };
    }

    // Get a random difficulty level for the question based on the candidate's skill level
    const difficultyLevel = getRandomQuestionDifficultyLevel(
      skillToAsk.difficulty_level,
    );

    // Prepare the data for the next question query - db query
    const nextQuestionData = {
      skill_id: skillToAsk.skill_id,
      difficulty_level: difficultyLevel,
      total_questions: PROFILE_ASSESSMENT_QUESTIONS_PER_SKILL,
      assigned_questions_ids: skillToAsk.assigned_question_ids,
    };

    // Generate the SQL query to select a random question
    const query = selectRandomQuestionQuery(
      nextQuestionData.skill_id,
      nextQuestionData.difficulty_level,
      nextQuestionData.assigned_questions_ids,
    );

    // Execute the query to fetch a random question
    const randomQuestion = await this.dataSourceRepository.query(query);

    // If no question is found, throw an error
    if (!randomQuestion.length) {
      throw new HttpException(QUESTION_DOES_NOT_EXIST_ON_SKILL, 400);
    }

    // Create a new candidate response for the fetched question
    const newQuestion = await this.assessmentCandidateResponseRepository.create(
      {
        question_id: randomQuestion[0],
        candidate_id: { id: candidate_id },
        status: QUESTION_RESPONSE_STATUS.sent,
      },
    );

    // Save the new question response to the database
    const savedQuestion =
      await this.assessmentCandidateResponseRepository.save(newQuestion);

    // Serialize the saved question response for return
    const serializedQuestion = classSerialiser(
      AssessmentCandidateResponse,
      savedQuestion,
    );
    return {
      data: serializedQuestion,
      remaining_count: skillToAsk.remaining_count,
    };
  }

  /**
   * Fetches the assessment responses for a candidate profile based on the provided hash ID.
   *
   * @param hash_id - The unique identifier for the candidate.
   * @returns A promise that resolves to an array of `AssessmentCandidateResponse` objects.
   */
  async fetchProfileAssessmentResponse(
    hash_id: string,
  ): Promise<AssessmentCandidateResponse[]> {
    const questions = await this.assessmentCandidateResponseRepository.find({
      where: {
        candidate_id: { hash_id },
        status: QUESTION_RESPONSE_STATUS.answered,
      },
      relations: [
        'question_id',
        'question_id.skill_id',
        'candidate_response_ratings',
        'ai_assessment_question_analysis',
      ],
    });
    return questions.map((ques) =>
      classSerialiser(AssessmentCandidateResponse, ques),
    );
  }

  /**
   * Creates a new candidate profile response rating.
   *
   * @param user_id - The ID of the user creating the rating.
   * @param ratingdto - The data transfer object containing the rating details.
   * @returns A promise that resolves to the created AssessmentCandidateResponseRating.
   * @throws HttpException if the candidate response does not exist.
   */
  async createCandidateProfileResponseRating(
    user_id: number,
    ratingdto: UpdateAssessmentCandidateResponseRatingDto,
  ): Promise<AssessmentCandidateResponseRating> {
    const { assessment_candidate_question_response_id } = ratingdto;
    const [candidateResponse] =
      await this.assessmentCandidateResponseRepository.find({
        where: { id: +assessment_candidate_question_response_id },
        relations: ['candidate_id'],
      });

    if (!candidateResponse) {
      throw new HttpException(CANDIDATE_RESPONSE_NOT_EXIST, 400);
    }

    const newResponse =
      await this.assessmentCandidateResponseRatingRepository.create({
        ...ratingdto,
        rated_by_id: { id: user_id },
      });
    return await this.assessmentCandidateResponseRatingRepository.save(
      newResponse,
    );
  }

  /**
   * Updates the rating of a candidate's profile response.
   *
   * @param rating_id - The ID of the rating to be updated.
   * @param user_id - The ID of the user performing the update.
   * @param ratingdto - The data transfer object containing the updated rating information.
   * @returns A promise that resolves to the updated AssessmentCandidateResponseRating object.
   * @throws HttpException if the user is not authorized to update the rating.
   */
  async updateCandidateProfileResponseRating(
    rating_id: number,
    user_id: number,
    ratingdto: UpdateAssessmentCandidateResponseRatingDto,
  ): Promise<AssessmentCandidateResponseRating> {
    let [savedResponse] =
      await this.assessmentCandidateResponseRatingRepository.find({
        where: { id: rating_id, rated_by_id: { id: user_id } },
        relations: ['rated_by_id'],
      });

    if (!savedResponse) {
      throw new HttpException(NOT_AUTHORIZED_TO_RATE_ASSESSMENT, 400);
    }

    await this.assessmentCandidateResponseRatingRepository.update(
      rating_id,
      ratingdto,
    );

    savedResponse = { ...savedResponse, ...ratingdto };

    return savedResponse;
  }

  /**
   * Skips a profile question for a candidate.
   *
   * @param question_id - The ID of the question to skip.
   * @param user_id - The ID of the user skipping the question.
   * @returns The updated candidate profile response.
   */
  async skipProfileQuestion(
    question_id: number,
    user_id: number,
  ): Promise<AssessmentCandidateResponse> {
    const question = await this.assessmentCandidateResponseRepository.findOne({
      where: {
        id: question_id,
        candidate_id: { id: user_id },
      },
    });

    if (!question) {
      throw new HttpException(ASSESSMENT_QUESTION_NOT_EXIST, 400);
    }

    question.status = QUESTION_RESPONSE_STATUS.skipped;
    return await this.assessmentCandidateResponseRepository.save(question);
  }
}
