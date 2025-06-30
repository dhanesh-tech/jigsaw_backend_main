import {
  Controller,
  Get,
  Param,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Put, Body } from '@nestjs/common';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateCompanyDTO } from 'src/master/dto/company.dto';
import { UpdateUserMetaInfoDto } from './dto/user-meta-info.dto';
import { PublicAuthGuard } from 'src/auth/guards/public-auth.guard';
import {
  imageUploadInterceptor,
  resumeUploadInterceptor,
} from 'src/_jigsaw/helpersFunc';
import { FileInterceptor } from '@nestjs/platform-express';

// no route definitions as of now.
@Controller('/v1/users/')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Updates the user information based on the provided data.
   * /v1/users/
   * @param updateUserDto - Data Transfer Object containing the updated user information.
   * @param req - The request object containing user information.
   * @returns A promise that resolves to the updated user information.
   */
  @Put('/')
  @UseGuards(JwtAuthGuard)
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    const user_id = req?.user?.id;
    return await this.usersService.updateUser(user_id, updateUserDto);
  }

  /**
   * Retrieves the profile of the currently authenticated user.
   * /v1/users/me
   * @param req - The request object containing user information.
   * @returns A promise that resolves to the user's profile.
   */
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Req() req: any) {
    const user_id = req?.user?.id;
    return await this.usersService.findMyProfile(user_id);
  }

  /**
   * Retrieves the public profile of a user based on the provided hash ID.
   * /v1/users/profile/:hash_id
   * @param req - The request object.
   * @param hash_id - The hash ID of the user whose public profile is to be retrieved.
   * @returns A promise that resolves to the public profile of the user.
   */
  @Get('/profile/:hash_id')
  @UseGuards(PublicAuthGuard)
  async getUserPublicProfile(
    @Req() req: any,
    @Param('hash_id') hash_id: string,
  ) {
    return await this.usersService.findPublicProfile(hash_id);
  }

  /**
   * Sets the company information for a user.
   * /v1/users/set-company
   * @param companyDto - The data transfer object containing the company information to be updated.
   * @param req - The request object containing user information.
   * @returns A promise that resolves to the updated user company information.
   */
  @Put('/set-company')
  @UseGuards(JwtAuthGuard)
  async setUserCompany(@Body() companyDto: UpdateCompanyDTO, @Req() req: any) {
    const user_id = req?.user?.id;
    return await this.usersService.setUserCompany(companyDto, user_id);
  }

  /**
   * Updates the meta information of a user.
   * /v1/users/update-meta-info
   * @param userMetaInfoDto - Data transfer object containing the user's meta information to be updated.
   * @param req - The request object containing user information.
   * @returns A promise that resolves to the updated user meta information.
   */
  @Put('/update-meta-info')
  @UseGuards(JwtAuthGuard)
  async updateUserMetaInfo(
    @Body() userMetaInfoDto: UpdateUserMetaInfoDto,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return await this.usersService.updateUserMetaInfo(userMetaInfoDto, user_id);
  }

  /**
   * Updates the resume of the user.
   * /v1/users/update-meta-info/resume
   * @param resume - The uploaded resume file.
   * @param req - The request object containing user information.
   * @returns A promise that resolves to the updated user resume.
   */
  @Put('/update-meta-info/resume')
  @UseInterceptors(FileInterceptor('resume', resumeUploadInterceptor))
  @UseGuards(JwtAuthGuard)
  async updateUserResume(
    @UploadedFile() resume: Express.Multer.File,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return await this.usersService.updateUserResume(resume, user_id);
  }

  /**
   * Updates the profile image of the user.
   * /v1/users/update-meta-info/profile-image
   * @param profile_image - The uploaded profile image file.
   * @param req - The request object containing user information.
   * @returns A promise that resolves to the updated user profile image.
   */
  @Put('/update-meta-info/profile-image')
  @UseInterceptors(FileInterceptor('profile_image', imageUploadInterceptor))
  @UseGuards(JwtAuthGuard)
  async updateUserProfileImage(
    @UploadedFile() profile_image: Express.Multer.File,
    @Req() req: any,
  ) {
    const user_id = req?.user?.id;
    return await this.usersService.updateUserProfileImage(
      profile_image,
      user_id,
    );
  }
}
