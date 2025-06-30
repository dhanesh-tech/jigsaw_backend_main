import { User } from 'src/users/entities/user.entity';

/**
 * Data Transfer Object (DTO) for user email signup events.
 */
export class UserEmailSignupDto {
  user: User;
  email_token: string;
  password_reset_token: string;
}
