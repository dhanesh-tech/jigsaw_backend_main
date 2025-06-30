import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { HmsModule } from 'src/hms/hms.module';
import { MuxModule } from 'src/mux/mux.module';
import { PaymentModule } from 'src/payment/payment.module';
import { AiAgentsModule } from 'src/ai-agents/ai-agents.module';
@Module({
  controllers: [WebhooksController],
  providers: [WebhooksService],
  imports: [HmsModule, MuxModule, PaymentModule, AiAgentsModule],
})
export class WebhooksModule {}
