"use client";

import {
  Monitor,
  Moon,
  Palette,
  Sun,
} from "lucide-react";

import {
  toast,
} from "sonner";

import type {
  AuthenticatedUser,
  DisplayMode,
} from "@/features/auth/auth.types";

import {
  useUpdateProfileMutation,
} from "@/store/api/authApi";

import {
  type ApplicationTheme,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
} from "@/store/api/organizationsApi";

//************************************************************** */

const DISPLAY_MODE_STORAGE_KEY =
  "motodesk-display-mode";

const APPLICATION_THEME_STORAGE_KEY =
  "motodesk-app-theme";

//************************************************************** */

type SettingsAppearanceProps = {
  user:
    AuthenticatedUser;

  organizationId:
    string;

  permissions:
    string[];
};

//************************************************************** */

const DISPLAY_MODES: Array<{
  value:
    DisplayMode;

  label:
    string;

  icon:
    typeof Sun;
}> = [
  {
    value:
      "LIGHT",

    label:
      "Light",

    icon:
      Sun,
  },

  {
    value:
      "DARK",

    label:
      "Dark",

    icon:
      Moon,
  },

  {
    value:
      "SYSTEM",

    label:
      "System",

    icon:
      Monitor,
  },
];

//************************************************************** */

const APPLICATION_THEMES: Array<{
  value:
    ApplicationTheme;

  label:
    string;

  dotClassName:
    string;
}> = [
  {
    value:
      "offroad",

    label:
      "Offroad",

    dotClassName:
      "bg-orange-500",
  },

  {
    value:
      "marine",

    label:
      "Marine",

    dotClassName:
      "bg-blue-700",
  },

  {
    value:
      "lawn",

    label:
      "Lawn",

    dotClassName:
      "bg-green-700",
  },

  {
    value:
      "sport",

    label:
      "Sport",

    dotClassName:
      "bg-red-700",
  },
];

//************************************************************** */

