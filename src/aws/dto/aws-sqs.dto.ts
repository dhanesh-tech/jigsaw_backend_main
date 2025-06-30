/**
 * Data Transfer Object for AWS SQS messages.
 * This class defines the structure of the message to be sent to an SQS queue.
 */
export class AwsSqsDto {
  readonly message: string;
  readonly queue_url: string;
  readonly messageAttributes?: string;
}
