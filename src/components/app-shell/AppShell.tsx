"use client";

import { type ReactNode, useEffect } from "react";

import { useRouter } from "next/navigation";

import {
  clearWorkspace,
  setActiveOrganization,
} from "@/store/slices/workspaceSlice";

import { useGetCurrentUserQuery } from "@/store/api/authApi";

import { useAppDispatch } from "@/store/hooks";

import { OpenRepairOrdersProvider } from "@/features/repair-orders/open-repair-orders.context";

import { AppearanceSynchronizer } from "@/features/settings/components/AppearanceSynchronizer";

import { AppSidebar } from "./AppSidebar";

import { AppTopbar } from "./AppTopbar";

import { SessionExpirationManager } from "@/features/auth/components/SessionExpirationManager";

//************************************************************** */

type AppShellProps = {
  children: ReactNode;
};

//************************************************************** */

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const { data: session, isLoading, isError } = useGetCurrentUserQuery();

  //************************************************************** */
  // Keep the active workspace synchronized with the membership
  // carried by the authenticated session.

  useEffect(() => {
    if (!session?.membership) {
      return;
    }

    dispatch(
      setActiveOrganization({
        id: session.membership.organizationId,

        name: session.membership.organizationName,
      }),
    );
  }, [dispatch, session]);

  //************************************************************** */
  // An authenticated account without a membership has completed
  // identity creation but has not completed MotoDesk onboarding.
  //
  // Do not render the application shell for that account. Send it
  // to workspace setup instead.

  useEffect(() => {
    if (isLoading || isError || !session || session.membership) {
      return;
    }

    dispatch(clearWorkspace());

    router.replace("/onboarding");
  }, [dispatch, isError, isLoading, router, session]);

  //************************************************************** */
  // Authentication failures return to login.

  useEffect(() => {
    if (!isError) {
      return;
    }

    dispatch(clearWorkspace());

    router.replace("/login");
  }, [dispatch, isError, router]);

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
  // Nothing from the protected application may render while an
  // unauthenticated account or an account requiring onboarding is
  // being redirected.

  if (isError || !session || !session.membership) {
    return null;
  }

  //************************************************************** */

  return (
    <>
      <AppearanceSynchronizer session={session} />

      <SessionExpirationManager session={session} />

      <OpenRepairOrdersProvider>
        <div className="motodesk-app-background flex h-screen overflow-hidden">
          <AppSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <AppTopbar session={session} />

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
