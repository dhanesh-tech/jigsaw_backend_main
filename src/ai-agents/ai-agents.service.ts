import { BadRequestException, Injectable } from '@nestjs/common';
import { PUSH_EXTRACTED_URLS_TO_SQS_EVENT } from 'src/_jigsaw/eventSignalConstants';

import { Model, PipelineStage } from 'mongoose';
import { ExtractedProfileUrls } from './entity/profile-urls.schema';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { ExtractedProfileUrlsDto } from './dto/profile-urls.dto';
import { ProfileDetails } from './entity/profile-details.schema';
import { UniPileClient } from './unipile-client';

import { USER_NOT_ONBOARDED_ERROR } from 'src/_jigsaw/constants';
import { PublicProfileDetails } from './entity/public-profile-details.schema';
import { HostedAuthLinkResponse } from 'unipile-node-sdk/dist/types/hosted/hosted-auth-link.types';
import { ChatStartedApiResponse } from 'unipile-node-sdk/dist/types/messaging/chats/chat-start.types';
import { LinkedInInvitations } from './entity/linkedin-invitations.entity';
import { UnipileAccounts } from './entity/unipile-accounts.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReferralInvite } from 'src/referral/entities/referralInvites.entity';

@Injectable()
export class AiAgentsService {
  constructor(
    @InjectModel(ExtractedProfileUrls.name)
    private extractedProfileUrlsModel: Model<ExtractedProfileUrls>,

    @InjectModel(ProfileDetails.name)
    private profileDetailsModel: Model<ProfileDetails>,

    @InjectRepository(UnipileAccounts)
    private unipileAccountsRepository: Repository<UnipileAccounts>,

    @InjectModel(PublicProfileDetails.name)
    private publicProfileDetailsModel: Model<PublicProfileDetails>,

    @InjectRepository(LinkedInInvitations)
    private linkedInInvitationsRepository: Repository<LinkedInInvitations>,

    @InjectRepository(ReferralInvite)
    private referralInviteRepository: Repository<ReferralInvite>,

    private readonly eventEmitter: EventEmitter,
    private readonly unipileClient: UniPileClient,
  ) {}

  /**
   * Save extracted profile URLs to the database.
   * @param dtos - An array of DTOs containing LinkedIn URLs to be saved.
   * @returns An array of new records that were saved.
   */
  async saveExtractedProfileUrls(
    dtos: ExtractedProfileUrlsDto[],
  ): Promise<ExtractedProfileUrls[]> {
    if (!Array.isArray(dtos) || dtos.length === 0) {
      throw new BadRequestException('Input must be a non-empty array');
    }
    // Step 1: Dehash all URLs and build key-to-original mapping
    const dtoKeyMap = new Map(
      dtos.map((dto) => {
        const dehashedUserUrl = dto.user_url;
        const dehashedExtractedUrl = dto.extracted_url;
        if (dehashedUserUrl && dehashedExtractedUrl) {
          const key = `${dehashedUserUrl}-${dehashedExtractedUrl}`;
          return [
            key,
            {
              ...dto,
              user_url: dehashedUserUrl,
              extracted_url: dehashedExtractedUrl,
            },
          ];
        }
      }),
    );

    // Step 2: Query DB for existing records using dehashed URLs
    const existingRecords = await this.extractedProfileUrlsModel
      .find({
        $or: Array.from(dtoKeyMap.values()).map((dto) => ({
          user_url: dto.user_url,
          extracted_url: dto.extracted_url,
        })),
      })
      .select('user_url extracted_url');

    // Step 3: Create set of existing keys
    const existingKeySet = new Set(
      existingRecords.map(
        (record) => `${record.user_url}-${record.extracted_url}`,
      ),
    );

    // Step 4: Filter out only new records
    const newRecords = Array.from(dtoKeyMap.entries())
      .filter(([key]) => !existingKeySet.has(key))
      .map(([, dto]) => dto);

    const savedRecords =
      await this.extractedProfileUrlsModel.insertMany(newRecords);

    // Step 5: Emit and save new records
    if (savedRecords.length) {
      this.eventEmitter.emit(PUSH_EXTRACTED_URLS_TO_SQS_EVENT, {
        data: savedRecords.map((record) => record.extracted_url),
      });
    }
    return savedRecords;
  }

