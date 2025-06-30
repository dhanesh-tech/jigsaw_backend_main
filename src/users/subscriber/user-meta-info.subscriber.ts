import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
} from 'typeorm';
import { UserMetaInfo } from '../entities/user-meta-info.entity';
import { AwsService } from '../../aws/aws.service';
import { OnModuleInit } from '@nestjs/common';

@EventSubscriber()
export class UserMetaInfoSubscriber
  implements EntitySubscriberInterface<UserMetaInfo>, OnModuleInit
{
  private awsService: AwsService;
  constructor(
    private readonly awsServiceInstance: AwsService,
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit() {
    this.awsService = this.awsServiceInstance;
    this.dataSource.subscribers.push(this); // Register subscriber manually
  }

  listenTo() {
    return UserMetaInfo;
  }

  /**
   * This method is called after a UserMetaInfo entity is loaded from the database.
   * It updates the `resume` and `profile_image` properties of the entity with AWS signed URLs
   *
   * @param entity - The UserMetaInfo entity that has been loaded.
   * @returns A promise that resolves when the URLs have been updated.
   */
  async afterLoad(entity: UserMetaInfo): Promise<void> {
    if (this.awsService && entity.resume) {
      entity.resume = await this.awsService.getAwsSignedUrl(entity.resume);
    }
    if (this.awsService && entity.profile_image) {
      entity.profile_image = await this.awsService.getAwsSignedUrl(
        entity.profile_image,
      );
    }
  }
}
