"use client";

import {
  useState,
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
  useGetCurrentUserQuery,
} from "@/store/api/authApi";

//************************************************************** */

type SettingsTab =
  | "profile"
  | "billing"
  | "appearance"
  | "security";

//************************************************************** */

const SETTINGS_TABS: Array<{
  id: SettingsTab;
  label: string;
}> = [
  {
    id: "profile",
    label: "Profile",
  },
  {
    id: "billing",
    label: "Billing",
  },
  {
    id: "appearance",
    label: "Appearance",
  },
  {
    id: "security",
    label: "Security",
  },
];

//************************************************************** */

export default function SettingsPage() {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<SettingsTab>(
      "profile",
    );

  const {
    data: session,
    isLoading,
    isError,
    refetch,
  } =
    useGetCurrentUserQuery();

  //************************************************************** */

  return (
    <div
      className={
        activeTab ===
        "billing"
          ? "max-w-5xl space-y-6"
          : "max-w-2xl space-y-6"
      }
    >
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage your account and preferences
        </p>
      </header>

      <nav className="w-full overflow-x-auto border-b border-zinc-200">
        <div className="flex min-w-max gap-1">
          {SETTINGS_TABS.map(
            (
              tab,
            ) => {
              const selected =
                activeTab ===
                tab.id;

              return (
                <button
                  key={
                    tab.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id,
                    )
                  }
                  className={[
                    "-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                    selected
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900",
                  ].join(
                    " ",
                  )}
                >
                  {
                    tab.label
                  }
                </button>
              );
            },
          )}
        </div>
      </nav>

      {isLoading ? (
        <SettingsState>
          Loading settings...
        </SettingsState>
      ) : isError ? (
        <SettingsError
          onRetry={
            refetch
          }
        />
      ) : !session ? (
        <SettingsState>
          MotoDesk could not load your account.
        </SettingsState>
      ) : (
        <>
          {activeTab ===
          "profile" ? (
            <SettingsProfile
              user={
                session.user
              }
            />
          ) : null}

          {activeTab ===
          "appearance" ? (
            session.membership ? (
              <SettingsAppearance
                user={
                  session.user
                }
                organizationId={
                  session.membership
                    .organizationId
                }
                permissions={
                  session.permissions
                }
              />
            ) : (
              <SettingsState>
                An organization membership is required to manage Appearance.
              </SettingsState>
            )
          ) : null}

          {activeTab ===
          "security" ? (
            <SettingsSecurity />
          ) : null}

          {activeTab ===
          "billing" ? (
            <SettingsBillingUnavailable />
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
  children:
    React.ReactNode;
}) {
  return (
    <section className="grid min-h-64 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm text-zinc-500">
        {
          children
        }
      </p>
    </section>
  );
}

//************************************************************** */

function SettingsError({
  onRetry,
}: {
  onRetry:
    () => void;
}) {
  return (
    <section className="grid min-h-64 place-items-center rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
      <div>
        <p className="text-sm font-semibold text-red-700">
          MotoDesk could not load Settings.
        </p>

        <button
          type="button"
          onClick={
            onRetry
          }
          className="mt-4 h-9 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          Try Again
        </button>
      </div>
    </section>
  );
}

//************************************************************** */

function SettingsBillingUnavailable() {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900">
        Billing
      </h2>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        Subscription billing is not configured for this MotoDesk environment yet.
        Plan management, payment methods, invoices, and subscription changes will
        appear here once the production billing provider is connected.
      </p>
    </section>
  );
}

//************************************************************** */