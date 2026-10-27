import {
  CalendarDays,
  CreditCard,
  ShieldCheck,
  Users,
} from "lucide-react";

import type {
  BillingOverview,
  BillingSubscriptionStatus,
} from "../billing.types";

//************************************************************** */

const STATUS_LABELS: Record<
  BillingSubscriptionStatus,
  string
> = {
  NOT_SUBSCRIBED: "No subscription",
  INCOMPLETE: "Payment incomplete",
  INCOMPLETE_EXPIRED: "Checkout expired",
  TRIALING: "Free trial",
  ACTIVE: "Active",
  PAST_DUE: "Payment overdue",
  CANCELED: "Canceled",
  UNPAID: "Unpaid",
  PAUSED: "Paused",
};

function formatDate(value: string | null): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatPrice(
  unitAmount: number,
  currency: string,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(unitAmount / 100);
}

//************************************************************** */

export function BillingSubscriptionSummary({
  overview,
}: {
  overview: BillingOverview;
}) {
  const { subscription, billingExempt, usage } = overview;
  const plan = subscription.plan;

  const needsAttention = [
    "INCOMPLETE",
    "PAST_DUE",
    "UNPAID",
    "PAUSED",
  ].includes(subscription.status);

  const hasEnded =
    subscription.status === "CANCELED" ||
    subscription.status === "INCOMPLETE_EXPIRED" ||
    subscription.status === "NOT_SUBSCRIBED";

  const cancellationScheduled =
    !hasEnded &&
    (
      subscription.cancelAtPeriodEnd ||
      subscription.cancelAt !== null
    );

  const cancellationDate =
    subscription.cancelAt ??
    (
      subscription.cancelAtPeriodEnd
        ? subscription.currentPeriodEnd
        : null
    );

  const badgeClass = billingExempt
    ? "bg-emerald-50 text-emerald-700"
    : needsAttention || cancellationScheduled
      ? "bg-amber-50 text-amber-800"
      : "bg-zinc-100 text-zinc-700";

  const dateLabel =
    subscription.status === "CANCELED"
      ? "Subscription ended"
      : subscription.status === "TRIALING"
        ? "Trial ends"
        : cancellationScheduled
          ? "Scheduled cancellation"
          : "Current period ends";

  const dateValue =
    subscription.status === "CANCELED"
      ? subscription.endedAt ?? subscription.canceledAt
      : subscription.status === "TRIALING"
        ? subscription.trialEndsAt
        : cancellationScheduled
          ? cancellationDate
          : subscription.currentPeriodEnd;

  const monthlyTotalAmount =
    subscription.monthlyTotalAmount;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 p-6">
        <div>
          <div className="flex items-center gap-2 text-zinc-500">
            <CreditCard className="h-4 w-4" aria-hidden="true" />

            <h2 className="text-sm font-medium">
              Organization subscription
            </h2>
          </div>

          <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-900">
            {billingExempt
              ? "Billing exempt"
              : plan?.name ?? "Choose your MotoDesk plan"}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {billingExempt
              ? "This organization can use MotoDesk without a paid subscription."
              : "One subscription covers your organization’s application users."}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {billingExempt
            ? "Exempt"
            : cancellationScheduled
              ? `${STATUS_LABELS[subscription.status]} · Cancellation scheduled`
              : STATUS_LABELS[subscription.status]}
        </span>
      </div>

      {billingExempt ? (
        <div className="flex items-start gap-3 p-6">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
            aria-hidden="true"
          />

          <div>
            <p className="text-sm font-medium text-zinc-900">
              No subscription purchase required
            </p>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              An existing Stripe subscription is not canceled automatically
              when an exemption is granted. Use Manage billing to review any
              previous subscription.
            </p>
          </div>
        </div>
      ) : null}

      <dl className="grid gap-6 p-6 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Monthly list price
          </dt>

          <dd className="mt-2 text-sm font-semibold text-zinc-900">
            {billingExempt
              ? "Exempt"
              : plan && monthlyTotalAmount !== null
                ? `${formatPrice(monthlyTotalAmount, plan.currency)} / month`
                : "No plan selected"}
          </dd>

          {!billingExempt && plan ? (
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {formatPrice(plan.unitAmount, plan.currency)} base plan
              {subscription.additionalUserQuantity > 0
                ? ` + ${formatPrice(
                    subscription.additionalUserMonthlyAmount,
                    plan.currency,
                  )} for ${subscription.additionalUserQuantity} additional ${
                    subscription.additionalUserQuantity === 1
                      ? "user"
                      : "users"
                  }`
                : ""}
              . Before taxes, discounts, and credits.
            </p>
          ) : null}
        </div>

        <div>
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            Assigned users
          </dt>

          <dd className="mt-2 text-sm font-semibold text-zinc-900">
            {usage.assignedUsers}
            {!billingExempt && plan
              ? ` / ${usage.userLimit}`
              : ""}
          </dd>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {billingExempt
              ? "Unlimited capacity. Includes the organization owner."
              : plan
                ? `${plan.usersIncluded} included${
                    subscription.additionalUserQuantity > 0
                      ? ` + ${subscription.additionalUserQuantity} additional`
                      : ""
                  }. Includes the organization owner.`
                : "Includes the organization owner."}
          </p>
        </div>

        <div>
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
            <CalendarDays
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            {dateLabel}
          </dt>

          <dd className="mt-2 text-sm font-semibold text-zinc-900">
            {formatDate(dateValue)}
          </dd>
        </div>
      </dl>

      {cancellationScheduled ? (
        <div
          role="status"
          className="border-t border-amber-100 bg-amber-50/60 px-6 py-4"
        >
          <p className="text-sm font-semibold text-amber-900">
            {cancellationDate
              ? `Cancellation scheduled for ${formatDate(cancellationDate)}`
              : "Cancellation scheduled"}
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            Review your scheduled cancellation in Manage billing.
          </p>
        </div>
      ) : null}

      {!billingExempt && needsAttention ? (
        <p className="border-t border-zinc-100 px-6 py-4 text-sm text-amber-800">
          Your subscription needs attention. Open Manage billing to
          review its status and payment method.
        </p>
      ) : null}
    </section>
  );
}

//************************************************************** */