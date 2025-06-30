import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtInterface } from './dto/jwt.dto';
import {
  createPasswordHash,
  validatePassword,
} from './utilities/password-encrypt-decrypt';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import {
  EMAIL_VERIFICATION_SUCCESS,
  ERROR_GETTING_PROFILE_FROM_GOOGLE,
  INVALID_USER_EMAIL_PASSWORD,
  INVALID_USER_ROLE,
  NEW_USER_SIGNUP_REFERRAL_CODE_EVENT,
  PASSWORD_RESET_LINK_SENT,
  PASSWORD_RESET_SUCCESS,
  TOKEN_ALREADY_USED,
  TOKEN_EXPIRED,
  TOKEN_NOT_VALID,
  USER_ALREADY_EXISTS,
  USER_EMAIL_SIGNUP_EVENT,
  USER_FORGOT_PASSWORD_EVENT,
} from 'src/_jigsaw/constants';
import { User } from 'src/users/entities/user.entity';
import {
  AuthorizedUser,
  ForgotPasswordDto,
  GoogleClientRegisterDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { GoogleAuthService } from 'src/google-auth/google-auth.service';
import { LoginMethodConstants, USER_ROLE } from 'src/users/utilities/enum';
import { UserSignupLink } from './entities/signup-links.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private googleAuthService: GoogleAuthService,
    private jwtService: JwtService,
    private readonly eventSignalEmitter: EventEmitter,

    @InjectRepository(UserSignupLink)
    private userSignupLinkRepository: Repository<UserSignupLink>,
  ) {}

  // get user from userService if the user exists and returns
  // takes payload as defined in dto file which contains user_id
  async validateUser(payload: JwtInterface): Promise<User> {
    return await this.usersService.findOne(+payload.user_id);
  }

  /**
   * Generates a JWT token for the given payload.
   *
   * @template T - The type of the payload, which can be an object or a Buffer.
   * @param {T} payload - The payload to be signed and included in the JWT token.
   * @returns {Promise<string>} - A promise that resolves to the generated JWT token as a string.
   */
  async generateToken<T extends object | Buffer>(payload: T): Promise<string> {
    return this.jwtService.sign(payload);
  }

  /**
   * Validates the provided JWT token.
   *
   * @param token - The JWT token to be validated.
   * @returns A promise that resolves with the decoded token if valid.
   * @throws {BadRequestException} If the token is invalid.
   */
  async validateToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw new BadRequestException(TOKEN_NOT_VALID);
    }
  }

  /**
   * Authenticates a user with the provided login credentials.
   *
   * @param {LoginDto} loginDto - The data transfer object containing the user's login credentials.
   * @returns {Promise<AuthorizedUser>} - A promise that resolves to an object containing the access token and user data.
   * @throws {BadRequestException} - If the email or password is invalid.
   */
  async loginUser(loginDto: LoginDto): Promise<AuthorizedUser> {
    const { email, password } = loginDto;
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException(INVALID_USER_EMAIL_PASSWORD);
    }
    const isPasswordMatching = await validatePassword(password, user?.password);
    if (!isPasswordMatching) {
      throw new BadRequestException(INVALID_USER_EMAIL_PASSWORD);
    }

    const payload = { user_id: user.id };

    return {
      access_token: await this.generateToken(payload),
      data: user,
    };
  }

  /**
   * Registers a new user with the provided signup details.
   *
   * @param signupDto - The data transfer object containing the user's signup details.
   * @returns A promise that resolves to an AuthorizedUser object containing the access token and user data.
   * @throws BadRequestException if a user with the provided email already exists.
   */
  async registerUser(signupDto: RegisterDto): Promise<AuthorizedUser> {
    const { email, full_name, role, signup_token } = signupDto;

    // allow only candidates to register directly
    if (role !== USER_ROLE.candidate) {
      if (!signup_token) {
        throw new BadRequestException(INVALID_USER_ROLE);
      }
      const { role: signupLinkRole } =
        await this.validateSignupLink(signup_token);

      if (role !== signupLinkRole) {
        throw new BadRequestException(INVALID_USER_ROLE);
      }
    }

    // check if user exists with the email
    const user = await this.usersService.findUserByEmail(email);
    if (user) {
      throw new BadRequestException(USER_ALREADY_EXISTS);
    }

    const password = createPasswordHash(`${email}${full_name}${role}`);

    const newUser = await this.usersService.createUser({
      email,
      full_name,
      role,
      password,
    });
    const payload = { user_id: newUser.id };
    // Generate a token for password reset
    const password_reset_token = await this.generateToken({
      user_id: newUser.id,
    });

    // Generate an email verification token
    const email_token = await this.generateToken({
      user_email: newUser.email,
    });

    if (signup_token) {
      this.validateSignupLinkAndUpdateUsed(signup_token, newUser.id);
    }

    // generate referral code and hash_id
    this.eventSignalEmitter.emit(NEW_USER_SIGNUP_REFERRAL_CODE_EVENT, newUser);

    // send email verification link
    this.eventSignalEmitter.emit(USER_EMAIL_SIGNUP_EVENT, {
      user: newUser,
      password_reset_token,
      email_token,
    });

    return {
      access_token: await this.generateToken(payload),
      data: newUser,
    };
  }

  /**
   * Verifies the user's email address using the provided email token.
   *
   * @param {VerifyEmailDto} verifyEmailDto - The DTO containing the email token.
   * @returns {Promise<{ message: string }>} - A promise that resolves to an object containing a success message.
   * @throws {BadRequestException} - Throws an exception if the token is invalid or the user does not exist.
   */
  async verifyUserEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    try {
      const { email_token } = verifyEmailDto;
      const { user_email } = await this.validateToken(email_token);
      const user = await this.usersService.findUserByEmail(user_email);
      if (!user_email || !user) {
        throw new BadRequestException(TOKEN_NOT_VALID);
      }
      // update user is verfiied to true
      await this.usersService.updateUser(user.id, {
        is_verified: true,
      });

      return { message: EMAIL_VERIFICATION_SUCCESS };
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  /**
   * Resets the user's password using the provided reset token and new password.
   *
   * @param {ResetPasswordDto} resetPasswordDto - Data transfer object containing the new password and reset token.
   * @returns {Promise<{ message: string }>} - A promise that resolves to an object containing a success message.
   * @throws {BadRequestException} - Throws an exception if the token is not valid or if there is an error during the process.
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { password, password_reset_token } = resetPasswordDto;

    try {
      const { user_id } = await this.validateToken(password_reset_token);
      const user = await this.usersService.findOne(user_id);

      if (!user || !user_id) {
        throw new BadRequestException(TOKEN_NOT_VALID);
      }
      const hashedPassword = createPasswordHash(password);
      await this.usersService.updateUserPassword(user.id, hashedPassword);

      return { message: PASSWORD_RESET_SUCCESS };
    } catch (error) {
      throw new BadRequestException(TOKEN_NOT_VALID);
    }
  }

  /**
   * Handles the forgot password functionality.
   * @param forgotPasswordDto - Data transfer object containing the email of the user who forgot their password.
   * @returns A promise that resolves to an object containing a message indicating that the password reset link has been sent.
   * @throws {BadRequestException} If no user with the provided email exists.
   */
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    const password_reset_token = await this.generateToken({ user_id: user.id });

    this.eventSignalEmitter.emit(USER_FORGOT_PASSWORD_EVENT, {
      user,
      password_reset_token,
    });

    return { message: PASSWORD_RESET_LINK_SENT };
  }

  /**
   * Registers a new user using Google authentication.
   *
   * @param signupDto - Partial data transfer object containing the Google token and user role.
   * @returns A promise that resolves to an AuthorizedUser object containing the access token and user data.
   * @throws BadRequestException if the user role is invalid or if there is an error getting the profile from Google.
   */
  async registerUserWithGoogle(
    signupDto: Partial<GoogleClientRegisterDto>,
  ): Promise<AuthorizedUser> {
    const { token, role, signup_token } = signupDto;

    const { email, full_name } =
      await this.googleAuthService.getUserMetaInfo(token);

    // check if email is returned
    if (email) {
      // check if user exists
      const user = await this.usersService.findUserByEmail(email);

      // if user exists return user
      if (user) {
        return {
          access_token: await this.generateToken({ user_id: user.id }),
          data: user,
        };
      }

      // allow only candidates to register directly
      if (role !== USER_ROLE.candidate) {
        if (!signup_token) {
          throw new BadRequestException(INVALID_USER_ROLE);
        }
        const { role: signupLinkRole } =
          await this.validateSignupLink(signup_token);

        if (role !== signupLinkRole) {
          throw new BadRequestException(INVALID_USER_ROLE);
        }
      }

      const password = createPasswordHash(`${email}${full_name}${role}`);

      // create user if user does not exist where email is verified and login method is google
      const newUser = await this.usersService.createUser({
        email,
        full_name,
        role,
        password,
        login_method: LoginMethodConstants.google,
        email_verified: true,
      });

      if (signup_token) {
        this.validateSignupLinkAndUpdateUsed(signup_token, newUser.id);
      }

      // generate referral code and hash_id
      this.eventSignalEmitter.emit(
        NEW_USER_SIGNUP_REFERRAL_CODE_EVENT,
        newUser,
      );

      return {
        access_token: await this.generateToken({ user_id: newUser.id }),
        data: newUser,
      };
    }

    throw new Error(ERROR_GETTING_PROFILE_FROM_GOOGLE);
  }

  /**
   * Validates a signup link.
   * @param token - The token to validate.
   * @returns A promise that resolves with the signup link result.
   */
  async validateSignupLink(
    token: string,
  ): Promise<{ role: string; email: string }> {
    const signupLink = await this.userSignupLinkRepository.findOne({
      where: { token },
    });

    if (!signupLink) {
      throw new HttpException(TOKEN_NOT_VALID, HttpStatus.BAD_REQUEST);
    }

    if (signupLink.expires_at < new Date()) {
      throw new HttpException(TOKEN_EXPIRED, HttpStatus.BAD_REQUEST);
    }

    // check if the signup link is used
    if (signupLink.used_by_id) {
      throw new HttpException(TOKEN_ALREADY_USED, HttpStatus.BAD_REQUEST);
    }

    return { role: signupLink.role, email: signupLink.email };
  }

  /**
   * Validates a signup link and updates the used_by_id field.
   * @param token - The token to validate.
   * @param user_id - The ID of the user to update.
   * @returns A promise that resolves with void.
   */
  async validateSignupLinkAndUpdateUsed(
    token: string,
    user_id: number,
  ): Promise<void> {
    const signupLink = await this.userSignupLinkRepository.findOne({
      where: { token },
    });

    if (!signupLink) {
      throw new HttpException(TOKEN_NOT_VALID, HttpStatus.BAD_REQUEST);
    }

    await this.userSignupLinkRepository.update(signupLink.id, {
      used_by_id: { id: user_id },
    });
    return;
  }
}
