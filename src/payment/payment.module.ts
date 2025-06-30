import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { UsersModule } from 'src/users/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeUserAccount } from './entities/stripe-user-account.entity';
import { StripeClient } from './stripe-client';
import { JobRequirementModule } from 'src/job-requirement/job-requirement.module';
import { StripeWebhookEvent } from './entities/stripe-webhook-event.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([StripeUserAccount, StripeWebhookEvent]),
    JobRequirementModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, StripeClient],
  exports: [PaymentService],
})
export class PaymentModule {}
