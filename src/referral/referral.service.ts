import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ReferralInvite } from './entities/referralInvites.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateReferralInviteDto } from './dto/referralInvites.dto';
import {
  REFERRAL_ALREADY_EXISTS,
  REFERRAL_CODE_NOT_VALID,
  REFERRAL_DOES_NOT_EXIST,
  REFERRAL_INVITE_LIMIT,
  REFERRAL_INVITE_LIMIT_REACHED_ERROR,
  REFERRAL_INVITE_NOT_EXIST,
  REFERRAL_USER_EMAIL_INVITE_EVENT,
  USER_ALREADY_EXISTS,
} from 'src/_jigsaw/constants';
import { REFERRAL_INVITE_STATUS } from './utilities/enum';
import { UsersService } from 'src/users/users.service';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { User } from 'src/users/entities/user.entity';
import { classSerialiser } from 'src/_jigsaw/helpersFunc';
import { AiAgentsService } from 'src/ai-agents/ai-agents.service';
import { PUSH_EXTRACTED_URLS_TO_SQS_EVENT } from 'src/_jigsaw/eventSignalConstants';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(ReferralInvite)
    private referralInviteRepository: Repository<ReferralInvite>,
    private readonly eventSignalEmitter: EventEmitter,
    private readonly userService: UsersService,

    private readonly aiAgentsService: AiAgentsService,
  ) {}

  /**
   * invite the user via their email
   * @body user_email - The email of user being invited.
   * @param invitingUser - User which is logged in
   * @throws {HttpException} - If user with email does not exist.
   * @returns {ReferralInvite} - create new column with email and status being pending
   */
  async inviteViaEmail(
    referralDto: UpdateReferralInviteDto,
    user_id: number,
    invitingUser: User,
  ): Promise<ReferralInvite> {
    const { user_email, job_id } = referralDto;

    //total referrals limit to REFERRAL_INVITE_LIMIT excluding declined and pending
    const referralCount = await this.referralInviteRepository.count({
      where: {
        referred_by_id: { id: user_id },
        status: REFERRAL_INVITE_STATUS.accepted,
      },
    });

    if (referralCount > REFERRAL_INVITE_LIMIT) {
      throw new HttpException(
        REFERRAL_INVITE_LIMIT_REACHED_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }

    // check if user already exists with the email
    const existingUser = await this.userService.findUserByEmail(user_email);
    if (existingUser) {
      throw new HttpException(USER_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    // check if email is already invited by the user
    const [existingReferral] = await this.referralInviteRepository.find({
      where: { referred_by_id: { id: user_id }, user_email },
    });

    if (existingReferral) {
      throw new HttpException(REFERRAL_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const newReferralInvite = this.referralInviteRepository.create({
      user_email,
      status: REFERRAL_INVITE_STATUS.pending,
      referred_by_id: invitingUser,
    });

    const savedInvite =
      await this.referralInviteRepository.save(newReferralInvite);

    //send email -> emit event to send email to invited user
    this.eventSignalEmitter.emit(
      REFERRAL_USER_EMAIL_INVITE_EVENT,
      savedInvite,
      job_id,
    );

    return classSerialiser(ReferralInvite, savedInvite);
  }

  /**
   * validate the referral invite received on email
   * @body {referral_uuid, status, user_id}
   * @throws {HttpException} - If referree already exists.
   * @returns {ReferralInvite} - update existing invite with accepted/declined user
   */
  async validateReferralInvite(
    id: number,
    referralDto: UpdateReferralInviteDto,
    user_id: number,
  ): Promise<ReferralInvite> {
    // check if referral invite exist
    const [referralInvite] = await this.referralInviteRepository.find({
      where: { id },
    });
    if (!referralInvite) {
      throw new HttpException(REFERRAL_INVITE_NOT_EXIST, HttpStatus.NOT_FOUND);
    }
    // check if user has another invite
    const updateData: UpdateReferralInviteDto = {};
    const [acceptedInvite] = await this.referralInviteRepository.find({
      where: { accepted_by_id: { id: user_id } },
    });
    // if user already accepted invite mark referral invalid else save
    if (acceptedInvite) {
      updateData.status = REFERRAL_INVITE_STATUS.invalid;
    } else {
      updateData.accepted_by_id = user_id;
    }

    Object.assign(referralInvite, updateData);

    const savedReferralInvite =
      await this.referralInviteRepository.save(referralInvite);

    return classSerialiser(ReferralInvite, savedReferralInvite);
  }

  /**
   * // to do in future -> when users module is in node call after signup function
   * @param -  { referral_code, user_id }
   * @throws {HttpException} - If referree already exists/referral_code is invalid
   * @returns {ReferralInvite} - create new column with user and status being accepted
   */
  async acceptReferralInvite(
    referralDto: UpdateReferralInviteDto,
    user_id: number,
  ): Promise<ReferralInvite> {
    const { referral_code } = referralDto;

    // check if token is valid
    const referringUser =
      await this.userService.findUserByReferralCode(referral_code);
    if (!referringUser) {
      throw new HttpException(REFERRAL_CODE_NOT_VALID, HttpStatus.NOT_FOUND);
    }

    const newReferralInvite = this.referralInviteRepository.create({
      accepted_by_id: { id: user_id },
      referred_by_id: { id: referringUser.id },
    });

    const savedReferralInvite =
      await this.referralInviteRepository.save(newReferralInvite);

    return classSerialiser(ReferralInvite, savedReferralInvite);
  }

  /**
   * get referral details
   * @param referral_uuid
   * @returns {ReferralInvite}
   */
  async getReferralInvite(referral_uuid: string): Promise<ReferralInvite> {
    const [referralInvite] = await this.referralInviteRepository.find({
      where: { referral_uuid: referral_uuid },
      relations: ['referred_by_id'],
    });

    // if referral invite does not exist
    if (!referralInvite) {
      throw new HttpException(REFERRAL_CODE_NOT_VALID, 400);
    }

    return classSerialiser(ReferralInvite, referralInvite);
  }

  /**
   * all referral invites of user
   * @returns {ReferralInvite[]} - create new column with email and status being pending
   */
  async allReferralInvites(
    user_id: number,
    status: string,
  ): Promise<ReferralInvite[]> {
    const query = status
      ? { referred_by_id: { id: user_id }, status }
      : { referred_by_id: { id: user_id } };

    const referralInvites = await this.referralInviteRepository.find({
      where: query,
      relations: [
        'accepted_by_id',
        'accepted_by_id.skills',
        'accepted_by_id.skills.skill_id',
        'accepted_by_id.assessments',
      ],
      order: { created_at: 'DESC' },
    });

    return referralInvites.map((invite) =>
      classSerialiser(ReferralInvite, invite),
    );
  }

  /**
   * Validates the given referral code by checking if a user exists and is hiring manager.
   *
   * @param referral_code - The referral code to validate.
   * @returns A promise that resolves to an object containing a boolean `isValid` property.
   */
  async validateReferralCode(
    referral_code: string,
  ): Promise<{ isValid: boolean }> {
    const isValid = true;

    // Check if the user exists with the given referral code
    const existingUser =
      await this.userService.findUserByReferralCode(referral_code);

    if (!existingUser) {
      return { isValid: false };
    }

    // check if the existing user's active referral count is less than the limit
    // const referralCount = await this.referralInviteRepository.count({
    //   where: {
    //     referred_by_id: { id: existingUser?.id },
    //     status: REFERRAL_INVITE_STATUS.accepted,
    //   },
    // });

    // if (referralCount > REFERRAL_INVITE_LIMIT) {
    //   isValid = false;
    // }

    return { isValid };
  }

  /**
   * Get the count of referrals made by a user grouped by status
   * @param user_id - The ID of the user
   * @returns {Promise<{ status: string, count: number }[]>} - The count of referrals grouped by status
   */
  async getReferralCount(
    user_id: number,
  ): Promise<{ status: string; count: number }[]> {
    // Count the number of invites by status for the loggedin user_id
    const referralCount = await this.referralInviteRepository
      .createQueryBuilder('referral')
      .select('referral.status', 'status')
      .addSelect('COUNT(referral.id)', 'count')
      .where('referral.referred_by_id = :user_id', { user_id })
      .groupBy('referral.status') // Group by status
      .getRawMany();

    return referralCount;
  }

  /**
   * Validates and updates the status of a candidate referral invite.
   *
   * @param id - The ID of the referral invite to validate.
   * @param referralDto - The data transfer object containing the updated status of the referral invite.
   * @param user_id - The ID of the user who referred the candidate.
   * @returns A promise that resolves to the updated ReferralInvite object.
   * @throws HttpException - If the referral invite does not exist.
   */
  async validateCandidateReferralInvite(
    id: number,
    referralDto: UpdateReferralInviteDto,
    user_id: number,
  ): Promise<ReferralInvite> {
    const { status } = referralDto;

    // check if token is valid
    const [referralInvite] = await this.referralInviteRepository.find({
      where: { id, referred_by_id: { id: user_id } },
      relations: ['accepted_by_id'],
    });

    if (!referralInvite) {
      throw new HttpException(REFERRAL_DOES_NOT_EXIST, HttpStatus.NOT_FOUND);
    }

    // if the status is accepted and the referral invite is pending, update the status to accepted
    if (
      status === REFERRAL_INVITE_STATUS.accepted &&
      referralInvite.accepted_by_id &&
      referralInvite.status === REFERRAL_INVITE_STATUS.pending
    ) {
      referralInvite.status = REFERRAL_INVITE_STATUS.accepted;
    }

    // if the status is declined and the referral invite is pending, update the status to declined
    if (
      status === REFERRAL_INVITE_STATUS.declined &&
      referralInvite.status === REFERRAL_INVITE_STATUS.pending
    ) {
      referralInvite.status = REFERRAL_INVITE_STATUS.declined;
    }

    const savedReferralInvite =
      await this.referralInviteRepository.save(referralInvite);

    return classSerialiser(ReferralInvite, savedReferralInvite);
  }

  /**
   * Creates a new referral testimonial.
   *
   * @param testimonialDto - The data transfer object containing the testimonial details.
   * @param user_id - The ID of the user creating the testimonial.
   * @returns A promise that resolves to the newly created ReferralInvite object.
   * @throws HttpException - If a referral invite with the same LinkedIn URL already exists.
   */
  async createReferralTestimonial(
    testimonialDto: UpdateReferralInviteDto,
    user_id: number,
  ): Promise<ReferralInvite> {
    const {
      video_asset_id,
      video_playback_id,
      notes,
      user_linkedin_url,
      user_name,
    } = testimonialDto;

    const [referralInvite] = await this.referralInviteRepository.find({
      where: { user_linkedin_url, referred_by_id: { id: user_id } },
      relations: ['accepted_by_id'],
    });

    if (referralInvite) {
      throw new HttpException(REFERRAL_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const newReferralInvite = this.referralInviteRepository.create({
      user_name,
      user_linkedin_url,
      video_asset_id,
      video_playback_id,
      notes,
      status: REFERRAL_INVITE_STATUS.pending,
      referred_by_id: { id: user_id },
    });

    const savedReferralInvite =
      await this.referralInviteRepository.save(newReferralInvite);
    this.eventSignalEmitter.emit(PUSH_EXTRACTED_URLS_TO_SQS_EVENT, {
      data: [user_linkedin_url],
    });
    return classSerialiser(ReferralInvite, savedReferralInvite);
  }

  /**
   * Updates an existing referral testimonial.
   *
   * @param id - The ID of the referral invite to be updated.
   * @param testimonialDto - The data transfer object containing the updated testimonial details.
   * @param user_id - The ID of the user updating the testimonial.
   * @returns A promise that resolves to the updated ReferralInvite object.
   * @throws HttpException - If the referral invite does not exist.
   */
  async updateReferralTestimonial(
    id: number,
    testimonialDto: UpdateReferralInviteDto,
    user_id: number,
  ): Promise<ReferralInvite> {
    const { video_asset_id, video_playback_id, notes } = testimonialDto;

    const [referralInvite] = await this.referralInviteRepository.find({
      where: { id, referred_by_id: { id: user_id } },
      relations: ['accepted_by_id'],
    });

    if (!referralInvite) {
      throw new HttpException(REFERRAL_DOES_NOT_EXIST, HttpStatus.NOT_FOUND);
    }

    referralInvite.video_asset_id = video_asset_id;
    referralInvite.video_playback_id = video_playback_id;
    referralInvite.notes = notes;

    const savedReferralInvite =
      await this.referralInviteRepository.save(referralInvite);

    return classSerialiser(ReferralInvite, savedReferralInvite);
  }

  /**
   * Get the public details of a referral testimonial.
   * @param uuid - The UUID of the referral testimonial.
   * @returns {Promise<ReferralInvite>} - The public details of the referral testimonial.
   * @throws {HttpException} - If the referral testimonial does not exist.
   */
  async getReferralTestimonialPublicDetails(
    uuid: string,
    user_id: number,
  ): Promise<ReferralInvite> {
    const [referralInvite] = await this.referralInviteRepository.find({
      where: { referral_uuid: uuid },
      relations: [
        'accepted_by_id',
        'referred_by_id',
        'referred_by_id.user_meta_info',
      ],
    });

    if (!referralInvite) {
      throw new HttpException(REFERRAL_DOES_NOT_EXIST, HttpStatus.NOT_FOUND);
    }

    const { user_linkedin_url: linkedin_url } = referralInvite;

    const extractedProfileDetails =
      await this.aiAgentsService.extractProfileDetails(linkedin_url);

    const referredByUserExtractedProfile =
      await this.aiAgentsService.extractProfileDetails(
        referralInvite.referred_by_id.user_meta_info.linkedin_url,
      );

    // remove the linkedin_url from the extracted profile details
    if (extractedProfileDetails?.linkedin_url) {
      extractedProfileDetails.linkedin_url = null;
    }

    const referralTestimonialDetails = classSerialiser(
      ReferralInvite,
      referralInvite,
    );

    if (user_id) {
      referralTestimonialDetails.user_linkedin_url =
        referralInvite.user_linkedin_url;
    }

    referralTestimonialDetails['profile_details'] = extractedProfileDetails;
    referralTestimonialDetails['referred_by_id']['profile_details'] =
      referredByUserExtractedProfile;

    return referralTestimonialDetails;
  }
}
