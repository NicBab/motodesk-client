"use client";

import { type FormEvent, useState } from "react";

import {
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  Loader2,
  LogOut,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { ApiError } from "@/lib/api/api-error";

import { isStrongPassword } from "@/features/auth/auth.utils";

import { changePassword } from "@/features/auth/api/change-password";

import { logout } from "@/features/auth/api/logout";

import { logoutAll } from "@/features/auth/api/logout-all";

import {
  type ActiveSession,
  useGetActiveSessionsQuery,
  useRevokeOtherSessionsMutation,
  useRevokeSessionMutation,
} from "@/store/api/authApi";

import { useAppDispatch } from "@/store/hooks";

import { baseApi } from "@/store/api/baseApi";

import { clearWorkspace } from "@/store/slices/workspaceSlice";

//************************************************************** */

const inputClasses =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 pr-10 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */

export function SettingsSecurity() {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    isFetching: isFetchingSessions,
    isError: isSessionsError,
    refetch: refetchSessions,
  } = useGetActiveSessionsQuery();

  const [revokeSession, { isLoading: isRevokingSession }] =
    useRevokeSessionMutation();

  const [revokeOtherSessions, { isLoading: isRevokingOtherSessions }] =
    useRevokeOtherSessionsMutation();

  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null,
  );

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [isSigningOut, setIsSigningOut] = useState(false);

  const [isSigningOutAll, setIsSigningOutAll] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //************************************************************** */

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setPasswordError(null);

    const form = event.currentTarget;

    const formData = new FormData(form);

    const currentPassword = String(formData.get("currentPassword") ?? "");

    const newPassword = String(formData.get("newPassword") ?? "");

    const confirmNewPassword = String(formData.get("confirmNewPassword") ?? "");

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");

      return;
    }

    if (!isStrongPassword(newPassword)) {
      setPasswordError(
        "Password must be at least 12 characters and include uppercase, lowercase, a number, and a special character.",
      );

      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      form.reset();

      setShowCurrentPassword(false);

      setShowNewPassword(false);

      setShowConfirmPassword(false);

      toast.success(
        result.revokedSessionCount > 0
          ? `Password changed. ${result.revokedSessionCount} other session${
              result.revokedSessionCount === 1 ? "" : "s"
            } signed out.`
          : "Password changed successfully.",
      );

      await refetchSessions();
    } catch (caughtError) {
      const message =
        caughtError instanceof ApiError
          ? caughtError.message
          : "MotoDesk could not change your password.";

      setPasswordError(message);

      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  }

  //************************************************************** */

  async function handleRevokeSession(sessionId: string): Promise<void> {
    setRevokingSessionId(sessionId);

    try {
      await revokeSession(sessionId).unwrap();

      toast.success("Device signed out successfully.");
    } catch {
      toast.error("MotoDesk could not sign out that device.");
    } finally {
      setRevokingSessionId(null);
    }
  }

  //************************************************************** */

  async function handleRevokeOtherSessions(): Promise<void> {
    try {
      const result = await revokeOtherSessions().unwrap();

      toast.success(
        result.revokedSessionCount > 0
          ? `${result.revokedSessionCount} other session${
              result.revokedSessionCount === 1 ? "" : "s"
            } signed out.`
          : "No other active sessions were found.",
      );
    } catch {
      toast.error("MotoDesk could not sign out your other devices.");
    }
  }

  //************************************************************** */

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);

    try {
      await logout();

      finishSignOut();
    } catch (caughtError) {
      toast.error(
        caughtError instanceof ApiError
          ? caughtError.message
          : "MotoDesk could not sign you out.",
      );

      setIsSigningOut(false);
    }
  }

  //************************************************************** */

  async function handleSignOutAll(): Promise<void> {
    setIsSigningOutAll(true);

    try {
      const result = await logoutAll();

      toast.success(
        `${result.revokedSessionCount} session${
          result.revokedSessionCount === 1 ? "" : "s"
        } signed out.`,
      );

      finishSignOut();
    } catch (caughtError) {
      toast.error(
        caughtError instanceof ApiError
          ? caughtError.message
          : "MotoDesk could not sign out your sessions.",
      );

      setIsSigningOutAll(false);
    }
  }

  //************************************************************** */

  function finishSignOut(): void {
    dispatch(clearWorkspace());

    dispatch(baseApi.util.resetApiState());

    router.replace("/login");

    router.refresh();
  }

  //************************************************************** */

  const otherSessionCount = sessions.filter(
    (session) => !session.isCurrent,
  ).length;

  //************************************************************** */

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <header className="border-b border-zinc-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <KeyRound className="h-4 w-4" />
            Change Password
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Update the password used to sign in to your MotoDesk account.
          </p>
        </header>

        <form onSubmit={handleChangePassword} className="space-y-4 p-5">
          {passwordError ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {passwordError}
            </div>
          ) : null}

          <PasswordField
            id="currentPassword"
            name="currentPassword"
            label="Current Password"
            autoComplete="current-password"
            visible={showCurrentPassword}
            onToggle={() => setShowCurrentPassword((current) => !current)}
          />

          <PasswordField
            id="newPassword"
            name="newPassword"
            label="New Password"
            autoComplete="new-password"
            visible={showNewPassword}
            onToggle={() => setShowNewPassword((current) => !current)}
          />

          <PasswordField
            id="confirmNewPassword"
            name="confirmNewPassword"
            label="Confirm New Password"
            autoComplete="new-password"
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((current) => !current)}
          />

          <p className="text-xs leading-5 text-zinc-500">
            Passwords must be at least 12 characters and contain uppercase,
            lowercase, a number, and a special character.
          </p>

          <div className="flex justify-end border-t border-zinc-100 pt-4">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />

              {isChangingPassword ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <header className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <MonitorSmartphone className="h-4 w-4" />
              Active Sessions
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Review devices currently signed in to your MotoDesk account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refetchSessions()}
            disabled={isFetchingSessions}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isFetchingSessions ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </header>

        {isLoadingSessions ? (
          <div className="flex items-center gap-3 p-5 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading active sessions...
          </div>
        ) : isSessionsError ? (
          <div className="p-5">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                MotoDesk could not load your active sessions.
              </p>

              <button
                type="button"
                onClick={() => void refetchSessions()}
                className="mt-2 text-xs font-semibold text-red-700 underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-5 text-sm text-zinc-500">
            No active sessions were found.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {sessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                isRevoking={
                  isRevokingSession && revokingSessionId === session.id
                }
                disableActions={
                  isRevokingSession ||
                  isRevokingOtherSessions ||
                  isSigningOut ||
                  isSigningOutAll
                }
                onRevoke={() => void handleRevokeSession(session.id)}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-zinc-100 bg-zinc-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-800">
              Sign Out All Other Devices
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              End every other active MotoDesk session while keeping this device
              signed in.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleRevokeOtherSessions()}
            disabled={
              otherSessionCount === 0 ||
              isRevokingOtherSessions ||
              isRevokingSession ||
              isSigningOut ||
              isSigningOutAll
            }
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRevokingOtherSessions
              ? "Signing out..."
              : "Sign Out Other Devices"}
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <header className="border-b border-zinc-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <LogOut className="h-4 w-4" />
            Account Sessions
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            End access on this device or revoke every active MotoDesk session.
          </p>
        </header>

        <div className="divide-y divide-zinc-100">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-800">
                Sign Out This Device
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                End only this current MotoDesk session.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={
                isSigningOut ||
                isSigningOutAll ||
                isRevokingOtherSessions ||
                isRevokingSession
              }
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-800">
                Sign Out Everywhere
              </p>

              <p className="mt-1 max-w-lg text-xs leading-5 text-zinc-500">
                Revoke every active MotoDesk session for this account, including
                this device.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleSignOutAll()}
              disabled={
                isSigningOut ||
                isSigningOutAll ||
                isRevokingOtherSessions ||
                isRevokingSession
              }
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-red-300 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOutAll ? "Signing out..." : "Sign Out Everywhere"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

