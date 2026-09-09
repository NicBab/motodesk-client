"use client";

import {
  useEffect,
} from "react";

import type {
  AuthSession,
  DisplayMode,
} from "@/features/auth/auth.types";

import {
  type ApplicationTheme,
  useGetOrganizationQuery,
} from "@/store/api/organizationsApi";

//************************************************************** */

const DISPLAY_MODE_STORAGE_KEY =
  "motodesk-display-mode";

const APPLICATION_THEME_STORAGE_KEY =
  "motodesk-app-theme";

//************************************************************** */

type AppearanceSynchronizerProps = {
  session:
    AuthSession;
};

//************************************************************** */

export function AppearanceSynchronizer({
  session,
}: AppearanceSynchronizerProps) {
  const organizationId =
    session.membership
      ?.organizationId ??
    null;

  const {
    data:
      organization,
  } =
    useGetOrganizationQuery(
      organizationId ??
        "",
      {
        skip:
          !organizationId,
      },
    );

  //************************************************************** */
  // Authenticated user display preference

  useEffect(
    () => {
      const displayMode =
        session.user.displayMode;

      applyDisplayMode(
        displayMode,
      );

      window.localStorage.setItem(
        DISPLAY_MODE_STORAGE_KEY,
        displayMode.toLowerCase(),
      );
    },
    [
      session.user.displayMode,
    ],
  );

  //************************************************************** */
  // Re-apply SYSTEM mode whenever the OS preference changes.

  useEffect(
    () => {
      if (
        session.user.displayMode !==
        "SYSTEM"
      ) {
        return;
      }

      const mediaQuery =
        window.matchMedia(
          "(prefers-color-scheme: dark)",
        );

      const handleChange =
        () => {
          applyDisplayMode(
            "SYSTEM",
          );
        };

      mediaQuery.addEventListener(
        "change",
        handleChange,
      );

      return () => {
        mediaQuery.removeEventListener(
          "change",
          handleChange,
        );
      };
    },
    [
      session.user.displayMode,
    ],
  );

  //************************************************************** */
  // Organization theme

  useEffect(
    () => {
      if (
        !organization
      ) {
        return;
      }

      const applicationTheme =
        normalizeApplicationTheme(
          organization.applicationTheme,
        );

      applyApplicationTheme(
        applicationTheme,
      );

      window.localStorage.setItem(
        APPLICATION_THEME_STORAGE_KEY,
        applicationTheme,
      );
    },
    [
      organization,
    ],
  );

  return null;
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

function normalizeApplicationTheme(
  applicationTheme:
    ApplicationTheme |
    "default",
): ApplicationTheme {
  return applicationTheme ===
    "default"
      ? "offroad"
      : applicationTheme;
}

//************************************************************** */