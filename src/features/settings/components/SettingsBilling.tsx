"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import {
  useCreateBillingCheckoutMutation,
  useCreateBillingPortalMutation,
  useGetBillingOverviewQuery,
} from "@/store/api/billingApi";

import type {
  BillingPlanId,
} from "../billing.types";

import {
  BillingPlanSelection,
} from "./BillingPlanSelection";

import {
  BillingSubscriptionSummary,
} from "./BillingSubscriptionSummary";

import {
  BillingUserCapacity,
} from "./BillingUserCapacity";

//************************************************************** */

interface SettingsBillingProps {
  organizationId: string;
  permissions: string[];
}

function errorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error
  ) {
    const data = error.data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  }

  return "MotoDesk could not complete the billing request. Please try again.";
}

function redirectToStripe(
  value: string,
  hostname: "checkout.stripe.com" | "billing.stripe.com",
): void {
  const url = new URL(value);

  if (
    url.protocol !== "https:" ||
    url.hostname !== hostname ||
    url.port !== "" ||
    url.username !== "" ||
    url.password !== ""
  ) {
    throw new Error("Unexpected billing redirect URL.");
  }

  window.location.assign(url.toString());
}

//************************************************************** */

export function SettingsBilling(
  props: SettingsBillingProps,
) {
  if (!props.permissions.includes("billing:view")) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <ShieldAlert
          className="mx-auto h-8 w-8 text-zinc-400"
          aria-hidden="true"
        />

        <h2 className="mt-3 text-sm font-semibold text-zinc-900">
          Billing access required
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Contact your organization owner to request billing access.
        </p>
      </section>
    );
  }

  return (
    <BillingViewer
      key={props.organizationId}
      {...props}
    />
  );
}

//************************************************************** */

function BillingViewer({
  organizationId,
  permissions,
}: SettingsBillingProps) {
  const active = useRef(true);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [pendingPlanId, setPendingPlanId] =
    useState<BillingPlanId | null>(null);

  const [capacityBusy, setCapacityBusy] = useState(false);

  useEffect(() => {
    active.current = true;

    return () => {
      active.current = false;
    };
  }, []);

  const {
    currentData: overview,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetBillingOverviewQuery(organizationId, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 30_000,
    skipPollingIfUnfocused: true,
  });

  const [
    createCheckout,
    { isLoading: checkoutLoading },
  ] = useCreateBillingCheckoutMutation();

  const [
    createPortal,
    { isLoading: portalLoading },
  ] = useCreateBillingPortalMutation();

  const canManageBilling =
    permissions.includes("billing:update");

  const actionPending =
    checkoutLoading ||
    portalLoading ||
    capacityBusy;

  async function handleCheckout(
    planId: BillingPlanId,
  ): Promise<void> {
    if (!canManageBilling || actionPending) {
      return;
    }

    setActionError(null);
    setPendingPlanId(planId);

    try {
      const result = await createCheckout({
        organizationId,
        planId,
      }).unwrap();

      if (active.current) {
        redirectToStripe(
          result.url,
          "checkout.stripe.com",
        );
      }
    } catch (requestError) {
      if (active.current) {
        setActionError(errorMessage(requestError));
        void refetch();
      }
    } finally {
      if (active.current) {
        setPendingPlanId(null);
      }
    }
  }

  async function handlePortal(): Promise<void> {
    if (!canManageBilling || actionPending) {
      return;
    }

    setActionError(null);

    try {
      const result = await createPortal(
        organizationId,
      ).unwrap();

      if (active.current) {
        redirectToStripe(
          result.url,
          "billing.stripe.com",
        );
      }
    } catch (requestError) {
      if (active.current) {
        setActionError(errorMessage(requestError));
      }
    }
  }

  if (isLoading || (!overview && isFetching)) {
    return (
      <section
        aria-busy="true"
        className="flex min-h-64 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm"
      >
        <Loader2
          className="h-4 w-4 animate-spin text-zinc-400"
          aria-hidden="true"
        />

        <p className="text-sm text-zinc-500">
          Loading billing…
        </p>
      </section>
    );
  }

  if (!overview) {
    return (
      <section
        role="alert"
        className="rounded-xl border border-red-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-red-700">
          Billing could not be loaded
        </h2>

        <p className="mt-2 text-sm text-zinc-600">
          {errorMessage(error)}
        </p>

        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          Try again
        </button>
      </section>
    );
  }

  const canStartCheckout = [
    "NOT_SUBSCRIBED",
    "CANCELED",
    "INCOMPLETE_EXPIRED",
  ].includes(overview.subscription.status);

  const hasBillingHistory =
    overview.subscription.plan !== null ||
    overview.checkoutPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Billing & subscription
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Manage your organization’s plan and payment information.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Refresh billing"
            disabled={isFetching || actionPending}
            onClick={() => void refetch()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
          </button>

          {canManageBilling && hasBillingHistory ? (
            <button
              type="button"
              disabled={!overview.configured || actionPending}
              onClick={() => void handlePortal()}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              {portalLoading ? (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <ExternalLink
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              )}

              Manage billing
            </button>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {actionError}
        </p>
      ) : null}

      {isError ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          Billing could not be refreshed. The information below may
          be out of date.
        </p>
      ) : null}

      {!overview.configured ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Subscription billing is not configured for this environment.
          Contact your administrator before purchasing a plan.
        </p>
      ) : null}

      <BillingSubscriptionSummary overview={overview} />

      <BillingUserCapacity
        overview={overview}
        canManageBilling={canManageBilling}
        disabled={
          !overview.configured ||
          checkoutLoading ||
          portalLoading ||
          isError
        }
        onBusyChange={setCapacityBusy}
        onBillingChanged={() => {
          void refetch();
        }}
        onManageBilling={() => {
          void handlePortal();
        }}
      />

      {!overview.billingExempt && canStartCheckout ? (
        <>
          {overview.checkoutPending ? (
            <p
              role="status"
              className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800"
            >
              A checkout is pending. Select the same plan to continue
              an open checkout. If you already completed it, wait for
              confirmation and refresh billing.
            </p>
          ) : null}

          <BillingPlanSelection
            plans={overview.availablePlans}
            assignedUsers={overview.usage.assignedUsers}
            canManageBilling={canManageBilling}
            disabled={
              !overview.configured ||
              actionPending ||
              isError
            }
            pendingPlanId={pendingPlanId}
            onSelectPlan={(planId) => {
              void handleCheckout(planId);
            }}
          />
        </>
      ) : null}
    </div>
  );
}

//************************************************************** */