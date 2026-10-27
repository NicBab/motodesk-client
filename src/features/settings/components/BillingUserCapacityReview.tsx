import {
  Clock3,
  Loader2,
  Users,
} from "lucide-react";

import type {
  BillingUserCapacityPreview,
} from "../billing.types";

//************************************************************** */

interface BillingUserCapacityReviewProps {
  preview: BillingUserCapacityPreview;
  isTrial: boolean;
  expired: boolean;
  busy: boolean;
  disabled: boolean;
  confirmationStarted: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

function dateLabel(value: string): string {
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

//************************************************************** */

export function BillingUserCapacityReview({
  preview,
  isTrial,
  expired,
  busy,
  disabled,
  confirmationStarted,
  onConfirm,
  onCancel,
}: BillingUserCapacityReviewProps) {
  const previewExpired = expired && !confirmationStarted;

  const additionalMonthlyAmount =
    preview.targetAdditionalUserQuantity *
    preview.additionalUserUnitAmount;

  return (
    <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50/40 p-5">
      <h3 className="text-sm font-semibold text-zinc-900">
        Review user-capacity change
      </h3>

      <p className="mt-1 text-sm leading-6 text-zinc-600">
        Capacity changes from {preview.currentUserLimit} to{" "}
        {preview.targetUserLimit} application users, including the owner.
      </p>

      <dl className="mt-5 grid gap-5 sm:grid-cols-3">
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            Additional users
          </dt>

          <dd className="mt-2 text-sm font-semibold text-zinc-900">
            {preview.targetAdditionalUserQuantity}
          </dd>

          <p className="mt-1 text-xs text-zinc-500">
            Beyond the ten included in Pro.
          </p>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Additional-user cost
          </dt>

          <dd className="mt-2 text-sm font-semibold text-zinc-900">
            {money(additionalMonthlyAmount, preview.currency)} / month
          </dd>

          <p className="mt-1 text-xs text-zinc-500">
            {money(preview.additionalUserUnitAmount, preview.currency)}
            {" "}per additional user.
          </p>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            New monthly total
          </dt>

          <dd className="mt-2 text-lg font-semibold tracking-tight text-zinc-900">
            {money(preview.monthlyTotalAmount, preview.currency)}
          </dd>

          <p className="mt-1 text-xs text-zinc-500">
            Before taxes, discounts, and credits.
          </p>
        </div>
      </dl>

      <div className="mt-5 rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-sm font-medium text-zinc-900">
          Stripe invoice estimate:{" "}
          {money(
            preview.estimatedInvoiceAmountDue,
            preview.currency,
          )}
        </p>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          This upcoming-invoice estimate can include renewal charges,
          prorations, taxes, discounts, credits, and other pending items.
          It is not necessarily the amount charged immediately.
        </p>
      </div>

      {isTrial ? (
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          Your existing free trial
          {preview.trialEndsAt
            ? ` ends ${dateLabel(preview.trialEndsAt)}`
            : " remains unchanged"}
          . The updated monthly price applies after the trial.
        </p>
      ) : (
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          Confirming applies this change and authorizes Stripe to collect
          any required prorated payment. Additional capacity becomes
          available after the change is confirmed.
        </p>
      )}

      {previewExpired ? (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 text-sm text-amber-800"
        >
          <Clock3
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />

          This preview expired. Cancel it and request a new preview.
        </p>
      ) : null}

      {confirmationStarted ? (
        <p role="status" className="mt-4 text-sm leading-6 text-zinc-600">
          Confirmation has started. Check this change again before
          starting another capacity change.
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled || busy || previewExpired}
          onClick={onConfirm}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          ) : null}

          {busy
            ? "Confirming…"
            : confirmationStarted
              ? "Check change"
              : "Confirm change"}
        </button>

        <button
          type="button"
          disabled={busy || confirmationStarted}
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel preview
        </button>
      </div>
    </div>
  );
}

//************************************************************** */