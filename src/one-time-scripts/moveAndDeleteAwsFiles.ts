import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AwsService } from '../aws/aws.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const awsService = app.get(AwsService);

    const sourceFileFolder = 'jigsaw-storage-production';
    const movedFileFolder = 'resumes';
    // Call the specific function
    await awsService.moveAndDeleteAwsFiles(sourceFileFolder, movedFileFolder);
    console.log(
      'Function executed successfully: ------- moveAndDeleteAwsFiles',
    );
  } catch (error) {
    console.error(
      'Error executing function: ------- moveAndDeleteAwsFiles',
      error,
    );
  } finally {
    await app.close();
  }
}

bootstrap();
