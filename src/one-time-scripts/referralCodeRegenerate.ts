import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from 'src/users/users.service';
import {
  generateHashKeyOnEmail,
  generateShortUniqueUUID,
} from 'src/_jigsaw/helpersFunc';
import { USER_REFERRAL_CODE_LENGTH } from 'src/_jigsaw/constants';

/**
 * Bootstrap function to regenerate referral codes for users.
 *
 * This function initializes the NestJS application context, retrieves the
 * UsersService, and updates users who do not have a referral code. For each
 * user without a referral code, it generates a new referral code and a unique
 * hash ID (if not already present), then updates the user's record with these
 * values. The function logs the progress and the number of users updated.
 *
 * @async
 * @function bootstrap
 * @returns {Promise<void>} - A promise that resolves when the function completes.
 *
 * @throws {Error} - Throws an error if there is an issue executing the function.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const usersService = app.get(UsersService);

    const users = await usersService.findAllWhereReferralCodeIsNull();

    let counter = 1;

    for (const user of users) {
      // Generate referral code and hash ID for user
      const referralCode = generateHashKeyOnEmail(
        user.email,
        USER_REFERRAL_CODE_LENGTH,
      );
      const hash_id = user.hash_id || generateShortUniqueUUID(20);
      // Update user with referral code and hash ID
      await usersService.updateUserReferralCode(user.id, {
        referral_code: referralCode,
        hash_id: hash_id,
      });
      console.log(
        'Updating Users with referral code: ',
        referralCode,
        user.email,
        counter,
      );
      //   increase counter
      counter++;
    }

    console.log('Updated users without referral code: ', counter);
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
