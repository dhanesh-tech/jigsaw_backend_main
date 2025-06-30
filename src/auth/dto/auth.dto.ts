import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { USER_ROLE } from 'src/users/utilities/enum';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RegisterDto {
  full_name: string;

  @IsEmail()
  email: string;

  @IsEnum(USER_ROLE)
  role: USER_ROLE;

  @IsString()
  @IsOptional()
  signup_token: string;

  @IsString()
  @IsOptional()
  referral_code: string;
}

export class VerifyEmailDto {
  email_token: string;
}

export class ResetPasswordDto {
  password_reset_token: string;
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export interface AuthorizedUser {
  access_token: string;
  data: User;
}

export class GoogleClientRegisterDto {
  @IsString()
  token: string;

  @IsEnum(USER_ROLE)
  role: USER_ROLE;

  @IsString()
  @IsOptional()
  signup_token: string;

  @IsString()
  @IsOptional()
  referral_code: string;
}