export function SettingsAppearance({
  user,
  organizationId,
  permissions,
}: SettingsAppearanceProps) {
  const {
    data:
      organization,
    isLoading:
      isOrganizationLoading,
  } =
    useGetOrganizationQuery(
      organizationId,
    );

  const [
    updateProfile,
    {
      isLoading:
        isUpdatingDisplayMode,
    },
  ] =
    useUpdateProfileMutation();

  const [
    updateOrganization,
    {
      isLoading:
        isUpdatingTheme,
    },
  ] =
    useUpdateOrganizationMutation();

  //************************************************************** */

  const canManageTheme =
    permissions.includes(
      "organization:update",
    );

  const currentTheme =
    organization?.applicationTheme ===
    "default"
      ? "offroad"
      : organization
          ?.applicationTheme ??
        "offroad";

  //************************************************************** */

  async function handleDisplayModeChange(
    displayMode:
      DisplayMode,
  ): Promise<void> {
    const previousMode =
      user.displayMode;

    applyDisplayMode(
      displayMode,
    );

    window.localStorage.setItem(
      DISPLAY_MODE_STORAGE_KEY,
      displayMode.toLowerCase(),
    );

    try {
      await updateProfile({
        displayMode,
      }).unwrap();

      toast.success(
        "Display mode updated",
      );
    } catch {
      applyDisplayMode(
        previousMode,
      );

      window.localStorage.setItem(
        DISPLAY_MODE_STORAGE_KEY,
        previousMode.toLowerCase(),
      );

      toast.error(
        "Failed to save display mode",
      );
    }
  }

  //************************************************************** */

  async function handleThemeChange(
    applicationTheme:
      ApplicationTheme,
  ): Promise<void> {
    if (
      !canManageTheme
    ) {
      return;
    }

    const previousTheme =
      currentTheme;

    applyApplicationTheme(
      applicationTheme,
    );

    window.localStorage.setItem(
      APPLICATION_THEME_STORAGE_KEY,
      applicationTheme,
    );

    try {
      await updateOrganization({
        organizationId,
        applicationTheme,
      }).unwrap();

      toast.success(
        "Theme updated",
      );
    } catch {
      applyApplicationTheme(
        previousTheme,
      );

      window.localStorage.setItem(
        APPLICATION_THEME_STORAGE_KEY,
        previousTheme,
      );

      toast.error(
        "Failed to save theme",
      );
    }
  }

  //************************************************************** */

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <header className="border-b border-zinc-100 px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <Palette className="h-4 w-4" />

          Appearance
        </h2>
      </header>

      <div className="space-y-7 p-5">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-zinc-700">
              Display Mode
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Choose your preferred light or dark appearance.
            </p>
          </div>

          <div className="inline-flex overflow-hidden rounded-lg border border-zinc-300 bg-white">
            {DISPLAY_MODES.map(
              ({
                value,
                label,
                icon:
                  Icon,
              }) => {
                const selected =
                  user.displayMode ===
                  value;

                return (
                  <button
                    key={
                      value
                    }
                    type="button"
                    disabled={
                      isUpdatingDisplayMode
                    }
                    onClick={() =>
                      void handleDisplayModeChange(
                        value,
                      )
                    }
                    className={[
                      "inline-flex h-10 items-center gap-2 border-r border-zinc-200 px-4 text-sm font-medium transition last:border-r-0 disabled:cursor-not-allowed disabled:opacity-60",
                      selected
                        ? "bg-zinc-900 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                    ].join(
                      " ",
                    )}
                  >
                    <Icon className="h-4 w-4" />

                    {
                      label
                    }
                  </button>
                );
              },
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-zinc-700">
              Organization Theme
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {canManageTheme
                ? "Select the industry theme for your organization."
                : "Set by your organization administrator."}
            </p>
          </div>

          {isOrganizationLoading ? (
            <p className="text-sm text-zinc-400">
              Loading organization theme...
            </p>
          ) : (
            <div className="inline-flex overflow-hidden rounded-lg border border-zinc-300 bg-white">
              {APPLICATION_THEMES.map(
                ({
                  value,
                  label,
                  dotClassName,
                }) => {
                  const selected =
                    currentTheme ===
                    value;

                  return (
                    <button
                      key={
                        value
                      }
                      type="button"
                      disabled={
                        !canManageTheme ||
                        isUpdatingTheme
                      }
                      onClick={() =>
                        void handleThemeChange(
                          value,
                        )
                      }
                      className={[
                        "inline-flex h-10 items-center gap-2 border-r border-zinc-200 px-4 text-sm font-medium transition last:border-r-0 disabled:cursor-not-allowed disabled:opacity-50",
                        selected
                          ? "bg-zinc-900 text-white"
                          : "bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                      ].join(
                        " ",
                      )}
                    >
                      <span
                        className={`h-3 w-3 rounded-full border border-black/10 ${dotClassName}`}
                      />

                      {
                        label
                      }
                    </button>
                  );
                },
              )}
            </div>
          )}
        </div>

        <AppearancePreview />
      </div>
    </section>
  );
}

//************************************************************** */

function AppearancePreview() {
  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Preview
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="h-9 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white"
        >
          Primary Button
        </button>

        <button
          type="button"
          className="h-9 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700"
        >
          Secondary
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
          Active Tab
        </span>

        <span className="rounded-full bg-zinc-200 px-2 py-1 text-xs text-zinc-600">
          Inactive
        </span>
      </div>
    </div>
  );
}

//************************************************************** */

function applyDisplayMode(
  displayMode:
    DisplayMode,
): void {
  const root =
    document.documentElement;

  const effectiveMode =
    displayMode ===
    "SYSTEM"
      ? window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches
        ? "DARK"
        : "LIGHT"
      : displayMode;

  root.classList.toggle(
    "dark",
    effectiveMode ===
      "DARK",
  );

  root.dataset.displayMode =
    displayMode.toLowerCase();
}

//************************************************************** */

function applyApplicationTheme(
  applicationTheme:
    ApplicationTheme,
): void {
  document.documentElement.dataset.theme =
    applicationTheme;
}

//************************************************************** */