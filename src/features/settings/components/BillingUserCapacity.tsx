"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  Loader2,
  Users,
} from "lucide-react";

import {
  useCreateBillingUserCapacityPreviewMutation,
  useConfirmBillingUserCapacityChangeMutation,
} from "@/store/api/billingApi";

import type {
  BillingOverview,
  BillingUserCapacityConfirmation,
  BillingUserCapacityPreview,
} from "../billing.types";

import {
  BillingUserCapacityReview,
} from "./BillingUserCapacityReview";

//************************************************************** */

interface BillingUserCapacityProps {
  overview: BillingOverview;
  canManageBilling: boolean;
  disabled: boolean;
  onBillingChanged: () => void;
  onManageBilling: () => void;
  onBusyChange: (busy: boolean) => void;
}

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

function requestError(error: unknown): {
  message: string;
  code: string | null;
} {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null
  ) {
    const data = error.data;

    return {
      message:
        "message" in data && typeof data.message === "string"
          ? data.message
          : "The billing request could not be completed.",

      code:
        "code" in data && typeof data.code === "string"
          ? data.code
          : null,
    };
  }

  return {
    message:
      "The billing request could not be confirmed. Refresh billing before starting another change.",
    code: null,
  };
}

const REPLACEABLE_PREVIEW_ERRORS = new Set([
  "BILLING_CAPACITY_CHANGE_REJECTED",
  "BILLING_CAPACITY_PREVIEW_EXPIRED",
  "BILLING_CAPACITY_PREVIEW_REQUIRED",
  "BILLING_CAPACITY_STATE_CHANGED",
  "BILLING_CAPACITY_BELOW_USAGE",
]);

//************************************************************** */

export function BillingUserCapacity(
  props: BillingUserCapacityProps,
) {
  const { subscription, billingExempt } = props.overview;

  if (
    billingExempt ||
    subscription.plan?.id !== "pro" ||
    (
      subscription.status !== "ACTIVE" &&
      subscription.status !== "TRIALING"
    )
  ) {
    return null;
  }

  return (
    <UserCapacityEditor
      key={props.overview.organizationId}
      {...props}
    />
  );
}

//************************************************************** */

