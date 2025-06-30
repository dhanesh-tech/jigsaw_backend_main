import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { USER_ROLE } from 'src/users/utilities/enum';
import { UserRole } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { StripeUserAccount } from './entities/stripe-user-account.entity';
import { Stripe } from 'stripe';
@Controller('/v1/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Retrieves a Stripe account session for a given user ID.
   * /v1/payment/stripe-account-session
   *
   * @returns {Promise<{ client_secret: string }>} - object containing the client secret for the session.
   */
  @Get('stripe-account-session')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager, USER_ROLE.mentor)
  async getStripeAccountSession(
    @Req() req: any,
  ): Promise<{ client_secret: string }> {
    const user_id = req?.user?.id;
    return this.paymentService.createStripeAccountSession(user_id);
  }

  /**
   * Retrieves a Stripe account link for a given user ID.
   * /v1/payment/stripe-account-link
   *
   * @returns {Promise<{ url: string }>} - object containing the URL for the account link.
   */
  @Get('stripe-account-link')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager, USER_ROLE.mentor)
  async getStripeAccountLink(@Req() req: any) {
    const user_id = req?.user?.id;
    return this.paymentService.createStripeAccountLink(user_id);
  }

  /**
   * Retrieves the details of the Stripe account associated with the authenticated user.
   * /v1/payment/stripe-account-details
   *
   * @returns {StripeUserAccount} - object of StripeUserAccount entity associated with the user.
   */
  @Get('stripe-account-details')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager, USER_ROLE.mentor)
  async getStripeAccountDetails(@Req() req: any): Promise<StripeUserAccount> {
    const user_id = req?.user?.id;
    return this.paymentService.fetchStripeUserAccount(user_id);
  }

  /**
   * Retrieves a Stripe payment intent for a given job ID.
   * /v1/payment/job-payment-intent/:job_id
   *
   * @param job_id - The ID of the job for which the payment intent is to be created.
   * @returns {Promise<{ client_secret: string }>} - object containing the client secret for the session.
   */
  @Get('job-payment-intent/:job_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager, USER_ROLE.mentor)
  async getStripeJobPaymentIntent(
    @Req() req: any,
    @Param('job_id') job_id: number,
  ): Promise<Stripe.PaymentIntent> {
    const user_id = req?.user?.id;
    return this.paymentService.createJobPaymentIntent(+job_id, user_id);
  }

  /**
   * Retrieves recent payments for a specific user.
   * /v1/payment/recent-payments
   *
   * @returns {Promise<Stripe.PaymentIntent[]>} - An array of recent payment intents.
   */
  @Get('recent-payments')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UserRole(USER_ROLE.hiring_manager, USER_ROLE.mentor)
  async getRecentPayments(@Req() req: any): Promise<Stripe.PaymentIntent[]> {
    const user_id = req?.user?.id;
    return this.paymentService.getRecentPayments(user_id);
  }
}
