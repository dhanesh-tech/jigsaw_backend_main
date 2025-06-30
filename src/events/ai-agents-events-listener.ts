import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import axios from 'axios';
import { PUSH_EXTRACTED_URLS_TO_SQS_EVENT } from 'src/_jigsaw/eventSignalConstants';
import { PYTHON_LINKEDIN_SCRAPER_API_URL } from 'src/_jigsaw/frontendUrlsConst';

import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class AiAgentsEventsListener {
  constructor(
    private readonly logger: Logger,
    private readonly awsService: AwsService,
  ) {}

  /**
   * Handles the event when extracted URLs need to be pushed to SQS.
   * @param data - Array of extracted profile URLs to be processed.
   * @description Sends extracted URLs to SQS queue for profile extraction processing.
   */
  @OnEvent(PUSH_EXTRACTED_URLS_TO_SQS_EVENT)
  async handlePushExtractedUrlsToSqsEvent({ data }: { data: string[] }) {
    this.logger.log('Push Extracted URLs to SQS event received:', data);

    // Send extracted URLs to SQS for profile extraction processing
    if (data && data.length > 0) {
      await axios.post(PYTHON_LINKEDIN_SCRAPER_API_URL, {
        profile_urls: data,
      });
    } else {
      this.logger.warn('No extracted URLs data received for SQS processing');
    }
  }
}
