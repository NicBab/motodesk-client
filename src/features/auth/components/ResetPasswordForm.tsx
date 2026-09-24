//************************************************************** */

"use client";

import { type FormEvent, useState } from "react";

import Link from "next/link";

import { useResetPasswordMutation } from "@/store/api/authApi";

import { Eye, EyeOff } from "lucide-react";

//************************************************************** */

type ResetPasswordFormProps = {
  token: string;
};

//************************************************************** */

const inputClasses =
  "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */

function getErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error
  ) {
    const data =
      (
        error as {
          data?: unknown;
        }
      ).data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data
    ) {
      const message =
        (
          data as {
            message?: unknown;
          }
        ).message;

      if (
        message ===
        "Request body validation failed."
      ) {
        return "Password must be at least 12 characters and include an uppercase letter, lowercase letter, number, and special character.";
      }

      if (
        typeof message === "string"
      ) {
        return message;
      }
    }
  }

  return "MotoDesk could not reset your password. Please try again.";
}

//************************************************************** */

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [error, setError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //************************************************************** */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);

    const password = String(formData.get("password") ?? "");

    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");

      return;
    }

    try {
      const result = await resetPassword({
        token,
        password,
        confirmPassword,
      }).unwrap();

      setSuccessMessage(result.message);

      event.currentTarget.reset();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  }

  //************************************************************** */

  if (!token) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          role="alert"
        >
          This password-reset link is invalid or incomplete.
        </div>

        <Link
          href="/forgot-password"
          className="mt-5 flex h-11 w-full items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  //************************************************************** */

  if (successMessage) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
          role="status"
        >
          {successMessage}
        </div>

        <Link
          href="/login"
          className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-bold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/20"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  //************************************************************** */

  return (
    <form
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7"
      onSubmit={handleSubmit}
    >
      <div className="space-y-5">
        {error ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-zinc-700">
            New password
          </span>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
  Use at least 12 characters with an uppercase letter, lowercase letter,
  number, and special character.
</p>

          <div className="relative">
            <input
              className={`${inputClasses} pr-11`}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={12}
              disabled={isLoading}
              autoFocus
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-400 transition hover:text-zinc-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-zinc-700">
            Confirm new password
          </span>

          <div className="relative">
            <input
              className={`${inputClasses} pr-11`}
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={12}
              disabled={isLoading}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-400 transition hover:text-zinc-700"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </label>

        <button
          className="flex h-12 w-full items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-bold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Resetting password..." : "Reset password"}
        </button>
      </div>
    </form>
  );
}

//************************************************************** */