  /**
   * Retrieves extracted profile details from the database for a given LinkedIn URL.
   * @param {string} linkedin_url - The LinkedIn URL of the user whose profile details are to be retrieved.
   * @returns {Promise<ProfileDetails[]>} A promise that resolves to an array of ProfileDetails objects.
   */
  async getExtractedProfileDetails(
    linkedin_url: string,
  ): Promise<ProfileDetails[]> {
    const linkedin_user_name = linkedin_url.split('/in/')[1];
    const linkedin_user_name_without_slash = linkedin_user_name.split('/')[0];
    const endorsedLinkedinUrls = await this.referralInviteRepository.find({
      where: {
        user_linkedin_url: linkedin_url,
      },
    });
    const pipeline: PipelineStage[] = [
      {
        $match: {
          $expr: {
            $eq: [
              {
                $arrayElemAt: [
                  {
                    $split: [
                      { $arrayElemAt: [{ $split: ['$user_url', '/in/'] }, 1] },
                      '/',
                    ],
                  },
                  0,
                ],
              },
              linkedin_user_name_without_slash,
            ],
          },
        },
      },
      {
        $match: {
          $expr: {
            $not: {
              $in: [
                '$extracted_url',
                endorsedLinkedinUrls.map((url) => url.user_linkedin_url),
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'profiledetails', // MongoDB collection name for ProfileDetails
          localField: 'extracted_url',
          foreignField: 'linkedin_url',
          as: 'profileDetails',
        },
      },
      {
        $unwind: {
          path: '$profileDetails',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $replaceRoot: {
          newRoot: '$profileDetails',
        },
      },
      { $match: { likely_to_take_assessment: { $gt: 4 } } },
      { $sort: { likely_to_take_assessment: -1 } },
      { $limit: 20 },
    ];

    return this.extractedProfileUrlsModel.aggregate(pipeline);
  }

  /**
   * Gets the Unipile onboarding link for a user.
   * @param user_id - The name of the user requesting the onboarding link
   * @returns A promise that resolves to the onboarding link response containing the authentication URL
   */
  async getAccountOnboardingLink(
    user_id: number,
  ): Promise<HostedAuthLinkResponse> {
    const user = await this.unipileAccountsRepository.findOne({
      where: { user_id: { id: user_id } },
    });
    if (!user) {
      const response = await this.unipileClient.getOnboardingLink(user_id);
      return response;
    }
  }

  /**
   * Handles the callback from Unipile authentication.
   * @param payload - The callback payload containing account_id, name, and status
   * @returns A promise that resolves when the account information is saved
   */
  async handleUnipileAuthCallback(payload: any) {
    const { account_id, name, status } = payload;
    const user = await this.unipileAccountsRepository.save({
      account_id,
      user_id: { id: parseInt(name) },
      status,
    });
    return user;
  }

  //check if the user is onboarded
  async getConnectedAccounts(user_id: number) {
    const user = await this.unipileAccountsRepository.findOne({
      where: { user_id: { id: user_id } },
    });
    return user;
  }

  // send invitation to the user
  async getPublicProfileDetails(user_id: number, linkedin_url: string) {
    const user = await this.unipileAccountsRepository.findOne({
      where: { user_id: { id: user_id } },
    });
    // get the linkedin user name from the url
    const linkedin_user_name = linkedin_url.split('/in/')[1];
    const linkedin_user_name_without_slash = linkedin_user_name.split('/')[0];

    // check if the user detials are already present   in the database
    const publicProfileDetails = await this.publicProfileDetailsModel.findOne({
      public_identifier: linkedin_user_name_without_slash,
    });
    if (publicProfileDetails) {
      return publicProfileDetails;
    } else if (user && linkedin_user_name_without_slash) {
      // get the profile details from the unipile client
      const profileDetails = await this.unipileClient.getUnipileProfile(
        user.account_id,
        linkedin_user_name_without_slash,
      );
      // add the public profile details to the database
      const newPublicProfileDetails = new this.publicProfileDetailsModel(
        profileDetails,
      );
      await newPublicProfileDetails.save();
      return newPublicProfileDetails;
    }
    throw new BadRequestException(USER_NOT_ONBOARDED_ERROR);
  }

  // send invitation to the user
  async sendInvitationToUser(
    user_id: number,
    linkedin_url: string,
    message: string,
  ) {
    const profileDetails = await this.getPublicProfileDetails(
      user_id,
      linkedin_url,
    );

    const user = await this.unipileAccountsRepository.findOne({
      where: { user_id: { id: user_id } },
    });
    // check if the invitation is already present in the database
    const invitation = await this.linkedInInvitationsRepository.findOne({
      where: { provider_id: profileDetails.provider_id },
    });
    // if the invitation is present, initiate a new chat with the user
    if (invitation) {
      return this.initiateNewChatWith(
        message,
        profileDetails.provider_id,
        user.account_id,
      );
    } else if (user?.account_id) {
      // if the invitation is not present, send a new invitation to the user
      const newInvitation = await this.unipileClient.sendUnipileInvitation(
        user.account_id,
        profileDetails.provider_id,
        message,
      );
      // save the invitation to the database
      const newLinkedInInvitation = this.linkedInInvitationsRepository.create({
        provider_id: profileDetails.provider_id,
        invitation_id: newInvitation.invitation_id,
        status: newInvitation.object,
        message: message,
      });
      return this.linkedInInvitationsRepository.save(newLinkedInInvitation);
    }
  }

  /**
   * Initiates a new chat with a user through a specified provider.
   *
   * @param message - The message to start the chat with.
   * @param user_id - user id of the provider
   * @returns A promise that resolves to the response of the chat initiation request.
   */
  async initiateNewChatWith(
    message: string,
    provider_id: string,
    account_id: string,
  ): Promise<ChatStartedApiResponse> {
    // Note for Dhanesh -> get the account id and provider id from the user id
    const chat = await this.unipileClient.sendNewUnipileMessage(
      account_id,
      provider_id,
      message,
    );
    return chat;
  }

  /**
   * Extracts profile details from the database for a given LinkedIn URL.
   * @param linkedin_url - The LinkedIn URL of the user whose profile details are to be extracted.
   * @returns {ProfileDetails} - The profile details of the user.
   */
  async extractProfileDetails(linkedin_url: string): Promise<ProfileDetails> {
    const profileDetails = await this.profileDetailsModel.findOne({
      linkedin_url: linkedin_url,
    });
    return profileDetails;
  }
}
