import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post, Body } from '@nestjs/common';
import {
  AuthorizedUser,
  ForgotPasswordDto,
  GoogleClientRegisterDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { USER_ROLE } from 'src/users/utilities/enum';
import { INVALID_USER_ROLE } from 'src/_jigsaw/constants';

@Controller('/v1/rest-auth/')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Handles user login requests.
   * /v1/rest-auth/login
   * @param loginDto - The data transfer object containing login credentials.
   * @returns A promise that resolves with the login result.
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthorizedUser> {
    return this.authService.loginUser(loginDto);
  }

  /**
   * Handles user registration requests.
   * /v1/rest-auth/register
   * @param RegisterDto - The data transfer object containing registration details.
   * @returns A promise that resolves with the registration result.
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthorizedUser> {
    // do not allow mentors or admin to sign up
    const { role } = registerDto;
    if (role === USER_ROLE.mentor || role === USER_ROLE.admin) {
      throw new BadRequestException(INVALID_USER_ROLE);
    }
    return this.authService.registerUser(registerDto);
  }

  /**
   * Handles email verification requests.
   * /v1/rest-auth/verify-email
   * @param verifyEmailDto - The data transfer object containing email verification details.
   * @returns A promise that resolves with the email verification result.
   */
  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<any> {
    return this.authService.verifyUserEmail(verifyEmailDto);
  }

  /**
   * Handles password reset requests.
   * /v1/rest-auth/reset-password
   * @param resetPasswordDto - The data transfer object containing password reset details.
   * @returns A promise that resolves with the password reset result.
   */
  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<any> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * Handles forgot password requests.
   * /v1/rest-auth/forgot-password
   * @param forgotPasswordDto - The data transfer object containing forgot password details.
   * @returns A promise that resolves with the forgot password result.
   */
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<any> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * Authenticates a user using Google credentials.
   *
   * @param registerDto - Partial data transfer object containing Google client registration details.
   * @returns A promise that resolves to authorized user information.
   */
  @Post('/google')
  async authenticateUserWithGoogle(
    @Body() registerDto: Partial<GoogleClientRegisterDto>,
  ): Promise<AuthorizedUser> {
    return this.authService.registerUserWithGoogle(registerDto);
  }

  /**
   * Handles signup link requests.
   * /v1/rest-auth/validate-signup-token/:token
   * @param signupLinkDto - The data transfer object containing signup link details.
   * @returns A promise that resolves with the signup link result.
   */
  @Get('/validate-signup-token/:token')
  async validateSignupLink(@Param('token') token: string): Promise<any> {
    return this.authService.validateSignupLink(token);
  }
}
