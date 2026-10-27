"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useCreateBillingPlanChangePreviewMutation,
  useConfirmBillingPlanChangeMutation,
} from "@/store/api/billingApi";

import type {
  BillingOverview,
  BillingPlanId,
  BillingPlanChangeConfirmation,
  BillingPlanChangePreview,
} from "../billing.types";

import {
  BillingPlanChangeSelection,
} from "./BillingPlanChangeSelection";

import {
  BillingPlanChangeReview,
} from "./BillingPlanChangeReview";

//************************************************************** */

interface BillingPlanChangeProps {
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
      "The request could not be confirmed. Check this plan change again before starting another.",
    code: null,
  };
}

const UNSUBMITTED_PREVIEW_ERRORS = new Set([
  "BILLING_PLAN_PREVIEW_EXPIRED",
  "BILLING_PLAN_PREVIEW_REQUIRED",
  "BILLING_PLAN_STATE_CHANGED",
  "BILLING_PLAN_CAPACITY_BELOW_USAGE",
  "BILLING_SUBSCRIPTION_CHANGE_PENDING",
  "BILLING_CANCELLATION_SCHEDULED",
]);

//************************************************************** */

export function BillingPlanChange(
  props: BillingPlanChangeProps,
) {
  const { subscription, billingExempt } = props.overview;

  if (
    billingExempt ||
    !subscription.plan ||
    (
      subscription.status !== "ACTIVE" &&
      subscription.status !== "TRIALING"
    )
  ) {
    return null;
  }

  return (
    <PlanChangeEditor
      key={props.overview.organizationId}
      {...props}
    />
  );
}

//************************************************************** */

