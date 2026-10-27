"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Clock3,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  useConfirmBillingPlanChangeMutation,
  useConfirmBillingUserCapacityChangeMutation,
} from "@/store/api/billingApi";

import type {
  BillingOverview,
  BillingPendingChange as PendingChange,
} from "../billing.types";

//************************************************************** */

interface BillingPendingChangeProps {
  overview: BillingOverview;
  canManageBilling: boolean;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
  onBillingChanged: () => void;
  onManageBilling: () => void;
}

interface PendingChangePanelProps
  extends BillingPendingChangeProps {
  pending: PendingChange;
}

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

function requestError(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data &&
    typeof error.data.message === "string"
  ) {
    return error.data.message;
  }

  return "The change could not be checked. Refresh billing before starting another change.";
}

//************************************************************** */

export function BillingPendingChange(
  props: BillingPendingChangeProps,
) {
  const pending = props.overview.pendingChange;

  if (!pending) {
    return null;
  }

  const operationKey = [
    props.overview.organizationId,
    pending.kind,
    pending.changeId ?? pending.submittedAt ?? "pending",
  ].join(":");

  return (
    <PendingChangePanel
      key={operationKey}
      {...props}
      pending={pending}
    />
  );
}

//************************************************************** */

function PendingChangePanel({
  overview,
  pending,
  canManageBilling,
  disabled,
  onBusyChange,
  onBillingChanged,
  onManageBilling,
}: PendingChangePanelProps) {
  const active = useRef(true);
  const requestInFlight = useRef(false);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [confirmPlanChange, planRequest] =
    useConfirmBillingPlanChangeMutation();

  const [confirmCapacityChange, capacityRequest] =
    useConfirmBillingUserCapacityChangeMutation();

  useEffect(() => {
    active.current = true;

    return () => {
      active.current = false;
    };
  }, []);

  const busy =
    planRequest.isLoading ||
    capacityRequest.isLoading;

  const paymentPending = pending.status === "PENDING_PAYMENT";

  const requiresReview =
    pending.status === "RECONCILIATION_REQUIRED";

  const canResume =
    pending.requestedByCurrentUser &&
    pending.changeId !== null &&
    canManageBilling &&
    !requiresReview;

  const unavailable =
    disabled ||
    busy ||
    !overview.configured;

  const targetPlanName = overview.availablePlans.find(
    (plan) => plan.id === pending.targetPlanId,
  )?.name ?? pending.targetPlanId;

  const purchasedUserLimit = overview.usage.userLimit;

  const reservesLowerLimit =
    purchasedUserLimit !== null &&
    pending.targetUserLimit < purchasedUserLimit;

  const heading = requiresReview
    ? "Billing change requires review"
    : paymentPending
      ? "Billing change awaiting payment"
      : "Billing change in progress";

  async function handleCheck(): Promise<void> {
    if (
      requestInFlight.current ||
      unavailable ||
      !canResume ||
      !pending.changeId
    ) {
      return;
    }

    requestInFlight.current = true;
    onBusyChange(true);
    setError(null);
    setNotice(null);

    try {
      const input = {
        organizationId: overview.organizationId,
        changeId: pending.changeId,
      };

      const result = pending.kind === "PLAN_CHANGE"
        ? await confirmPlanChange(input).unwrap()
        : await confirmCapacityChange(input).unwrap();

      if (active.current) {
        setNotice(
          result.status === "APPLIED"
            ? "The billing change is confirmed. Refreshing your subscription."
            : "Payment confirmation is still pending. Review the invoice in Manage billing.",
        );

        onBillingChanged();
      }
    } catch (caughtError) {
      if (active.current) {
        setError(requestError(caughtError));
        onBillingChanged();
      }
    } finally {
      requestInFlight.current = false;
      onBusyChange(false);
    }
  }

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-6">
      <div className="flex items-start gap-3">
        <Clock3
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
          aria-hidden="true"
        />

        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            {heading}
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-600">
            {requiresReview
              ? "MotoDesk could not automatically resolve this change. Refresh billing and contact support if it remains unresolved."
              : paymentPending
                ? "Review the outstanding invoice in Manage billing. The requested change is not complete until billing confirms it."
                : "A previously confirmed request is still being resolved. Check the same request before starting another change."}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-5 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Requested plan
          </dt>

          <dd className="mt-2 text-sm font-semibold text-zinc-900">
            {targetPlanName}

            {pending.kind === "USER_CAPACITY_CHANGE" ? (
              <span className="mt-1 block text-xs font-normal text-zinc-500">
                Additional-user quantity change.
              </span>
            ) : null}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Requested user capacity
          </dt>

          <dd className="mt-2 text-sm font-semibold text-zinc-900">
            {pending.targetUserLimit} users

            <span className="mt-1 block text-xs font-normal text-zinc-500">
              Including the owner.
            </span>
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Requested monthly list price
          </dt>

          <dd className="mt-2 text-sm font-semibold text-zinc-900">
            {money(pending.monthlyTotalAmount, pending.currency)}

            <span className="mt-1 block text-xs font-normal text-zinc-500">
              Before taxes, discounts, and credits.
            </span>
          </dd>
        </div>
      </dl>

      {reservesLowerLimit ? (
        <p className="mt-4 text-sm leading-6 text-amber-900">
          While this reduction is pending, new users and invitations
          must fit within the requested {pending.targetUserLimit}-user
          limit.
        </p>
      ) : null}

      {!pending.requestedByCurrentUser ? (
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          Another organization member requested this change. That
          member can resume confirmation. Billing will update here
          when the request is resolved.
        </p>
      ) : !canManageBilling ? (
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          Billing management permission is required to resume
          confirmation.
        </p>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-zinc-500">
        This request is saved to your organization. Refreshing the
        page does not create or submit another billing change.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      {notice ? (
        <p role="status" className="mt-4 text-sm text-zinc-700">
          {notice}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {canResume ? (
          <button
            type="button"
            disabled={unavailable}
            onClick={() => void handleCheck()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <Loader2
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : null}

            {busy ? "Checking…" : "Check billing change"}
          </button>
        ) : null}

        {canManageBilling ? (
          <button
            type="button"
            disabled={unavailable}
            onClick={onManageBilling}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            Manage billing
          </button>
        ) : null}

        <button
          type="button"
          disabled={disabled || busy}
          onClick={onBillingChanged}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh billing
        </button>
      </div>
    </section>
  );
}

//************************************************************** */