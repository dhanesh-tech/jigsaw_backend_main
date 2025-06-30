import { IsOptional, IsEnum, IsEmail } from 'class-validator';
import { USER_ROLE } from 'src/users/utilities/enum';

export class SignupLinkDto {
  @IsEnum(USER_ROLE)
  role: USER_ROLE;

  @IsOptional()
  @IsEmail()
  email: string;
}
