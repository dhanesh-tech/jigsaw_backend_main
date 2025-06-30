import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { USER_ROLE } from 'src/users/utilities/enum';
import { ReferralQueryDto } from './dto/referral-query.dto';
import { plainToInstance } from 'class-transformer';
import { SignupLinkDto } from 'src/auth/dto/signup-link.dto';

@Controller('v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * v1/admin/referrals
   *
   * @query - status: string, user_id: string
   * @returns - all referral invites
   */
  @Get('/referrals')
  @UseGuards(JwtAuthGuard)
  @UserRole(USER_ROLE.admin)
  async getReferrals(
    @Req() req: any,
    @Query('status') status: string,
    @Query('referred_by_id') referred_by_id: number,
  ) {
    const queryDto = plainToInstance(ReferralQueryDto, {
      status,
      referred_by_id,
    });
    return this.adminService.getAllReferrals(queryDto);
  }

  /**
   * v1/admin/signup-link
   *
   * @query - email: string, role: string
   * @returns - all signup links
   */
  @Post('/signup-link')
  @UseGuards(JwtAuthGuard)
  @UserRole(USER_ROLE.admin)
  async getSignupLinks(@Req() req: any, @Body() signupLinkDto: SignupLinkDto) {
    const user_id = req.user.id;
    return this.adminService.createSignupLink(signupLinkDto, +user_id);
  }

  /**
   * v1/admin/signup-links/all
   * get referral details
   * @throws {HttpException} - If referral does not exist.
   */
  @Get('/signup-links/all')
  @UseGuards(JwtAuthGuard)
  @UserRole(USER_ROLE.admin)
  getAllSignupLinks(@Req() req: any) {
    const user_id = req.user.id;
    return this.adminService.getAllSignupLinks(+user_id);
  }
}
