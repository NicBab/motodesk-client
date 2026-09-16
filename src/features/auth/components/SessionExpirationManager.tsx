"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Clock3 } from "lucide-react";

import { useRouter } from "next/navigation";

import type { AuthSession } from "@/features/auth/auth.types";

import { logout } from "@/features/auth/api/logout";

import { useRefreshSessionMutation } from "@/store/api/authApi";

import { baseApi } from "@/store/api/baseApi";

import { useAppDispatch } from "@/store/hooks";

import { clearWorkspace } from "@/store/slices/workspaceSlice";

//************************************************************** */

const DEVELOPMENT_QA_WARNING_SECONDS = 10;

const EXPIRATION_WARNING_SECONDS = 120;

// const EXPIRATION_WARNING_MILLISECONDS = EXPIRATION_WARNING_SECONDS * 1_000;

const EXPIRATION_WARNING_MILLISECONDS =
  (
    process.env.NODE_ENV === "development"
      ? DEVELOPMENT_QA_WARNING_SECONDS
      : EXPIRATION_WARNING_SECONDS
  ) * 1_000;

//************************************************************** */

type SessionExpirationManagerProps = {
  session: AuthSession;
};

//************************************************************** */

export function SessionExpirationManager({
  session,
}: SessionExpirationManagerProps) {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [refreshSession, { isLoading: isRefreshing }] =
    useRefreshSessionMutation();

  const [isOpen, setIsOpen] = useState(false);

  const [secondsRemaining, setSecondsRemaining] = useState(
    EXPIRATION_WARNING_SECONDS,
  );

  const isEndingSessionRef = useRef(false);

  //************************************************************** */

  const finishLogout = useCallback(() => {
    dispatch(clearWorkspace());

    dispatch(baseApi.util.resetApiState());

    router.replace("/login");

    router.refresh();
  }, [dispatch, router]);

  //************************************************************** */

  const endSession = useCallback(
    async (attemptServerLogout: boolean) => {
      if (isEndingSessionRef.current) {
        return;
      }

      isEndingSessionRef.current = true;

      try {
        if (attemptServerLogout) {
          await logout();
        }
      } catch {
        // Local authentication state must still be cleared if
        // the server session has already expired.
      } finally {
        finishLogout();
      }
    },
    [finishLogout],
  );

  //************************************************************** */

  useEffect(() => {
    const expiration = session.accessTokenExpiresAt;

    if (!expiration) {
      return;
    }

    const expirationTime = new Date(expiration).getTime();

    if (Number.isNaN(expirationTime)) {
      return;
    }

    const updateCountdown = () => {
      const millisecondsRemaining = expirationTime - Date.now();

      if (millisecondsRemaining <= 0) {
        setSecondsRemaining(0);

        setIsOpen(true);

        void endSession(false);

        return;
      }

      if (millisecondsRemaining <= EXPIRATION_WARNING_MILLISECONDS) {
        setSecondsRemaining(Math.ceil(millisecondsRemaining / 1_000));

        setIsOpen(true);

        return;
      }

      setIsOpen(false);
    };

    updateCountdown();

    const intervalId = window.setInterval(updateCountdown, 1_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [endSession, session.accessTokenExpiresAt]);

  //************************************************************** */

  async function handleStaySignedIn() {
    try {
      await refreshSession().unwrap();

      setIsOpen(false);

      setSecondsRemaining(EXPIRATION_WARNING_SECONDS);
    } catch {
      await endSession(false);
    }
  }

  //************************************************************** */

  async function handleSignOut() {
    await endSession(true);
  }

  //************************************************************** */

  if (!isOpen) {
    return null;
  }

  const minutes = Math.floor(secondsRemaining / 60);

  const seconds = secondsRemaining % 60;

  const formattedCountdown = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  //************************************************************** */

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-expiration-title"
        aria-describedby="session-expiration-description"
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
            <Clock3 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2
              id="session-expiration-title"
              className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
            >
              Your session is expiring
            </h2>

            <p
              id="session-expiration-description"
              className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
            >
              For security, you&apos;ll be signed out when the timer reaches
              zero. Stay signed in to continue working without interruption.
            </p>
          </div>
        </div>

        <div className="my-6 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Time remaining
          </div>

          <div
            className="mt-1 font-mono text-4xl font-bold tabular-nums text-zinc-950 dark:text-zinc-50"
            aria-live="polite"
          >
            {formattedCountdown}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isRefreshing}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Sign out
          </button>

          <button
            type="button"
            onClick={handleStaySignedIn}
            disabled={isRefreshing}
            className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? "Extending session..." : "Stay signed in"}
          </button>
        </div>
      </div>
    </div>
  );
}
