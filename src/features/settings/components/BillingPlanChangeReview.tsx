import {
  ArrowRight,
  Clock3,
  Loader2,
} from "lucide-react";

import type {
  BillingPlanChangePreview,
} from "../billing.types";

//************************************************************** */

interface BillingPlanChangeReviewProps {
  preview: BillingPlanChangePreview;
  currentPlanName: string;
  targetPlanName: string;
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

export function BillingPlanChangeReview({
  preview,
  currentPlanName,
  targetPlanName,
  isTrial,
  expired,
  busy,
  disabled,
  confirmationStarted,
  onConfirm,
  onCancel,
}: BillingPlanChangeReviewProps) {
  const previewExpired = expired && !confirmationStarted;

  const removesAdditionalUsers =
    preview.currentAdditionalUserQuantity > 0 &&
    preview.targetPlanId !== "pro";

  return (
    <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50/40 p-5">
      <h3 className="text-sm font-semibold text-zinc-900">
        Review plan change
      </h3>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-base font-semibold text-zinc-900">
        <span>{currentPlanName}</span>

        <ArrowRight
          className="h-4 w-4 text-zinc-400"
          aria-hidden="true"
        />

        <span>{targetPlanName}</span>
      </div>

      <p className="mt-2 text-sm leading-6 text-zinc-600">
        This changes your existing subscription. Your organization
        and its data stay in place.
      </p>

      <dl className="mt-5 grid gap-5 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            User capacity
          </dt>

          <dd className="mt-2 text-sm font-semibold text-zinc-900">
            {preview.currentUserLimit} → {preview.targetUserLimit}

            <span className="mt-1 block text-xs font-normal text-zinc-500">
              Application users, including the owner.
            </span>
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Additional users
          </dt>

          <dd className="mt-2 text-sm font-semibold text-zinc-900">
            {preview.targetAdditionalUserQuantity}

            <span className="mt-1 block text-xs font-normal text-zinc-500">
              {preview.targetPlanId === "pro"
                ? "Beyond the ten included in Pro."
                : "The selected plan uses its included user limit."}
            </span>
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            New monthly list price
          </dt>

          <dd className="mt-2 text-lg font-semibold tracking-tight text-zinc-900">
            {money(preview.monthlyTotalAmount, preview.currency)}

            <span className="mt-1 block text-xs font-normal tracking-normal text-zinc-500">
              Before taxes, discounts, and credits.
            </span>
          </dd>
        </div>
      </dl>

      {removesAdditionalUsers ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          Changing to {targetPlanName} removes the Pro additional-user
          item. Your users and pending invitations must fit within
          the new {preview.targetUserLimit}-user limit.
        </p>
      ) : null}

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
          Your existing trial
          {preview.trialEndsAt
            ? ` ends ${dateLabel(preview.trialEndsAt)}`
            : " remains unchanged"}
          . Changing plans does not start a new trial. The updated
          monthly price applies after the trial.
        </p>
      ) : (
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          Confirming requests this plan change now and authorizes
          Stripe to collect any required prorated payment. Any
          downgrade credit is handled through Stripe billing.
          The new plan becomes effective after confirmation.
        </p>
      )}

      {preview.targetUserLimit < preview.currentUserLimit ? (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          While the change is processing, new users and invitations
          must fit within the lower capacity limit.
        </p>
      ) : null}

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
          starting another billing change.
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
              ? "Check plan change"
              : `Confirm ${targetPlanName}`}
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