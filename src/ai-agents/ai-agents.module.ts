import { Module } from '@nestjs/common';
import { AiAgentsController } from './ai-agents.controller';
import { AiAgentsService } from './ai-agents.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ExtractedProfileUrls,
  ExtractedProfileUrlsSchema,
} from './entity/profile-urls.schema';
import {
  ProfileDetails,
  ProfileDetailsSchema,
} from './entity/profile-details.schema';
import {
  ExtractJsonDump,
  ExtractJsonDumpSchema,
} from './entity/extract-json-dump.schema';
import { UniPileClient } from './unipile-client';
import { UnipileAccounts } from './entity/unipile-accounts.entity';
import {
  PublicProfileDetails,
  PublicProfileDetailsSchema,
} from './entity/public-profile-details.schema';
import { LinkedInInvitations } from './entity/linkedin-invitations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralInvite } from 'src/referral/entities/referralInvites.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UnipileAccounts,
      LinkedInInvitations,
      ReferralInvite,
    ]),
    MongooseModule.forFeature([
      {
        name: ExtractedProfileUrls.name,
        schema: ExtractedProfileUrlsSchema,
      },
      {
        name: ProfileDetails.name,
        schema: ProfileDetailsSchema,
      },
      {
        name: ExtractJsonDump.name,
        schema: ExtractJsonDumpSchema,
      },
      {
        name: PublicProfileDetails.name,
        schema: PublicProfileDetailsSchema,
      },
    ]),
  ],
  controllers: [AiAgentsController],
  providers: [AiAgentsService, UniPileClient],
  exports: [AiAgentsService],
})
export class AiAgentsModule {}
