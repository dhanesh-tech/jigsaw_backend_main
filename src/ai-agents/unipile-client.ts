import { Injectable } from '@nestjs/common';
import { UnipileClient } from 'unipile-node-sdk';
import { UNIPILE_ACCESS_TOKEN, UNIPILE_DSN } from 'src/_jigsaw/envDefaults';
import {
  UNIPILE_CONNECT_PROVIDERS,
  UNIPILE_AUTH_LINK_EXPIRATION_TIME,
} from './utilities/enums';
import {
  UNIPILE_NOTIFY_URL,
  UNIPILE_SUCCESS_REDIRECT_URL,
} from 'src/_jigsaw/frontendUrlsConst';
import { HostedAuthLinkResponse } from 'unipile-node-sdk/dist/types/hosted/hosted-auth-link.types';
import { ChatStartedApiResponse } from 'unipile-node-sdk/dist/types/messaging/chats/chat-start.types';
import { UserInviteApiResponse } from 'unipile-node-sdk/dist/types/users/user-invite.types';
import { UserProfileApiResponse } from 'unipile-node-sdk/dist/types/users/user-profile.types';
@Injectable()
export class UniPileClient {
  private unipileClient: UnipileClient;

  constructor() {
    this.unipileClient = new UnipileClient(UNIPILE_DSN, UNIPILE_ACCESS_TOKEN);
  }

  /**
   * Generates an onboarding link for a user.
   *
   * @param user_id - The name of the user for whom the onboarding link is generated.
   * @returns A promise that resolves to the response containing the onboarding link.
   */
  async getOnboardingLink(user_id: number): Promise<HostedAuthLinkResponse> {
    // 5 minutes
    const expiresOn = new Date(
      Date.now() + UNIPILE_AUTH_LINK_EXPIRATION_TIME,
    ).toISOString();
    const authLinkResponse =
      await this.unipileClient.account.createHostedAuthLink({
        type: 'create',
        api_url: UNIPILE_DSN,
        expiresOn,
        providers: UNIPILE_CONNECT_PROVIDERS,
        notify_url: UNIPILE_NOTIFY_URL,
        name: user_id.toString(),
        success_redirect_url: UNIPILE_SUCCESS_REDIRECT_URL,
        failure_redirect_url: UNIPILE_SUCCESS_REDIRECT_URL,
      });
    return authLinkResponse;
  }

  /**
   * Retrieves the profile of a user based on the account ID and identifier.
   *
   * @param account_id - The ID of the account.
   * @param identifier - The identifier for the user.
   * @returns A promise that resolves to the user's profile information.
   */
  async getUnipileProfile(
    account_id: string,
    identifier: string,
  ): Promise<UserProfileApiResponse> {
    const response = await this.unipileClient.users.getProfile({
      account_id,
      identifier,
    });
    return response;
  }

  /**
   * Sends an invitation to a user through a specified provider.
   *
   * @param account_id - The ID of the account sending the invitation.
   * @param provider_id - The ID of the provider through which the invitation is sent.
   * @param message - The message to be included in the invitation.
   * @returns A promise that resolves to the response of the invitation request.
   */
  async sendUnipileInvitation(
    account_id: string,
    provider_id: string,
    message: string,
  ): Promise<UserInviteApiResponse> {
    const response = await this.unipileClient.users.sendInvitation({
      account_id,
      provider_id: provider_id,
      message,
    });
    return response;
  }

  /**
   * Initiates a new chat with a user through a specified provider.
   *
   * @param account_id - The ID of the account initiating the chat.
   * @param provider_id - The ID of the provider through which the chat is initiated.
   * @param message - The message to start the chat with.
   * @returns A promise that resolves to the response of the chat initiation request.
   */
  async sendNewUnipileMessage(
    account_id: string,
    provider_id: string,
    message: string,
  ): Promise<ChatStartedApiResponse> {
    const response = await this.unipileClient.messaging.startNewChat({
      account_id: account_id,
      text: message,
      attendees_ids: [provider_id],
      options: {
        linkedin: {
          api: 'classic',
          inmail: false,
        },
      },
    });
    return response;
  }
}
