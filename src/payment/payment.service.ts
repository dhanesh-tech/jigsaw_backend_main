import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StripeUserAccount } from './entities/stripe-user-account.entity';
import { StripeClient } from './stripe-client';
import {
  STRIPE_ACCOUNT_CREATE_ERROR,
  JOB_REQ_NOT_FOUND_ERROR,
  STRIPE_ACCOUNT_FETCH_ERROR,
  ACCOUNT_COUNTRY_NOT_FOUND,
  STRIPE_ACCOUNT_NOT_FOUND,
} from 'src/_jigsaw/constants';
import { classSerialiser } from 'src/_jigsaw/helpersFunc';
import { UsersService } from 'src/users/users.service';
import { USER_ROLE } from 'src/users/utilities/enum';
import { JobRequirementService } from 'src/job-requirement/job-requirement.service';
import { JOB_PAYMENT_PERCENTAGE } from 'src/_jigsaw/envDefaults';
import { JobPaymentDto } from './dto/job-payment.dto';
import { STRIPE_ACCOUNT_STATUS, STRIPE_PAYMENT_STATUS } from './utilities/enum';
import { Stripe } from 'stripe';
import { StripeWebhookEvent } from './entities/stripe-webhook-event.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(StripeUserAccount)
    private stripeUserAccountRepository: Repository<StripeUserAccount>,
    @InjectRepository(StripeWebhookEvent)
    private stripeWebhookEventRepository: Repository<StripeWebhookEvent>,
    private userService: UsersService,
    private jobService: JobRequirementService,
    private stripeClient: StripeClient,
  ) {}

  /**
   * Creates a new Stripe user account based on the provided data transfer object.
   *
   * @param createStripeAccountDto - The data transfer object containing user ID and other account details.
   * @returns {Promise<StripeUserAccount>} - object of StripeUserAccount entity.
   */
  async createStripeUserAccount(user_id: number): Promise<StripeUserAccount> {
    const existingUser = await this.userService.findOne(user_id);

    if (!existingUser || existingUser?.role === USER_ROLE.candidate) {
      throw new UnauthorizedException();
    }

    const country = existingUser.user_meta_info.country_id?.iso2;

    if (!country) {
      throw new Error(ACCOUNT_COUNTRY_NOT_FOUND);
    }

    const account = await this.stripeClient.createCollectAccount({
      user_id,
      role: existingUser.role,
      country,
    });

    if (!account) {
      throw new Error(STRIPE_ACCOUNT_CREATE_ERROR);
    }

    const stripeUserAccount = await this.stripeUserAccountRepository.create({
      user_id: { id: user_id },
      account_id: account.id,
      status: STRIPE_ACCOUNT_STATUS.pending,
    });

    return this.stripeUserAccountRepository.save(stripeUserAccount);
  }

  /**
   * Retrieves the Stripe user account for a given user ID.
   *
   * @param user_id - The ID of the user whose Stripe account is to be retrieved.
   * @returns {Promise<StripeUserAccount>} - object of StripeUserAccount entity.
   */
  async fetchStripeUserAccount(user_id: number): Promise<StripeUserAccount> {
    const stripeUserAccount = await this.stripeUserAccountRepository.findOne({
      where: { user_id: { id: user_id } },
    });

    return classSerialiser(StripeUserAccount, stripeUserAccount);
  }

  /**
   * Creates a session for the Stripe account associated with the given user ID.
   *
   * @param user_id - The ID of the user for whom the session is to be created.
   * @returns {Promise<{ client_secret: string }>} - object containing the client secret for the session.
   */
  async createStripeAccountSession(
    user_id: number,
  ): Promise<{ client_secret: string }> {
    const stripeUserAccount = await this.fetchStripeUserAccount(user_id);

    if (!stripeUserAccount) {
      throw new HttpException(STRIPE_ACCOUNT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const session = await this.stripeClient.createConnectAccountSession(
      stripeUserAccount.account_id,
    );

    const { client_secret } = session;

    return { client_secret };
  }

  /**
   * Creates a Stripe account link for a given user ID.
   *
   * @param user_id - The ID of the user for whom the account link is to be created.
   * @returns {Promise<{ url: string }>} - object containing the URL for the account link.
   */
  async createStripeAccountLink(user_id: number): Promise<{ url: string }> {
    let stripeUserAccount = await this.fetchStripeUserAccount(user_id);

    if (!stripeUserAccount) {
      stripeUserAccount = await this.createStripeUserAccount(user_id);
    }

    if (!stripeUserAccount?.account_id) {
      throw new Error(STRIPE_ACCOUNT_FETCH_ERROR);
    }

    const account_link =
      await this.stripeClient.createCollectAccountOnboardingLink(
        stripeUserAccount.account_id,
      );

    const { url } = account_link;

    return { url };
  }

  /**
   * Creates a Stripe payment intent for a given job ID.
   *
   * @param job_id - The ID of the job for which the payment intent is to be created.
   * @param user_id - The ID of the user for whom the payment intent is to be created.
   * @returns {Promise<Stripe.PaymentIntent>} - The created payment intent object.
   */
  async createJobPaymentIntent(
    job_id: number,
    user_id: number,
  ): Promise<Stripe.PaymentIntent> {
    const jobRequirement = await this.jobService.findMyJobRequirement(
      job_id,
      user_id,
    );

    if (!jobRequirement) {
      throw new HttpException(
        JOB_REQ_NOT_FOUND_ERROR(job_id),
        HttpStatus.NOT_FOUND,
      );
    }

    const jobAmount = jobRequirement.payment_to;
    const paymentAmount = Math.floor(
      (jobAmount * JOB_PAYMENT_PERCENTAGE) / 100,
    );

    const stripePaymentDto: JobPaymentDto = {
      job_id,
      user_id,
      job_total_ctc: jobAmount,
      percentage: JOB_PAYMENT_PERCENTAGE,
      fee: paymentAmount,
      currency: jobRequirement.payment_currency,
    };

    const paymentIntent =
      await this.stripeClient.createPaymentIntent(stripePaymentDto);

    return paymentIntent;
  }

  /**
   * Handles Stripe webhook events by verifying, saving, and processing them based on event type.
   *
   * @param payload - The raw webhook payload received from Stripe
   * @param headers - HTTP headers containing the Stripe signature for verification
   * @returns {Promise<void>} - A promise that resolves when the webhook has been processed
   */
  async handleStripePay(payload: any, headers: Headers): Promise<void> {
    const event = await this.stripeClient.verifyWebhook(payload, headers);

    const webhookEvent = this.stripeWebhookEventRepository.create({
      event_id: event.id,
      type: event.type,
      data: event.data.object,
      processed: false,
    });
    await this.stripeWebhookEventRepository.save(webhookEvent);

    switch (event.type) {
      case STRIPE_PAYMENT_STATUS.checkoutCompleted:
        // Handle checkout completed event
        break;
      case STRIPE_PAYMENT_STATUS.invoicePaid:
        // Handle invoice paid event
        break;
      case STRIPE_PAYMENT_STATUS.paymentIntentSucceeded:
        // Handle payment intent succeeded event
        break;
      case STRIPE_PAYMENT_STATUS.payoutPaid:
        // Handle payout paid event
        break;
      default:
        // Handle unhandled event types
        break;
    }
  }

  /**
   * Retrieves recent payment intents for a specific user.
   *
   * @param user_id - The ID of the user whose payment history is being requested
   * @returns {Promise<Stripe.PaymentIntent[]>} - A promise that resolves to an array of payment intent objects
   */
  async getRecentPayments(user_id: number): Promise<Stripe.PaymentIntent[]> {
    const payments = await this.stripeClient.getRecentPayments(user_id);
    return payments.data;
  }
}
