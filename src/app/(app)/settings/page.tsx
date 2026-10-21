"use client";

import {
  type ReactNode,
  useState,
  useSyncExternalStore,
} from "react";

import {
  SettingsAppearance,
} from "@/features/settings/components/SettingsAppearance";

import {
  SettingsProfile,
} from "@/features/settings/components/SettingsProfile";

import {
  SettingsSecurity,
} from "@/features/settings/components/SettingsSecurity";

import {
  CompanySettings,
} from "@/features/settings/components/CompanySettings";

import {
  SettingsAuditLogs,
} from "@/features/settings/components/SettingsAuditLogs";

import {
  SettingsBilling,
} from "@/features/settings/components/SettingsBilling";

import {
  useGetCurrentUserQuery,
} from "@/store/api/authApi";

//************************************************************** */

type SettingsTab =
  | "profile"
  | "appearance"
  | "security"
  | "company"
  | "billing"
  | "audit";

const SETTINGS_TABS: Array<{
  id: SettingsTab;
  label: string;
}> = [
  { id: "profile", label: "Profile" },
  { id: "appearance", label: "Appearance" },
  { id: "security", label: "Security" },
  { id: "company", label: "Company Settings" },
  { id: "billing", label: "Billing" },
  { id: "audit", label: "Audit Logs" },
];

//************************************************************** */

function subscribeToLocation(
  onChange: () => void,
): () => void {
  window.addEventListener("popstate", onChange);

  return () => {
    window.removeEventListener("popstate", onChange);
  };
}

function isBillingReturn(): boolean {
  const value = new URLSearchParams(
    window.location.search,
  ).get("billing");

  return (
    value === "success" ||
    value === "canceled" ||
    value === "portal"
  );
}

function serverBillingReturn(): boolean {
  return false;
}

//************************************************************** */

export default function SettingsPage() {
  const [selectedTab, setSelectedTab] =
    useState<SettingsTab | null>(null);

  const billingReturn = useSyncExternalStore(
    subscribeToLocation,
    isBillingReturn,
    serverBillingReturn,
  );

  const {
    data: session,
    isLoading,
    isError,
    refetch,
  } = useGetCurrentUserQuery();

  const canViewAuditLogs =
    !!session?.membership &&
    session.permissions.includes("audit:view");

  const canViewBilling =
    !!session?.membership &&
    session.permissions.includes("billing:view");

  const visibleTabs = SETTINGS_TABS.filter((tab) => {
    if (tab.id === "audit") {
      return canViewAuditLogs;
    }

    if (tab.id === "billing") {
      return canViewBilling;
    }

    return true;
  });

  const requestedTab =
    selectedTab ?? (billingReturn ? "billing" : "profile");

  const activeTab = visibleTabs.some(
    (tab) => tab.id === requestedTab,
  )
    ? requestedTab
    : "profile";

  const widthClass =
    activeTab === "audit"
      ? "max-w-7xl"
      : activeTab === "billing"
        ? "max-w-5xl"
        : "max-w-2xl";

  return (
    <div className={`${widthClass} space-y-6`}>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage your account and preferences
        </p>
      </header>

      <nav
        aria-label="Settings sections"
        className="w-full overflow-x-auto border-b border-zinc-200"
      >
        <div className="flex min-w-max gap-1">
          {visibleTabs.map((tab) => {
            const selected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                aria-current={selected ? "page" : undefined}
                onClick={() => setSelectedTab(tab.id)}
                className={[
                  "-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  selected
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {isLoading ? (
        <SettingsState>Loading settings...</SettingsState>
      ) : isError ? (
        <SettingsError onRetry={() => void refetch()} />
      ) : !session ? (
        <SettingsState>
          MotoDesk could not load your account.
        </SettingsState>
      ) : (
        <>
          {activeTab === "profile" ? (
            <SettingsProfile user={session.user} />
          ) : null}

          {activeTab === "appearance" ? (
            session.membership ? (
              <SettingsAppearance
                user={session.user}
                organizationId={
                  session.membership.organizationId
                }
                permissions={session.permissions}
              />
            ) : (
              <SettingsState>
                An organization membership is required to manage
                Appearance.
              </SettingsState>
            )
          ) : null}

          {activeTab === "security" ? (
            <SettingsSecurity />
          ) : null}

          {activeTab === "company" ? (
            session.membership ? (
              <CompanySettings
                organizationId={
                  session.membership.organizationId
                }
                permissions={session.permissions}
              />
            ) : (
              <SettingsState>
                An organization membership is required to manage
                Company Settings.
              </SettingsState>
            )
          ) : null}

          {activeTab === "billing" && session.membership ? (
            <SettingsBilling
              organizationId={
                session.membership.organizationId
              }
              permissions={session.permissions}
            />
          ) : null}

          {activeTab === "audit" ? (
            session.membership ? (
              <SettingsAuditLogs
                organizationId={
                  session.membership.organizationId
                }
                permissions={session.permissions}
              />
            ) : (
              <SettingsState>
                An organization membership is required to view
                Audit Logs.
              </SettingsState>
            )
          ) : null}
        </>
      )}
    </div>
  );
}

//************************************************************** */

function SettingsState({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="grid min-h-64 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm text-zinc-500">
        {children}
      </p>
    </section>
  );
}

//************************************************************** */

function SettingsError({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <section className="grid min-h-64 place-items-center rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
      <div>
        <p className="text-sm font-semibold text-red-700">
          MotoDesk could not load Settings.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-4 h-9 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          Try Again
        </button>
      </div>
    </section>
  );
}

//************************************************************** */