function PlanChangeEditor({
  overview,
  canManageBilling,
  disabled,
  onBillingChanged,
  onManageBilling,
  onBusyChange,
}: BillingPlanChangeProps) {
  const active = useRef(true);
  const requestInFlight = useRef(false);

  const [open, setOpen] = useState(false);
  const [additionalUsers, setAdditionalUsers] = useState("0");

  const [pendingPlanId, setPendingPlanId] =
    useState<BillingPlanId | null>(null);

  const [preview, setPreview] =
    useState<BillingPlanChangePreview | null>(null);

  const [confirmation, setConfirmation] =
    useState<BillingPlanChangeConfirmation | null>(null);

  const [confirmationStarted, setConfirmationStarted] =
    useState(false);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const [createPreview, previewRequest] =
    useCreateBillingPlanChangePreviewMutation();

  const [confirmChange, confirmRequest] =
    useConfirmBillingPlanChangeMutation();

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

  const busy =
    previewRequest.isLoading ||
    confirmRequest.isLoading;

  const cancellationScheduled =
    overview.subscription.cancelAtPeriodEnd ||
    overview.subscription.cancelAt !== null;

  const unavailable =
    disabled ||
    busy ||
    !canManageBilling ||
    !overview.configured;

  const previewDisabled =
    unavailable || cancellationScheduled;

  const confirmationDisabled =
    unavailable ||
    (cancellationScheduled && !confirmationStarted);

  const previewExpired = preview
    ? (
        !Number.isFinite(Date.parse(preview.expiresAt)) ||
        now >= Date.parse(preview.expiresAt) ||
        preview.currentPlanId !== plan.id ||
        preview.currentAdditionalUserQuantity !==
          overview.subscription.additionalUserQuantity
      )
    : false;

  const paymentPending =
    confirmation?.status === "PENDING_PAYMENT";

  function planName(planId: BillingPlanId): string {
    return overview.availablePlans.find(
      (option) => option.id === planId,
    )?.name ?? planId;
  }

  async function handlePreview(
    planId: BillingPlanId,
  ): Promise<void> {
    const quantity = planId === "pro"
      ? Number(additionalUsers)
      : 0;

    if (
      requestInFlight.current ||
      previewDisabled ||
      preview ||
      planId === plan.id ||
      (
        planId === "pro" &&
        !/^\d+$/.test(additionalUsers)
      ) ||
      !Number.isSafeInteger(quantity) ||
      quantity < 0 ||
      quantity > 2_147_483_647
    ) {
      return;
    }

    requestInFlight.current = true;
    onBusyChange(true);
    setPendingPlanId(planId);
    setError(null);
    setNotice(null);

    try {
      const result = await createPreview({
        organizationId: overview.organizationId,
        planId,
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

      if (active.current) {
        setPendingPlanId(null);
      }

      onBusyChange(false);
    }
  }

  async function handleConfirm(): Promise<void> {
    if (
      !preview ||
      requestInFlight.current ||
      confirmationDisabled ||
      (previewExpired && !confirmationStarted)
    ) {
      return;
    }

    const previouslyStarted = confirmationStarted;

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
          `Your plan is now ${planName(result.targetPlanId)}, with capacity for ${result.targetUserLimit} users and a monthly list price of ${money(result.monthlyTotalAmount, result.currency)}.`,
        );

        setPreview(null);
        setConfirmation(null);
        setConfirmationStarted(false);
        setOpen(false);
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

      const definitelyRejected =
        failure.code === "BILLING_PLAN_CHANGE_REJECTED";

      const rejectedBeforeSubmission =
        !previouslyStarted &&
        failure.code !== null &&
        UNSUBMITTED_PREVIEW_ERRORS.has(failure.code);

      if (definitelyRejected || rejectedBeforeSubmission) {
        setPreview(null);
        setConfirmation(null);
        setConfirmationStarted(false);
      }

      // Uncertain responses retain the same preview and change ID.
      // Retrying checks that operation instead of creating another.
      onBillingChanged();
    } finally {
      requestInFlight.current = false;
      onBusyChange(false);
    }
  }

  function cancelPreview(): void {
    if (busy || requestInFlight.current || confirmationStarted) {
      return;
    }

    setPreview(null);
    setConfirmation(null);
    setError(null);
  }

  function toggleOpen(): void {
    if (busy || requestInFlight.current || confirmationStarted) {
      return;
    }

    setOpen(!open);
    setPreview(null);
    setConfirmation(null);
    setError(null);
    setNotice(null);
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Subscription plan
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Currently on {plan.name}. Compare plans and review
            billing before upgrading or downgrading.
          </p>
        </div>

        {canManageBilling ? (
          <button
            type="button"
            disabled={
              unavailable ||
              confirmationStarted ||
              (cancellationScheduled && !open)
            }
            aria-expanded={open}
            onClick={toggleOpen}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {open ? "Close plan selection" : "Change plan"}
          </button>
        ) : null}
      </div>

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
          Contact an organization owner or a member with billing
          management permission to change plans.
        </p>
      ) : cancellationScheduled && !confirmationStarted ? (
        <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Undo the scheduled cancellation in Manage billing before
          changing plans.
        </p>
      ) : null}

      {open && paymentPending ? (
        <div
          role="status"
          className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <p className="text-sm font-semibold text-amber-900">
            Payment pending
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            The change to {planName(confirmation.targetPlanId)} is
            awaiting payment confirmation. Review your invoice in
            Manage billing, then check this change again.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={unavailable}
              onClick={onManageBilling}
              className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50"
            >
              Manage billing
            </button>

            <button
              type="button"
              disabled={confirmationDisabled}
              onClick={() => void handleConfirm()}
              className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50"
            >
              {confirmRequest.isLoading
                ? "Checking…"
                : "Check plan change"}
            </button>
          </div>
        </div>
      ) : open && preview ? (
        <BillingPlanChangeReview
          preview={preview}
          currentPlanName={planName(preview.currentPlanId)}
          targetPlanName={planName(preview.targetPlanId)}
          isTrial={preview.trialEndsAt !== null}
          expired={previewExpired}
          busy={confirmRequest.isLoading}
          disabled={confirmationDisabled}
          confirmationStarted={confirmationStarted}
          onConfirm={() => void handleConfirm()}
          onCancel={cancelPreview}
        />
      ) : open ? (
        <div className="mt-5">
          <BillingPlanChangeSelection
            plans={overview.availablePlans}
            currentPlanId={plan.id}
            currentAdditionalUserQuantity={
              overview.subscription.additionalUserQuantity
            }
            assignedUsers={overview.usage.assignedUsers}
            additionalUserQuantity={additionalUsers}
            canManageBilling={canManageBilling}
            disabled={previewDisabled}
            pendingPlanId={pendingPlanId}
            onAdditionalUserQuantityChange={(value) => {
              setAdditionalUsers(value);
              setError(null);
            }}
            onSelectPlan={(planId) => {
              void handlePreview(planId);
            }}
          />
        </div>
      ) : null}
    </section>
  );
}

//************************************************************** */