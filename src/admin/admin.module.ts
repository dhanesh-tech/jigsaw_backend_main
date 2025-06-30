import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralInvite } from 'src/referral/entities/referralInvites.entity';
import { UserSignupLink } from 'src/auth/entities/signup-links.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReferralInvite, UserSignupLink])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
