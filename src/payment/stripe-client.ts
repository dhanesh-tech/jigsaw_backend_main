import Stripe from 'stripe';
import {
  STRIPE_ACCOUNT_ONBOARDING_LINK_TYPE,
  STRIPE_ACCOUNT_TYPE,
  STRIPE_RECENT_PAYMENTS_LIMIT,
  STRIPE_SIGNATURE_HEADER,
} from './utilities/enum';
import { PAYMENT_DASHBOARD_URL } from 'src/_jigsaw/frontendUrlsConst';
import { StripeUserAccountDto } from './dto/stripe-user-account.dto';
import {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
} from 'src/_jigsaw/envDefaults';
import { JobPaymentDto } from './dto/job-payment.dto';

export class StripeClient {
  private stripe: Stripe;

  constructor() {
    // this.stripe = new Stripe(STRIPE_SECRET_KEY);
  }

  /**
   * Creates a new Stripe account for collecting payments.
   *
   * @param user_id - The ID of the user for whom the account is being created.
   * @param role - The role of the user (e.g., 'admin', 'user').
   * @returns A promise that resolves to the newly created Stripe account object.
   */
  async createCollectAccount(
    createStripeAccountDto: StripeUserAccountDto,
  ): Promise<any> {
    const { country } = createStripeAccountDto;
    // set metadata with user_id and role
    const newAccount = await this.stripe.accounts.create({
      country: country,
      type: STRIPE_ACCOUNT_TYPE,
      metadata: {
        user_id: createStripeAccountDto.user_id,
        role: createStripeAccountDto.role,
        country: createStripeAccountDto.country,
      },
      capabilities: {
        transfers: {
          requested: true, // Enable transfers only for the account
        },
        bank_transfer_payments: {
          requested: true,
        },
        card_payments: {
          requested: true,
        },
      },
    });
    return newAccount;
  }

  /**
   * Creates an onboarding link for a Stripe account.
   *
   * @param account_id - The ID of the Stripe account for which the onboarding link is created.
   * @returns A promise that resolves to the account link object.
   */
  async createCollectAccountOnboardingLink(account_id: string): Promise<any> {
    const accountLink = await this.stripe.accountLinks.create({
      account: account_id,
      refresh_url: PAYMENT_DASHBOARD_URL,
      return_url: PAYMENT_DASHBOARD_URL,
      type: STRIPE_ACCOUNT_ONBOARDING_LINK_TYPE,
    });
    return accountLink;
  }

  /**
   * Retrieves the details of a Stripe account by its ID.
   *
   * @param account_id - The ID of the Stripe account to retrieve.
   * @returns A promise that resolves to the account object containing details of the account.
   */
  async getAccountDetails(account_id: string): Promise<any> {
    const account = await this.stripe.accounts.retrieve(account_id);
    return account;
  }

  /**
   * Creates a session for managing a connected Stripe account.
   *
   * @param account_id - The ID of the Stripe account for which the session is created.
   * @returns A promise that resolves to the session object containing details of the account management session.
   */
  async createConnectAccountSession(account_id: string): Promise<any> {
    const session = await this.stripe.accountSessions.create({
      account: account_id,
      components: {
        payments: {
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            capture_payments: true,
          },
        },
        payouts: {
          enabled: true,
          features: {
            standard_payouts: true,
            instant_payouts: true,
            external_account_collection: true,
          },
        },
        account_management: {
          enabled: true,
          features: {
            external_account_collection: true,
          },
        },
      },
    });
    return session;
  }

  /**
   * Creates a payment intent in Stripe for a job payment.
   *
   * @param {JobPaymentDto} jobPaymentDto - The data transfer object containing job payment details.
   * @returns {Promise<Stripe.PaymentIntent>} - The created payment intent object.
   */
  async createPaymentIntent(
    jobPaymentDto: JobPaymentDto,
  ): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: jobPaymentDto.job_total_ctc,
      currency: jobPaymentDto.currency,
      customer: jobPaymentDto.user_id.toString(),
      automatic_payment_methods: {
        enabled: false,
      },
      metadata: { ...jobPaymentDto },
    });
    return paymentIntent;
  }

  /**
   * Verifies a webhook event from Stripe.
   *
   * @param {any} payload - The payload of the webhook event.
   * @returns {Promise<boolean>} - A promise that resolves to true if the webhook is verified, false otherwise.
   */
  async verifyWebhook(payload: any, headers: Headers): Promise<Stripe.Event> {
    const payloadString = JSON.stringify(payload);
    const event = this.stripe.webhooks.constructEvent(
      payloadString,
      headers[STRIPE_SIGNATURE_HEADER],
      STRIPE_WEBHOOK_SECRET,
    );
    return event;
  }

  /**
   * Retrieves a list of recent payment intents for a specific user.
   *
   * @param {number} user_id - The ID of the user whose payment intents are being retrieved.
   * @returns {Promise<Stripe.ApiList<Stripe.PaymentIntent>>} - A promise that resolves to a paginated list of payment intent objects.
   */
  async getRecentPayments(
    user_id: number,
  ): Promise<Stripe.ApiList<Stripe.PaymentIntent>> {
    const payments = await this.stripe.paymentIntents.list({
      customer: user_id.toString(),
      limit: STRIPE_RECENT_PAYMENTS_LIMIT,
    });
    return payments;
  }

  async deleteStripeAccount(account_id: string): Promise<any> {
    // const account = await this.stripe.accounts.retrieve(account_id);
    // if (account.deleted) {
    //   return account;
    // }
    const deletedAccount = await this.stripe.accounts.del(account_id);
    return deletedAccount;
  }
}
