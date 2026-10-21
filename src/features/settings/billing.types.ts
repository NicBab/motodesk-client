//************************************************************** */

export type BillingPlanId =
  | "starter"
  | "business"
  | "pro";

export type BillingSubscriptionStatus =
  | "NOT_SUBSCRIBED"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID"
  | "PAUSED";

//************************************************************** */

export interface BillingSubscriptionPlan {
  id: BillingPlanId;
  name: string;
  currency: string;
  interval: "month";
  unitAmount: number;
  usersIncluded: number;
}

export interface BillingPlanOption
  extends BillingSubscriptionPlan {
  trialDays: number;
  recommended: boolean;
}

//************************************************************** */

export interface BillingOverview {
  organizationId: string;

  configured: boolean;
  billingExempt: boolean;

  availablePlans: BillingPlanOption[];

  subscription: {
    status: BillingSubscriptionStatus;

    plan: BillingSubscriptionPlan | null;

    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;

    trialStartedAt: string | null;
    trialEndsAt: string | null;

    cancelAtPeriodEnd: boolean;
    cancelAt: string | null;
    canceledAt: string | null;
    endedAt: string | null;
  };

  usage: {
    assignedUsers: number;
  };

  checkoutPending: boolean;
  lastSyncedAt: string | null;
}

//************************************************************** */

export interface CreateBillingCheckoutInput {
  planId: BillingPlanId;
}

export interface BillingRedirectResult {
  url: string;
}

//************************************************************** */