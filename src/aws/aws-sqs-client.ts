import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { SQS_MESSAGE_SEND_ERROR } from 'src/_jigsaw/constants';
import {
  AWS_SQS_REGION_NAME,
  AWS_S3_ACCESS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY,
} from 'src/_jigsaw/envDefaults';

export class AwsSqsClient {
  private sqsClient: SQSClient;

  constructor() {
    this.sqsClient = new SQSClient({
      region: AWS_SQS_REGION_NAME,
      credentials: {
        accessKeyId: AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * Sends a message to the specified SQS queue.
   *
   * @param message - The message to be sent to the queue.
   * @returns A promise that resolves when the message has been sent.
   * @throws An error if the message could not be sent.
   */
  async sendMessage(
    message: string,
    queue_url: string,
    message_deduplication_id: string,
    message_group_id: string,
  ) {
    try {
      const command = new SendMessageCommand({
        QueueUrl: queue_url,
        MessageBody: message,
        MessageGroupId: message_group_id,
        MessageDeduplicationId: message_deduplication_id,
      });
      // Send the command using the SQS client
      const sentMessage = await this.sqsClient.send(command);
      console.log('Message sent to SQS:', sentMessage);
    } catch (error) {
      console.log('Error sending message to SQS:', error);
      throw new Error(`${SQS_MESSAGE_SEND_ERROR}: ${error}`);
    }
  }
}
