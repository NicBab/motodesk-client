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

import { AppSidebar } from "./AppSidebar";

import { AppTopbar } from "./AppTopbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const { data: session, isLoading, isError } = useGetCurrentUserQuery();

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

  useEffect(() => {
    if (!isError) {
      return;
    }

    dispatch(clearWorkspace());

    router.replace("/login");
  }, [dispatch, isError, router]);

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-100">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
          Loading MotoDesk...
        </div>
      </main>
    );
  }

  if (isError || !session) {
    return null;
  }

  return (
    <OpenRepairOrdersProvider>
      <div className="flex h-screen overflow-hidden bg-zinc-100">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar session={session} />

          <main className="min-w-0 flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </OpenRepairOrdersProvider>
  );
}
