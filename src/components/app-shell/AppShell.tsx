
"use client";

import {
  type ReactNode,
  useEffect,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  AlertTriangle,
} from "lucide-react";

import {
  skipToken,
} from "@reduxjs/toolkit/query";

import {
  clearWorkspace,
  setActiveOrganization,
} from "@/store/slices/workspaceSlice";

import {
  useGetCurrentUserQuery,
} from "@/store/api/authApi";

import {
  useGetSubscriptionAccessQuery,
} from "@/store/api/billingApi";

import {
  useAppDispatch,
} from "@/store/hooks";

import {
  OpenRepairOrdersProvider,
} from "@/features/repair-orders/open-repair-orders.context";

import {
  AppearanceSynchronizer,
} from "@/features/settings/components/AppearanceSynchronizer";

import {
  SessionExpirationManager,
} from "@/features/auth/components/SessionExpirationManager";

import {
  AppSidebar,
} from "./AppSidebar";

import {
  AppTopbar,
} from "./AppTopbar";

//************************************************************** */

type AppShellProps = {
  children: ReactNode;
};

//************************************************************** */

export function AppShell({
  children,
}: AppShellProps) {
  const router =
    useRouter();

  const dispatch =
    useAppDispatch();

  const {
    data: session,
    isLoading,
    isError,
  } =
    useGetCurrentUserQuery();

  //************************************************************** */

  const subscriptionOrganizationId =
    !isError &&
    session?.user.emailVerifiedAt &&
    session.membership
      ? session.membership.organizationId
      : skipToken;

  const {
    currentData: subscriptionAccess,
  } = useGetSubscriptionAccessQuery(
    subscriptionOrganizationId,
    {
      pollingInterval: 60_000,
      refetchOnMountOrArgChange: true,
    },
  );

  const isSubscriptionRestricted =
    subscriptionAccess?.accessMode ===
    "READ_ONLY";

  const canViewBilling =
    session?.permissions.includes(
      "billing:view",
    ) ?? false;

  const canUpdateBilling =
    session?.permissions.includes(
      "billing:update",
    ) ?? false;

  //************************************************************** */

  useEffect(() => {
    if (
      !session?.membership ||
      !session.user.emailVerifiedAt
    ) {
      return;
    }

    dispatch(
      setActiveOrganization({
        id:
          session.membership.organizationId,

        name:
          session.membership.organizationName,
      }),
    );
  }, [
    dispatch,
    session,
  ]);

  //************************************************************** */

  useEffect(() => {
    if (
      isLoading ||
      isError ||
      !session ||
      session.user.emailVerifiedAt
    ) {
      return;
    }

    dispatch(
      clearWorkspace(),
    );

    router.replace(
      `/verify-email?email=${encodeURIComponent(
        session.user.email.toLowerCase(),
      )}`,
    );
  }, [
    dispatch,
    isError,
    isLoading,
    router,
    session,
  ]);

  //************************************************************** */

  useEffect(() => {
    if (
      isLoading ||
      isError ||
      !session ||
      !session.user.emailVerifiedAt ||
      session.membership
    ) {
      return;
    }

    dispatch(
      clearWorkspace(),
    );

    router.replace(
      "/onboarding",
    );
  }, [
    dispatch,
    isError,
    isLoading,
    router,
    session,
  ]);

  //************************************************************** */

  useEffect(() => {
    if (!isError) {
      return;
    }

    dispatch(
      clearWorkspace(),
    );

    router.replace(
      "/login",
    );
  }, [
    dispatch,
    isError,
    router,
  ]);

  //************************************************************** */

  if (isLoading) {
    return (
      <main className="motodesk-app-background grid min-h-screen place-items-center">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />

          Loading MotoDesk...
        </div>
      </main>
    );
  }

  //************************************************************** */

  if (
    isError ||
    !session ||
    !session.user.emailVerifiedAt ||
    !session.membership
  ) {
    return null;
  }

  //************************************************************** */

  return (
    <>
      <AppearanceSynchronizer
        session={session}
      />

      <SessionExpirationManager
        session={session}
      />

      <OpenRepairOrdersProvider>
        <div className="motodesk-app-background flex h-screen overflow-hidden">
          <AppSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <AppTopbar
              session={session}
            />

            {isSubscriptionRestricted && (
              <div
                role="status"
                className="shrink-0 border-b border-amber-200 bg-amber-50 px-6 py-3 dark:border-amber-900 dark:bg-amber-950/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <AlertTriangle
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                        Subscription requires attention
                      </p>

                      <p className="mt-0.5 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                        {canViewBilling && canUpdateBilling
                          ? "Your workspace is read-only. Manage your subscription to restore full access."
                          : "Your workspace is read-only. Contact your organization owner or administrator to restore full access."}
                      </p>
                    </div>
                  </div>

                  {canViewBilling && (
                    <Link
                      href="/settings?tab=billing"
                      className="inline-flex shrink-0 items-center justify-center rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 dark:hover:bg-amber-900"
                    >
                      {canUpdateBilling
                        ? "Manage billing"
                        : "View billing"}
                    </Link>
                  )}
                </div>
              </div>
            )}

            <main className="min-w-0 flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </OpenRepairOrdersProvider>
    </>
  );
}

//************************************************************** */