//************************************************************** */

function SessionRow({
  session,
  isRevoking,
  disableActions,
  onRevoke,
}: {
  session: ActiveSession;

  isRevoking: boolean;

  disableActions: boolean;

  onRevoke: () => void;
}) {
  const device = describeUserAgent(session.userAgent);

  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-600">
          <Laptop className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-zinc-900">{device}</p>

            {session.isCurrent ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                This device
              </span>
            ) : null}
          </div>

          <div className="mt-2 space-y-1 text-xs text-zinc-500">
            <p>
              IP address:{" "}
              <span className="font-medium text-zinc-700">
                {session.ipAddress ?? "Unavailable"}
              </span>
            </p>

            <p className="flex flex-wrap items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              Last active {formatDateTime(session.lastUsedAt)}
            </p>

            <p>Signed in {formatDateTime(session.createdAt)}</p>
          </div>
        </div>
      </div>

      {!session.isCurrent ? (
        <button
          type="button"
          onClick={onRevoke}
          disabled={disableActions}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRevoking ? "Signing out..." : "Sign Out"}
        </button>
      ) : null}
    </div>
  );
}

//************************************************************** */

function describeUserAgent(userAgent: string | null): string {
  if (!userAgent) {
    return "Unknown device";
  }

  const browser = userAgent.includes("Edg/")
    ? "Microsoft Edge"
    : userAgent.includes("Chrome/")
      ? "Google Chrome"
      : userAgent.includes("Firefox/")
        ? "Firefox"
        : userAgent.includes("Safari/")
          ? "Safari"
          : "Browser";

  const operatingSystem = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Macintosh")
      ? "macOS"
      : userAgent.includes("iPhone")
        ? "iPhone"
        : userAgent.includes("iPad")
          ? "iPad"
          : userAgent.includes("Android")
            ? "Android"
            : userAgent.includes("Linux")
              ? "Linux"
              : "Unknown device";

  return `${browser} on ${operatingSystem}`;
}

//************************************************************** */

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",

    timeStyle: "short",
  }).format(date);
}

//************************************************************** */

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  visible,
  onToggle,
}: {
  id: string;

  name: string;

  label: string;

  autoComplete: string;

  visible: boolean;

  onToggle: () => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-700">
        {label}
      </span>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          className={inputClasses}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          aria-pressed={visible}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </label>
  );
}

//************************************************************** */
