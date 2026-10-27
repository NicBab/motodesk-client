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

export interface BillingPendingChange {
  kind: "PLAN_CHANGE" | "USER_CAPACITY_CHANGE";

  // Null for viewers who did not request the change.
  changeId: string | null;
  requestedByCurrentUser: boolean;

  status:
    | "PROCESSING"
    | "PENDING_PAYMENT"
    | "RECONCILIATION_REQUIRED";

  targetPlanId: BillingPlanId;
  targetAdditionalUserQuantity: number;
  targetUserLimit: number;

  currency: string;
  monthlyTotalAmount: number;
  submittedAt: string | null;
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

    // Purchased capacity. A pending reduction can temporarily
    // impose a lower limit, enforced by the server.
    // Null represents billing-exempt, unlimited capacity.
    userLimit: number | null;
  };

  pendingChange: BillingPendingChange | null;

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

export interface CreateBillingPlanChangePreviewInput {
  planId: BillingPlanId;

  // Desired total additional users on the target Pro plan.
  // Must be zero when selecting Starter or Business.
  additionalUserQuantity: number;
}

export interface BillingPlanChangePreview {
  changeId: string;
  currency: string;

  currentPlanId: BillingPlanId;
  targetPlanId: BillingPlanId;

  currentAdditionalUserQuantity: number;
  targetAdditionalUserQuantity: number;

  currentUserLimit: number;
  targetUserLimit: number;

  // Target recurring list price before taxes, discounts,
  // credits, and prorations.
  monthlyTotalAmount: number;

  estimatedInvoiceAmountDue: number;
  invoiceEstimateScope: "next_invoice";

  trialEndsAt: string | null;
  expiresAt: string;
}

//************************************************************** */

export interface ConfirmBillingPlanChangeInput {
  changeId: string;
}

export interface BillingPlanChangeConfirmation {
  changeId: string;
  status: "APPLIED" | "PENDING_PAYMENT";
  currency: string;

  targetPlanId: BillingPlanId;
  targetAdditionalUserQuantity: number;
  targetUserLimit: number;
  monthlyTotalAmount: number;
}

//************************************************************** */