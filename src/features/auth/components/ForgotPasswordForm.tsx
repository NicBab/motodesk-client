//************************************************************** */

"use client";

import {
  type FormEvent,
  useState,
} from "react";

import {
  useRequestPasswordResetMutation,
} from "@/store/api/authApi";

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
      "message" in data &&
      typeof (
        data as {
          message?: unknown;
        }
      ).message === "string"
    ) {
      return (
        data as {
          message: string;
        }
      ).message;
    }
  }

  return "MotoDesk could not send the password reset email. Please try again.";
}

//************************************************************** */

export function ForgotPasswordForm() {
  const [
    requestPasswordReset,
    {
      isLoading,
    },
  ] =
    useRequestPasswordResetMutation();

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<string | null>(
      null,
    );

  //************************************************************** */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(
      null,
    );

    setSuccessMessage(
      null,
    );

    const formData =
      new FormData(
        event.currentTarget,
      );

    const email =
      String(
        formData.get(
          "email",
        ) ?? "",
      ).trim();

    try {
      const result =
        await requestPasswordReset({
          email,
        }).unwrap();

      setSuccessMessage(
        result.message,
      );
    } catch (caughtError) {
      setError(
        getErrorMessage(
          caughtError,
        ),
      );
    }
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

        {successMessage ? (
          <div
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
            role="status"
          >
            {successMessage}

            <p className="mt-2 text-xs text-emerald-700">
              Check your inbox and spam folder for the MotoDesk password-reset email.
            </p>
          </div>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-zinc-700">
            Email address
          </span>

          <input
            className={inputClasses}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            autoFocus
            disabled={isLoading}
          />
        </label>

        <button
          className="flex h-12 w-full items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-bold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isLoading}
        >
          {isLoading
            ? "Sending reset email..."
            : "Send password reset email"}
        </button>
      </div>
    </form>
  );
}

//************************************************************** */