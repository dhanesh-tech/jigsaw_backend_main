import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AiAgentsService } from './ai-agents.service';
import { ExtractedProfileUrlsDtoWrapper } from './dto/profile-urls.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { USER_ROLE } from 'src/users/utilities/enum';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { SendInvitationDto } from './dto/ai-agents.dto';
import { ExtractedProfileUrls } from './entity/profile-urls.schema';
import { ProfileDetails } from './entity/profile-details.schema';
import { HostedAuthLinkResponse } from 'unipile-node-sdk/dist/types/hosted/hosted-auth-link.types';
/**
 * Controller for handling AI agent related operations
 * @class AiAgentsController
 */
@Controller('/v1/ai-agents')
export class AiAgentsController {
  constructor(private readonly aiAgentsService: AiAgentsService) {}

  /**
   * Save extracted LinkedIn profile links.
   * @param {ExtractedProfileUrlsDtoWrapper} createExtractedLinkedinUrlsDto - The data transfer object containing the extracted LinkedIn URLs
   * @returns {Promise<any>} The saved extracted profile URLs
   * @route POST /v1/ai-agents/profile-links
   */
  @Post('profile-links')
  async saveExtractedProfileLinks(
    @Body() createExtractedLinkedinUrlsDto: ExtractedProfileUrlsDtoWrapper,
  ): Promise<ExtractedProfileUrls[]> {
    return this.aiAgentsService.saveExtractedProfileUrls(
      createExtractedLinkedinUrlsDto.urls,
    );
  }

  /**
   * Get extracted profile details for the authenticated user.
   * @param {any} req - The request object containing user information
   * @returns {Promise<any>} The extracted profile details
   * @route GET /v1/ai-agents/profile-details
   */
  @Get('profile-details')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.admin)
  async getExtractedProfileDetails(
    @Request() req: any,
  ): Promise<ProfileDetails[]> {
    const user_linkedin_url = req?.user?.user_meta_info?.linkedin_url;
    return this.aiAgentsService.getExtractedProfileDetails(user_linkedin_url);
  }

  /**
   * Get the account link for the authenticated user.
   * @param {any} req - The request object containing user information
   * @returns {Promise<any>} The account link
   * @route GET /v1/ai-agents/account-link
   */
  @Get('account-link')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.admin)
  async getAccountOnboardingLink(
    @Request() req: any,
  ): Promise<HostedAuthLinkResponse> {
    const user_id = req?.user?.id;
    return await this.aiAgentsService.getAccountOnboardingLink(+user_id);
  }

  /**
   * Check if the authenticated user has completed onboarding.
   * @param {any} req - The request object containing user information
   * @returns {Promise<any>} Boolean indicating if the user is onboarded
   * @route GET /v1/ai-agents/is-onboarded
   */
  @Get('connected-accounts')
  @UseGuards(JwtAuthGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.admin)
  async getConnectedAccounts(@Request() req: any) {
    const user_id = req?.user?.id;
    return this.aiAgentsService.getConnectedAccounts(+user_id);
  }

  @Post('send-invitation')
  @UseGuards(JwtAuthGuard)
  @UserRole(USER_ROLE.mentor, USER_ROLE.admin)
  async sendInvitationToUser(
    @Request() req: any,
    @Body() body: SendInvitationDto,
  ) {
    const user_id = req?.user?.id;
    const linkedin_url = body?.linkedin_url;

    // Note for Dhanesh -> get the message from the body or use the constant message
    const message =
      body?.message ||
      'Hello, I am inviting you to join me on LinkedIn. Please accept my invitation.';
    return this.aiAgentsService.sendInvitationToUser(
      user_id,
      linkedin_url,
      message,
    );
  }
}
