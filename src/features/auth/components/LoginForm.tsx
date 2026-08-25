"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api/api-error";
import { login } from "../api/login";

const inputClasses =
  "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6S2.25 12 2.25 12Z"
      />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 3 18 18"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.6 6.2A10.6 10.6 0 0 1 12 6c6.25 0 9.75 6 9.75 6a16 16 0 0 1-2.1 2.8M6.3 6.3C3.65 8.1 2.25 12 2.25 12S5.75 18 12 18a10 10 0 0 0 3.1-.48"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
      />
    </svg>
  );
}  

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    const formData =
      new FormData(event.currentTarget);

    try {
      await login({
        email: String(
          formData.get("email") ?? "",
        ).trim(),

        password: String(
          formData.get("password") ?? "",
        ),
      });

      router.replace("/dashboard");
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
  <span className="mb-2 block text-xs font-semibold text-zinc-700">
    Password
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
      aria-label={
        showPassword ? "Hide password" : "Show password"
      }
      aria-pressed={showPassword}
    >
      {showPassword ? (
        <EyeOffIcon />
      ) : (
        <EyeIcon />
      )}
    </button>
  </div>
</label>

        <button
          className="flex h-12 w-full items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-bold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Signing in..."
            : "Sign in to MotoDesk"}
        </button>
      </div>
    </form>
  );
}