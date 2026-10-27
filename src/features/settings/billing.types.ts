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

export interface BillingAdditionalUserPricing {
  unitAmount: number;
}

export interface BillingSubscriptionPlan {
  id: BillingPlanId;
  name: string;
  currency: string;
  interval: "month";
  unitAmount: number;
  usersIncluded: number;
  additionalUserPricing: BillingAdditionalUserPricing | null;
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

    additionalUserQuantity: number;
    additionalUserUnitAmount: number | null;
    additionalUserMonthlyAmount: number;

    // Recurring list price before taxes, discounts, credits,
    // and prorations. Null when no plan is selected.
    monthlyTotalAmount: number | null;

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

    // Null means the organization is billing-exempt.
    // Zero means no purchased plan capacity is available.
    userLimit: number | null;
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

export interface CreateBillingUserCapacityPreviewInput {
  // Target additional users beyond Pro's ten included users.
  additionalUserQuantity: number;
}

export interface BillingUserCapacityPreview {
  changeId: string;
  currency: string;

  currentAdditionalUserQuantity: number;
  targetAdditionalUserQuantity: number;

  currentUserLimit: number;
  targetUserLimit: number;

  additionalUserUnitAmount: number;
  monthlyTotalAmount: number;

  estimatedInvoiceAmountDue: number;
  invoiceEstimateScope: "next_invoice";

  trialEndsAt: string | null;
  expiresAt: string;
}

//************************************************************** */

export interface ConfirmBillingUserCapacityChangeInput {
  changeId: string;
}

export interface BillingUserCapacityConfirmation {
  changeId: string;
  status: "APPLIED" | "PENDING_PAYMENT";
  currency: string;

  targetAdditionalUserQuantity: number;
  targetUserLimit: number;
  monthlyTotalAmount: number;
}

//************************************************************** */