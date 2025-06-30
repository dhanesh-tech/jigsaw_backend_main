import { Injectable } from '@nestjs/common';
import { AwsS3Client } from './aws-s3-client';
import {
  AWS_HMS_RECORDING_S3_BUCKET_NAME,
  AWS_STORAGE_BUCKET_NAME,
  AWS_SQS_QUEUE_URL,
  AWS_SQS_MESSAGE_GROUP_ID,
} from 'src/_jigsaw/envDefaults';
import { AwsSqsClient } from './aws-sqs-client';
import { AiTranscriptionCompleteDto } from 'src/ai/dto/aiTranscriptionComplete.dto';
@Injectable()
export class AwsService {
  constructor(
    private readonly s3Client: AwsS3Client,
    private readonly sqsClient: AwsSqsClient,
  ) {}

  /**
   * Uploads a file to the specified folder in AWS S3.
   *
   * @param {Express.Multer.File} file - The file to be uploaded.
   * @param {string} folder - The folder path in S3 where the file will be uploaded.
   * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded file.
   * @throws {Error} - Throws an error if the file upload fails.
   */
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      const data = await this.s3Client.uploadFile(
        file,
        folder,
        AWS_STORAGE_BUCKET_NAME,
      );
      return data;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Retrieves a signed URL for accessing a file stored in AWS S3.
   *
   * @param fileKey - The key of the file in the S3 bucket.
   * @returns A promise that resolves to the signed URL as a string.
   * @throws An error if the signed URL could not be retrieved.
   */
  async getAwsSignedUrl(fileKey: string): Promise<string> {
    try {
      const url = await this.s3Client.getAwsSignedUrl(
        fileKey,
        AWS_STORAGE_BUCKET_NAME,
      );
      return url;
    } catch (error) {
      throw new Error(`Failed to get signed url: ${error.message}`);
    }
  }

  /**
   * Retrieves a signed URL for accessing a file stored in AWS S3 for 100ms.
   *
   * @param fileKey - The key of the file in the S3 bucket.
   * @returns A promise that resolves to the signed URL as a string.
   * @throws An error if the signed URL could not be retrieved.
   */
  async getHmsAwsSignedUrl(recording_path: string): Promise<string> {
    try {
      const parsedUrl = new URL(recording_path);
      // extract the file key from the URL
      const fileKey = parsedUrl.pathname.substring(1);
      const url = await this.s3Client.getAwsSignedUrl(
        fileKey,
        AWS_HMS_RECORDING_S3_BUCKET_NAME,
      );
      return url;
    } catch (error) {
      throw new Error(`Failed to get signed url: ${error}`);
    }
  }

  /**
   * Moves files from one folder to another in an AWS S3 bucket.
   *
   * @param sourceFileFolder - The source folder from which files will be moved.
   * @param movedFileFolder - The destination folder where files will be moved.
   * @throws An error if the files cannot be moved.
   */
  async moveAndDeleteAwsFiles(
    sourceFileFolder: string,
    movedFileFolder: string,
  ): Promise<string> {
    try {
      await this.s3Client.moveAndDeleteAwsFiles(
        sourceFileFolder,
        movedFileFolder,
        AWS_STORAGE_BUCKET_NAME,
      );
      return;
    } catch (error) {
      throw new Error(`Failed to run move file service: ${error}`);
    }
  }

  /**
   * Sends a message containing transcription completion details to the specified SQS queue.
   *
   * @param messageDto - The data transfer object containing the message details to be sent to the SQS queue.
   * @throws An error if the message could not be sent to the SQS queue.
   */
  async sendMessageToSqs(messageDto: AiTranscriptionCompleteDto) {
    const messageDeduplicationId = messageDto.asset_id;
    const message = JSON.stringify(messageDto);

    await this.sqsClient.sendMessage(
      message,
      AWS_SQS_QUEUE_URL,
      messageDeduplicationId,
      AWS_SQS_MESSAGE_GROUP_ID,
    );
  }
}
