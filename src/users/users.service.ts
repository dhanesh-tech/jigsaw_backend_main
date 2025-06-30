import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { classSerialiser } from 'src/_jigsaw/helpersFunc';
import { UserTimezoneConstants } from 'src/_jigsaw/enums';
import { UpdateUserDto, UserReferralCodeDto } from './dto/user.dto';
import { UpdateCompanyDTO } from 'src/master/dto/company.dto';
import { MasterService } from 'src/master/master.service';
import { UserMetaInfo } from './entities/user-meta-info.entity';
import { UpdateUserMetaInfoDto } from './dto/user-meta-info.dto';
import { AwsService } from 'src/aws/aws.service';
import {
  AWS_PROFILE_IMAGE_UPLOAD_FOLDER,
  AWS_RESUME_UPLOAD_FOLDER,
} from 'src/_jigsaw/envDefaults';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { PUSH_EXTRACTED_URLS_TO_SQS_EVENT } from 'src/_jigsaw/eventSignalConstants';
import { AiAgentsService } from 'src/ai-agents/ai-agents.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserMetaInfo)
    private readonly userMetaInfoRepository: Repository<UserMetaInfo>,

    private readonly masterService: MasterService,

    private readonly awsService: AwsService,

    private readonly eventEmitter: EventEmitter,

    private readonly aiAgentsService: AiAgentsService,
  ) {}

  /**
   * Retrieves a user by their ID.
   *
   * @param id - The ID of the user to retrieve.
   * @returns A promise that resolves to the user entity.
   */
  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['user_meta_info', 'user_meta_info.country_id'],
    });
  }

  /**
   * Retrieves a user by their ID.
   *
   * @param id - The ID of the user to retrieve.
   * @returns A promise that resolves to the user entity.
   */
  async findAllWhereReferralCodeIsNull(): Promise<User[]> {
    return await this.userRepository.find({
      where: { referral_code: IsNull() },
    });
  }

  /**
   * Retrieves the profile of a user by their ID.
   *
   * @param user_id - The user_id of the user whose profile is to be retrieved.
   * @returns A promise that resolves to the user's profile, including their skills, referral invite, and meta information.
   */
  async findMyProfile(user_id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { id: user_id },
      relations: [
        'skills',
        'referral_invite',
        'user_meta_info',
        'user_meta_info.company_id',
        'user_meta_info.country_id',
        'assessments',
      ],
    });
  }

  /**
   * Finds and returns the public profile of a user based on the provided hash ID.
   *
   * @param hash_id - The unique hash ID of the user.
   * @returns A promise that resolves to the user's public profile.
   */
  async findPublicProfile(hash_id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { hash_id },
      relations: [
        'skills',
        'referral_invite',
        'user_meta_info',
        'user_meta_info.company_id',
        'user_meta_info.country_id',
        'assessments',
      ],
    });

    const candidateLinkedinDetails =
      await this.aiAgentsService.extractProfileDetails(
        user.user_meta_info.linkedin_url,
      );

    if (candidateLinkedinDetails?.linkedin_url) {
      delete candidateLinkedinDetails.linkedin_url;
    }

    const serializedUser = classSerialiser(User, user);

    serializedUser['profile_details'] = candidateLinkedinDetails;

    return serializedUser;
  }

  /**
   * Creates a new user with the provided user data.
   *
   * @param userDto - The data transfer object containing user details.
   * @returns A promise that resolves to the newly created user.
   */
  async createUser(userDto: any): Promise<User> {
    const { full_name, email, role, password, timezone, email_verified } =
      userDto;
    const newUser = this.userRepository.create({
      full_name,
      email,
      role,
      password,
      timezone: timezone || UserTimezoneConstants.UTC,
      is_superuser: false,
      is_active: true,
      is_verified: email_verified || false,
    });
    const savedUser = await this.userRepository.save(newUser);
    // create user meta info
    const newUserMetaInfo = await this.userMetaInfoRepository.create({
      user_id: { id: savedUser.id },
    });
    await this.userMetaInfoRepository.save(newUserMetaInfo);
    return savedUser;
  }

  /**
   * Retrieves a user by their email.
   *
   * @param email - The email of the user to retrieve.
   * @returns A promise that resolves to the user entity.
   */
  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  /**
   * Updates the password of a user.
   *
   * @param id - The ID of the user whose password is to be updated.
   * @param password - The new password.
   * @returns A promise that resolves when the password is updated.
   */
  async updateUserPassword(id: number, password: string): Promise<void> {
    await this.userRepository.update(id, { password });
    return;
  }

  /**
   * Updates the referral code of a user.
   *
   * @param id - The ID of the user whose referral code is to be updated.
   * @param userData - The data transfer object containing the new referral code.
   * @returns A promise that resolves when the referral code is updated.
   */
  async updateUserReferralCode(
    id: number,
    userData: UserReferralCodeDto,
  ): Promise<void> {
    const existingUser = await this.userRepository.findOne({ where: { id } });
    if (existingUser.referral_code) return;
    await this.userRepository.update(id, userData);
    return;
  }

  /**
   * Updates a user with the provided data.
   *
   * @param id - The ID of the user to update.
   * @param user - The data transfer object containing the updated user details.
   * @returns A promise that resolves to the updated user entity.
   */
  async updateUser(id: number, user: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, user);
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Retrieves a user by their referral code.
   *
   * @param referral_code - The referral code of the user to retrieve.
   * @returns A promise that resolves to the user entity.
   */
  async findUserByReferralCode(referral_code: string): Promise<User> {
    return this.userRepository.findOne({ where: { referral_code } });
  }

  /**
   * Sets the company information for a user.
   *
   * @param companyDto - The data transfer object containing the company details.
   * @param user_id - The ID of the user whose company information is to be set.
   * @returns A promise that resolves to the updated user meta information entity.
   */
  async setUserCompany(
    companyDto: UpdateCompanyDTO,
    user_id: number,
  ): Promise<UserMetaInfo> {
    const { domain_url } = companyDto;
    let savedCompany = await this.masterService.getCompanyFromUrl(domain_url);

    if (!savedCompany) {
      savedCompany = await this.masterService.createCompany({ domain_url });
    }
    await this.userMetaInfoRepository.update(
      { user_id: { id: user_id } },
      { company_id: { id: savedCompany.id } },
    );
    return this.userMetaInfoRepository.findOne({
      where: { user_id: { id: user_id } },
    });
  }

  /**
   * Updates the meta information of a user.
   *
   * @param metaInfo - The data transfer object containing the updated meta information.
   * @param user_id - The ID of the user whose meta information is to be updated.
   * @returns A promise that resolves to the updated user meta information entity.
   */
  async updateUserMetaInfo(
    metaInfo: UpdateUserMetaInfoDto,
    user_id: number,
  ): Promise<UserMetaInfo> {
    await this.userMetaInfoRepository.update(
      { user_id: { id: user_id } },
      metaInfo,
    );

    const updatedMetaInfo = await this.userMetaInfoRepository.findOne({
      where: { user_id: { id: user_id } },
    });

    // Emit event if LinkedIn URL was updated
    if (metaInfo.linkedin_url) {
      this.eventEmitter.emit(PUSH_EXTRACTED_URLS_TO_SQS_EVENT, {
        data: [metaInfo.linkedin_url],
      });
    }
    return updatedMetaInfo;
  }

  /**
   * Updates the resume of a user.
   *
   * @param file - The file containing the new resume.
   * @param user_id - The ID of the user whose resume is to be updated.
   * @returns A promise that resolves to the updated user meta information entity.
   */
  async updateUserResume(
    file: Express.Multer.File,
    user_id: number,
  ): Promise<UserMetaInfo> {
    const resumeUrl = await this.awsService.uploadFile(
      file,
      AWS_RESUME_UPLOAD_FOLDER,
    );

    await this.userMetaInfoRepository.update(
      { user_id: { id: user_id } },
      { resume: resumeUrl },
    );
    return this.userMetaInfoRepository.findOne({
      where: { user_id: { id: user_id } },
    });
  }

  /**
   * Updates the profile image of a user.
   *
   * @param file - The file containing the new profile image.
   * @param user_id - The ID of the user whose profile image is to be updated.
   * @returns A promise that resolves to the updated user meta information entity.
   */
  async updateUserProfileImage(
    file: Express.Multer.File,
    user_id: number,
  ): Promise<UserMetaInfo> {
    const imageUrl = await this.awsService.uploadFile(
      file,
      AWS_PROFILE_IMAGE_UPLOAD_FOLDER,
    );

    await this.userMetaInfoRepository.update(
      { user_id: { id: user_id } },
      { profile_image: imageUrl },
    );
    return this.userMetaInfoRepository.findOne({
      where: { user_id: { id: user_id } },
    });
  }
}
