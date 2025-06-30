import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import {
  AWS_S3_ACCESS_KEY_ID,
  AWS_S3_REGION_NAME,
  AWS_S3_SECRET_ACCESS_KEY,
} from 'src/_jigsaw/envDefaults';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class AwsS3Client {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: AWS_S3_REGION_NAME,
      credentials: {
        accessKeyId: AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * Uploads a file to an S3 bucket.
   *
   * @param file - The file to be uploaded, provided by Multer.
   * @param folder - The folder path within the S3 bucket where the file will be stored.
   * @param bucketName - The name of the S3 bucket.
   * @returns A promise that resolves to the key of the uploaded file in the S3 bucket.
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    bucketName: string,
  ): Promise<string> {
    const fileKey = `${folder}/${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    return fileKey;
  }

  /**
   * Generates a signed URL for accessing an object in an AWS S3 bucket.
   *
   * @param fileKey - The key (path) of the file in the S3 bucket.
   * @param bucketName - The name of the S3 bucket.
   * @returns A promise that resolves to the signed URL as a string.
   */
  async getAwsSignedUrl(fileKey: string, bucketName: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    return url;
  }

  async moveAndDeleteAwsFiles(
    sourceFileFolder: string,
    movedFileFolder: string,
    bucketName: string,
  ): Promise<void> {
    try {
      // Move the files to the new location
      await this.copyFilesFromSourceFolder(
        sourceFileFolder,
        movedFileFolder,
        bucketName,
      );

      // Optionally, delete the files from the original location
      // await this.deleteFolder(bucketName, sourceFileFolder);
    } catch (error) {
      throw error; // Rethrow the error for the caller to handle if needed
    }
  }

  async copyFilesFromSourceFolder(
    sourceFileFolder: string,
    movedFileFolder: string,
    bucketName: string,
  ): Promise<string> {
    let count = 0;

    const copyFilesRecursively = async (
      token: string | undefined = undefined,
    ): Promise<void> => {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: sourceFileFolder,
        ContinuationToken: token,
      });

      try {
        const list = await this.s3.send(listCommand); // Get the list of files

        if (list.KeyCount && list.Contents) {
          // If items are present, process them
          const fromObjectKeys = list.Contents.map((content) => content.Key);
          for (const fromObjectKey of fromObjectKeys) {
            // Create the destination key -> Replace the source folder with the destination folder
            // e.g. jigsaw-storage/logo/1065_comp_logo-round-bordered.png -> logo/1065_comp_logo-round-bordered.png
            const toObjectKey = fromObjectKey.replace(
              `${sourceFileFolder}/`,
              '',
            );

            // Copy the file to the new location
            const copyCommand = new CopyObjectCommand({
              Bucket: bucketName,
              CopySource: `${bucketName}/${fromObjectKey}`,
              Key: toObjectKey,
            });
            await this.s3.send(copyCommand);

            // Increment the count and log the operation
            count++;
          }
        }

        // Continue with the next set of objects if there's a continuation token
        if (list.NextContinuationToken) {
          await copyFilesRecursively(list.NextContinuationToken);
        }
      } catch (error) {
        console.error('Error during file copy:', error);
        throw error; // Handle errors in the recursive operation
      }
    };

    // Start the recursive copy operation
    await copyFilesRecursively();

    console.log(`${count} files copied successfully.`);
    return;
  }
}
