export const STRIPE_ACCOUNT_LOSSES_PAYMENT = 'stripe';
export const STRIPE_ACCOUNT_FEES_PAYER = 'account';
export const STRIPE_ACCOUNT_PAYMENT_DASHBOARD = 'express';
export const STRIPE_ACCOUNT_TYPE = 'express';
export const STRIPE_ACCOUNT_ONBOARDING_LINK_TYPE = 'account_onboarding';

export enum STRIPE_ACCOUNT_STATUS {
  pending = 'pending',
  active = 'active',
  inactive = 'inactive',
  verified = 'verified',
}

export enum STRIPE_PAYMENT_STATUS {
  checkoutCompleted = 'checkout.session.completed',
  invoicePaid = 'invoice.paid',
  invoicePaymentFailed = 'invoice.payment_failed',
  paymentIntentSucceeded = 'payment_intent.succeeded',
  paymentIntentPaymentFailed = 'payment_intent.payment_failed',
  payoutCreated = 'payout.created',
  payoutPaid = 'payout.paid',
  payoutFailed = 'payout.failed',
}

export const STRIPE_SIGNATURE_HEADER = 'stripe-signature';

export const STRIPE_RECENT_PAYMENTS_LIMIT = 20;
