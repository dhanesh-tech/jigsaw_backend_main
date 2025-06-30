import { Injectable } from '@nestjs/common';
import { AiAgentsService } from 'src/ai-agents/ai-agents.service';
import { HmsService } from 'src/hms/hms.service';
import { MuxService } from 'src/mux/mux.service';
import { PaymentService } from 'src/payment/payment.service';
@Injectable()
export class WebhooksService {
  constructor(
    private readonly hmsService: HmsService,
    private readonly muxService: MuxService,
    private readonly paymentService: PaymentService,
    private readonly aiAgentsService: AiAgentsService,
  ) {}

  async handleRecordingSuccessEvent(recordingDto: any) {
    await this.hmsService.hmsRoomRecordingMetaInfo(recordingDto);
  }

  async handleMuxWebhookCallBack(payload: any, headers: Headers) {
    await this.muxService.handleMuxAssetsWebhook(payload, headers);
  }

  async handleStripePayment(payload: any, headers: Headers) {
    await this.paymentService.handleStripePay(payload, headers);
  }

  async handleUnipileAuthCallback(payload: any) {
    await this.aiAgentsService.handleUnipileAuthCallback(payload);
  }
}
