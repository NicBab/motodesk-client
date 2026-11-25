
"use client";

import { useRef, useState } from "react";

import Link from "next/link";

import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Clock,
  Loader2,
  Settings,
  UserCog,
} from "lucide-react";

import { toast } from "sonner";

import type { AuthSession } from "@/features/auth/auth.types";

import { LogoutButton } from "@/features/auth/components/LogoutButton";

import {
  switchInvitedOrganization,
} from "@/features/membership-invitations/api/switch-invited-organization";

import {
  useGetMyOrganizationsQuery,
} from "@/store/api/organizationsApi";

import {
  ShopLocationSelector,
} from "./ShopLocationSelector";

//************************************************************** */

type AppTopbarProps = {
  session: AuthSession;
};

const navigationItems = [
  {
    href: "/time-clock",
    label: "Time Clock",
    icon: Clock,
  },
  {
    href: "/employees",
    label: "Employees",
    icon: UserCog,
  },
  {
    href: "/scheduling",
    label: "Scheduling",
    icon: CalendarDays,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
] as const;

//************************************************************** */

export function AppTopbar({
  session,
}: AppTopbarProps) {
  const initials = `${session.user.firstName.charAt(0)}${session.user.lastName.charAt(0)}`;

  const [isSwitching, setIsSwitching] =
    useState(false);

  const switchingRef =
    useRef(false);

  const {
    currentData: memberships,
    isLoading,
    isError,
  } = useGetMyOrganizationsQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const activeOrganizationId =
    session.membership?.organizationId ?? "";

  const availableMemberships = (
    memberships ?? []
  ).filter(
    (membership) =>
      membership.status === "ACTIVE" &&
      membership.organization.status === "ACTIVE",
  );

  const hasCurrentOrganization =
    availableMemberships.some(
      (membership) =>
        membership.organization.id ===
        activeOrganizationId,
    );

  //************************************************************** */

  async function handleOrganizationChange(
    organizationId: string,
  ) {
    if (
      !organizationId ||
      organizationId === activeOrganizationId ||
      switchingRef.current
    ) {
      return;
    }

    switchingRef.current = true;

    setIsSwitching(true);

    try {
      await switchInvitedOrganization(
        organizationId,
      );

      // Start the selected workspace with a fresh application
      // instance so no cached data, permissions, open repair
      // orders, or component state from the previous
      // organization remain in memory.

      window.location.replace(
        "/dashboard",
      );
    } catch (error) {
      switchingRef.current = false;

      setIsSwitching(false);

      toast.error(
        "Unable to switch organization",
        {
          description:
            error instanceof Error
              ? error.message
              : "Please try again.",
        },
      );
    }
  }

  //************************************************************** */

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <nav className="flex items-center gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              <Icon className="h-4 w-4" />

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        {activeOrganizationId && !isSwitching ? (
          <ShopLocationSelector
            key={activeOrganizationId}
            switchingEnabled={false}
          />
        ) : null}

        <Link
          href="/settings"
          className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Link>

        <div className="h-7 w-px bg-zinc-200" />

        <div className="min-w-0 text-right">
          <p className="text-xs font-semibold text-zinc-900">
            {session.user.firstName}{" "}
            {session.user.lastName}
          </p>

          <div className="relative mt-0.5 flex items-center justify-end">
            <select
              aria-label="Switch organization"
              value={activeOrganizationId}
              disabled={
                isSwitching ||
                isLoading ||
                isError ||
                availableMemberships.length === 0
              }
              onChange={(event) => {
                void handleOrganizationChange(
                  event.target.value,
                );
              }}
              className="max-w-52 cursor-pointer appearance-none rounded-md border border-transparent bg-transparent py-0.5 pl-1.5 pr-5 text-right text-[11px] font-medium text-zinc-500 outline-none transition hover:border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-default disabled:opacity-60"
            >
              {!hasCurrentOrganization && (
                <option value={activeOrganizationId}>
                  {session.membership?.organizationName ??
                    "MotoDesk"}
                </option>
              )}

              {availableMemberships.map(
                (membership) => (
                  <option
                    key={membership.id}
                    value={
                      membership.organization.id
                    }
                  >
                    {membership.organization.name}
                  </option>
                ),
              )}
            </select>

            {isSwitching || isLoading ? (
              <Loader2
                aria-hidden="true"
                className="pointer-events-none absolute right-1 h-3 w-3 animate-spin text-zinc-500"
              />
            ) : (
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-1 h-3 w-3 text-zinc-500"
              />
            )}
          </div>
        </div>

        <div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-900 text-xs font-bold text-white">
          {initials.toUpperCase()}
        </div>

        <LogoutButton />
      </div>

      {isSwitching && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-4 text-sm font-medium text-zinc-700 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />

            Switching organization...
          </div>
        </div>
      )}
    </header>
  );
}

//************************************************************** */
