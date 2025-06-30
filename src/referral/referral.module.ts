import { Module } from '@nestjs/common';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { UsersModule } from 'src/users/user.module';
import { ReferralInvite } from './entities/referralInvites.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAgentsModule } from 'src/ai-agents/ai-agents.module';

@Module({
  controllers: [ReferralController],
  providers: [ReferralService],

  imports: [
    TypeOrmModule.forFeature([ReferralInvite]),
    UsersModule,
    AiAgentsModule,
  ],
  exports: [ReferralService],
})
export class ReferralModule {}
