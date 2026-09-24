//************************************************************** */

"use client";

import Link from "next/link";

import { type FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api/api-error";

import { login } from "../api/login";

import { useAppDispatch } from "@/store/hooks";

import { baseApi } from "@/store/api/baseApi";

import { Eye, EyeOff } from "lucide-react";

import { GoogleOAuthButton } from "./GoogleOAuthButton";

//************************************************************** */

const inputClasses =
  "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

async function handleSubmit(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  setError(null);

  setIsSubmitting(true);

  const formData =
    new FormData(event.currentTarget);

  const email =
    String(
      formData.get("email") ?? "",
    ).trim();

  try {
    const result =
      await login({
        email,

        password:
          String(
            formData.get("password") ?? "",
          ),
      });

    //************************************************************** */
    // Password-authenticated users must verify ownership of their
    // email address before entering the MotoDesk application.

    if (!result.user.emailVerifiedAt) {
      dispatch(
        baseApi.util.resetApiState(),
      );

      router.replace(
        `/verify-email?email=${encodeURIComponent(
          email.toLowerCase(),
        )}`,
      );

      return;
    }

    //************************************************************** */
    // Clear any cached /auth/me 401 or stale session data before
    // entering the authenticated application.

    dispatch(
      baseApi.util.resetApiState(),
    );

    router.replace(
      "/dashboard",
    );

    router.refresh();
  } catch (caughtError) {
    setError(
      caughtError instanceof ApiError
        ? caughtError.message
        : "MotoDesk could not sign you in. Please try again.",
    );
  } finally {
    setIsSubmitting(false);
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
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700">
              Password
            </span>

            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-orange-600 transition hover:text-orange-700 hover:underline"
            >
              Forgot password?
            </Link>
          </span>

          <div className="relative">
            <input
              className={`${inputClasses} pr-11`}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              maxLength={128}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-400 transition hover:text-zinc-700 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </label>

        <button
          className="flex h-12 w-full items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-bold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in to MotoDesk"}
        </button>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>

          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Or
            </span>
          </div>
        </div>

        <GoogleOAuthButton />
      </div>
    </form>
  );
}

//************************************************************** */
