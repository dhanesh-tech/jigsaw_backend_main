import { Controller, Get, Query, Req, UseGuards, Res } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CALENDAR_DASHBOARD_URL } from 'src/_jigsaw/frontendUrlsConst';

@Controller('/v1/google-auth')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  /**
   * Handles the callback from the Google OAuth2.0 authorization flow.
   * /v1/google-auth/callback
   *
   * @param code - The authorization code received from Google.
   * @returns A promise that resolves to the callback response.
   */
  @Get('/callback')
  async handleCallback(
    @Query('code') code: string,
    @Res() res: any,
  ): Promise<void> {
    await this.googleAuthService.handleGoogleAuthCodeCallback(code);
    return res.redirect(CALENDAR_DASHBOARD_URL);
  }

  /**
   * Generates an authentication URL for the Google OAuth2.0 authorization flow.
   * /v1/google-auth/auth-url
   *
   * @returns A promise that resolves to the authentication URL.
   */
  @Get('/auth-url')
  @UseGuards(JwtAuthGuard)
  async getAuthenticationUrl(): Promise<{ url: string }> {
    return await this.googleAuthService.getAuthenticationUrl();
  }

  /**
   * Checks if a Google authentication token exists for the authenticated user.
   * /v1/google-auth/check-token
   *
   * @param req - The request object containing user information.
   * @returns A promise that resolves to an object indicating whether the Google authentication token exists for the user.
   */
  @Get('/check-token')
  @UseGuards(JwtAuthGuard)
  async checkToken(@Req() req: any): Promise<{ exists: boolean }> {
    const user_id = req?.user?.id;
    return this.googleAuthService.checkGoogleAuthTokenExists(user_id);
  }
}
