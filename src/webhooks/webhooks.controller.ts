import { Controller, Req } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { HmsRoomWebhookTypes } from 'src/_jigsaw/enums';
import { HMS_ROOM_WEBHOOK_XHMS_KEY } from 'src/_jigsaw/envDefaults';
import { WebhooksService } from './webhooks.service';

@Controller('/v1/webhooks')
export class WebhooksController {
  constructor(private readonly webhookService: WebhooksService) {}
  /**
   * /v1/webhooks/hms-recording
   * Handles the HMS recording webhook.
   * @param req - The request object containing headers and other request data.
   * @returns A success message if the API key is valid, otherwise an unauthorized error.
   */
  @Post('/hms-recording')
  async hmsRecording(@Req() req: any): Promise<any> {
    const apiKey = req.headers['x-100ms-key'];
    if (apiKey !== HMS_ROOM_WEBHOOK_XHMS_KEY) {
      throw new Error(`100ms webhook dump failed, ${req}`);
    }
    // Handle the recording success event
    if (
      req.body.type === HmsRoomWebhookTypes.recordingSuccess ||
      req.body.type === HmsRoomWebhookTypes.beamRecordingSuceess
    ) {
      await this.webhookService.handleRecordingSuccessEvent(req.body);
    }

    // Handle the recording failed event
    else if (
      req.body.type === HmsRoomWebhookTypes.recordingFailed ||
      req.body.type === HmsRoomWebhookTypes.beamRecordingFailed
    ) {
      throw new Error(` ${HmsRoomWebhookTypes.recordingFailed}, ${req.body}`);
    }
    return { success: true };
  }

  /**
   * /v1/webhooks/mux
   * Handles the Mux webhook.
   * @param req - The request object containing headers and other request data.
   * @returns A success message if the webhook is processed, otherwise an unauthorized error.
   */
  @Post('/mux')
  async handleWebhook(@Req() req: any): Promise<any> {
    // Process the webhook data from Mux
    const headers = req.headers;
    const payload = req.body;

    await this.webhookService.handleMuxWebhookCallBack(payload, headers);

    return { success: true };
  }

  /**
   * /v1/webhooks/stripe-payment
   * Handles the Stripe payment intent webhook.
   * @param req - The request object containing the payment intent data from Stripe.
   * @returns A success message after processing the webhook data.
   */
  @Post('/stripe-payment')
  async stripePayment(@Req() req: any): Promise<any> {
    const payload = req.body;
    const headers = req.headers;
    await this.webhookService.handleStripePayment(payload, headers);
    return { success: true };
  }

  /**
   * /v1/webhooks/unipile-auth-callback
   * Handles the Unipile authentication callback.
   * @param req - The request object containing the payload from Unipile.
   * @returns A success message after processing the webhook data.
   */
  @Post('/unipile-auth-callback')
  async unipileAuthCallback(@Req() req: any): Promise<any> {
    const payload = req.body;
    await this.webhookService.handleUnipileAuthCallback(payload);
    return { success: true };
  }
}