function UserCapacityEditor({
  overview,
  canManageBilling,
  disabled,
  onBillingChanged,
  onManageBilling,
  onBusyChange,
}: BillingUserCapacityProps) {
  const inputId = useId();
  const active = useRef(true);
  const requestInFlight = useRef(false);

  const currentQuantity =
    overview.subscription.additionalUserQuantity;

  const [draft, setDraft] = useState({
    baseline: currentQuantity,
    value: String(currentQuantity),
  });

  const [preview, setPreview] =
    useState<BillingUserCapacityPreview | null>(null);

  const [confirmation, setConfirmation] =
    useState<BillingUserCapacityConfirmation | null>(null);

  const [confirmationStarted, setConfirmationStarted] =
    useState(false);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const [createPreview, previewRequest] =
    useCreateBillingUserCapacityPreviewMutation();

  const [confirmChange, confirmRequest] =
    useConfirmBillingUserCapacityChangeMutation();

  useEffect(() => {
    active.current = true;

    return () => {
      active.current = false;
    };
  }, []);

  useEffect(() => {
    if (!preview || confirmationStarted) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [preview, confirmationStarted]);

  const plan = overview.subscription.plan!;
  const pricing = plan.additionalUserPricing;

  const quantityText =
    draft.baseline === currentQuantity
      ? draft.value
      : String(currentQuantity);

  const quantity = Number(quantityText);

  const validQuantity =
    /^(0|[1-9]\d*)$/.test(quantityText) &&
    Number.isSafeInteger(quantity) &&
    quantity <= 2_147_483_647;

  const busy =
    previewRequest.isLoading ||
    confirmRequest.isLoading;

  const cancellationScheduled =
    overview.subscription.cancelAtPeriodEnd ||
    overview.subscription.cancelAt !== null;

  const editingDisabled =
    disabled ||
    busy ||
    !canManageBilling ||
    !overview.configured ||
    cancellationScheduled ||
    !pricing;

  const previewExpired = preview
    ? (
        !Number.isFinite(Date.parse(preview.expiresAt)) ||
        now >= Date.parse(preview.expiresAt) ||
        preview.currentAdditionalUserQuantity !== currentQuantity
      )
    : false;

  const paymentPending =
    confirmation?.status === "PENDING_PAYMENT";

  async function handlePreview(): Promise<void> {
    if (
      requestInFlight.current ||
      editingDisabled ||
      preview ||
      !validQuantity ||
      quantity === currentQuantity
    ) {
      return;
    }

    requestInFlight.current = true;
    onBusyChange(true);
    setError(null);
    setNotice(null);

    try {
      const result = await createPreview({
        organizationId: overview.organizationId,
        additionalUserQuantity: quantity,
      }).unwrap();

      if (active.current) {
        setPreview(result);
        setConfirmation(null);
        setConfirmationStarted(false);
        setNow(Date.now());
      }
    } catch (caughtError) {
      if (active.current) {
        setError(requestError(caughtError).message);
      }
    } finally {
      requestInFlight.current = false;
      onBusyChange(false);
    }
  }

  async function handleConfirm(): Promise<void> {
    if (
      !preview ||
      requestInFlight.current ||
      editingDisabled ||
      (previewExpired && !confirmationStarted)
    ) {
      return;
    }

    requestInFlight.current = true;
    onBusyChange(true);
    setError(null);
    setConfirmationStarted(true);

    try {
      const result = await confirmChange({
        organizationId: overview.organizationId,
        changeId: preview.changeId,
      }).unwrap();

      if (!active.current) {
        return;
      }

      if (result.status === "APPLIED") {
        setNotice(
          `User capacity is now ${result.targetUserLimit}. The monthly list price is ${money(result.monthlyTotalAmount, result.currency)}.`,
        );

        setPreview(null);
        setConfirmation(null);
        setConfirmationStarted(false);
      } else {
        setConfirmation(result);
      }

      onBillingChanged();
    } catch (caughtError) {
      if (!active.current) {
        return;
      }

      const failure = requestError(caughtError);

      setError(failure.message);

      if (
        failure.code &&
        REPLACEABLE_PREVIEW_ERRORS.has(failure.code)
      ) {
        setPreview(null);
        setConfirmation(null);
        setConfirmationStarted(false);
      }

      // Uncertain responses retain the original change ID.
      // A retry checks the same operation instead of purchasing again.
      onBillingChanged();
    } finally {
      requestInFlight.current = false;
      onBusyChange(false);
    }
  }

  function cancelPreview(): void {
    if (busy || confirmationStarted) {
      return;
    }

    setPreview(null);
    setConfirmation(null);
    setError(null);
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <Users
          className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400"
          aria-hidden="true"
        />

        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Application user capacity
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Pro includes {plan.usersIncluded} users. Additional users cost{" "}
            {pricing
              ? money(pricing.unitAmount, plan.currency)
              : "the configured additional-user price"}
            {" "}each per month, including the owner in total capacity.
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-600">
        {overview.usage.assignedUsers} assigned users ·{" "}
        {overview.usage.userLimit ?? "Unlimited"} purchased capacity
      </p>

      {notice ? (
        <p
          role="status"
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {notice}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      {!canManageBilling ? (
        <p className="mt-4 text-sm text-zinc-500">
          Contact a member with billing management permission to
          change user capacity.
        </p>
      ) : cancellationScheduled ? (
        <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Undo the scheduled cancellation in Manage billing before
          changing user capacity.
        </p>
      ) : paymentPending ? (
        <div
          role="status"
          className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <p className="text-sm font-semibold text-amber-900">
            Payment pending
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            Review the invoice in Manage billing. Additional capacity
            becomes available after payment and billing confirmation.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={disabled || busy}
              onClick={onManageBilling}
              className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50"
            >
              Manage billing
            </button>

            <button
              type="button"
              disabled={editingDisabled}
              onClick={() => void handleConfirm()}
              className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50"
            >
              {busy ? "Checking…" : "Check payment status"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor={inputId}
                className="block text-sm font-medium text-zinc-700"
              >
                Additional users
              </label>

              <input
                id={inputId}
                type="number"
                inputMode="numeric"
                min={0}
                max={2_147_483_647}
                step={1}
                value={quantityText}
                disabled={editingDisabled || preview !== null}
                aria-invalid={!validQuantity}
                aria-describedby={`${inputId}-help`}
                onChange={(event) => {
                  setDraft({
                    baseline: currentQuantity,
                    value: event.target.value,
                  });
                  setError(null);
                  setNotice(null);
                }}
                className="mt-2 h-10 w-36 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-zinc-50 disabled:text-zinc-500"
              />
            </div>

            <button
              type="button"
              disabled={
                editingDisabled ||
                preview !== null ||
                !validQuantity ||
                quantity === currentQuantity
              }
              onClick={() => void handlePreview()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {previewRequest.isLoading ? (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              ) : null}

              {previewRequest.isLoading
                ? "Preparing preview…"
                : "Review change"}
            </button>
          </div>

          <p
            id={`${inputId}-help`}
            className="mt-2 text-xs leading-5 text-zinc-500"
          >
            Enter a whole number of additional users. Reductions must
            leave enough capacity for assigned users and reserved
            invitations. No change is submitted until you confirm.
          </p>

          {preview ? (
            <BillingUserCapacityReview
              preview={preview}
              isTrial={overview.subscription.status === "TRIALING"}
              expired={previewExpired}
              busy={confirmRequest.isLoading}
              disabled={editingDisabled}
              confirmationStarted={confirmationStarted}
              onConfirm={() => void handleConfirm()}
              onCancel={cancelPreview}
            />
          ) : null}
        </>
      )}
    </section>
  );
}

//************************************************************** */