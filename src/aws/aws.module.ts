import { Module } from '@nestjs/common';
import { AwsController } from './aws.controller';
import { AwsService } from './aws.service';
import { AwsS3Client } from './aws-s3-client';
import { AwsSqsClient } from './aws-sqs-client';
@Module({
  controllers: [AwsController],
  providers: [AwsService, AwsS3Client, AwsSqsClient],
  exports: [AwsService],
})
export class AwsModule {}
