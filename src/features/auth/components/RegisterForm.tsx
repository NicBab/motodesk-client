//************************************************************** */

"use client";

import { type FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api/api-error";
import { registerAccount } from "../api/register";

import { createOrganizationSlug, isStrongPassword } from "../auth.utils";

import { useAppDispatch } from "@/store/hooks";

import { baseApi } from "@/store/api/baseApi";

import { Eye, EyeOff } from "lucide-react";

//************************************************************** */

type RegisterFormProps = {
  plan: string | null;
};

//************************************************************** */

const inputClasses =
  "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */

export function RegisterForm({ plan }: RegisterFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const formData = new FormData(event.currentTarget);

    const password = String(formData.get("password") ?? "");

    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    const organizationName = String(
      formData.get("organizationName") ?? "",
    ).trim();

    const organizationSlug = createOrganizationSlug(organizationName);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        "Password must be at least 12 characters and include uppercase, lowercase, a number, and a special character.",
      );

      return;
    }

    if (!organizationSlug) {
      setError("Enter a valid business or shop name.");

      return;
    }

    setIsSubmitting(true);

    try {
      await registerAccount({
        firstName: String(formData.get("firstName") ?? "").trim(),

        lastName: String(formData.get("lastName") ?? "").trim(),

        email: String(formData.get("email") ?? "").trim(),

        phone: String(formData.get("phone") ?? "").trim() || undefined,

        password,

        organization: {
          name: organizationName,
          slug: organizationSlug,

          email:
            String(formData.get("organizationEmail") ?? "").trim() || undefined,

          phone:
            String(formData.get("organizationPhone") ?? "").trim() || undefined,
        },
      });

      if (plan) {
        sessionStorage.setItem("motodesk:selected-plan", plan.toLowerCase());
      }

      dispatch(baseApi.util.resetApiState());

      router.replace("/dashboard");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "MotoDesk could not create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  //************************************************************** */

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {plan ? (
        <div className="flex flex-col gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-orange-600">
              14-day free trial
            </span>

            <strong className="mt-1 block text-sm font-bold text-orange-900">
              {plan} plan selected
            </strong>
          </div>

          <span className="w-fit rounded-full bg-white px-3 py-1 text-[11px] font-bold text-orange-600 ring-1 ring-orange-200">
            No charge today
          </span>
        </div>
      ) : null}

      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <fieldset className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <legend className="px-2 text-sm font-bold text-zinc-900">
          Owner information
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              First name
            </span>

            <input
              className={inputClasses}
              name="firstName"
              autoComplete="given-name"
              required
              maxLength={100}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Last name
            </span>

            <input
              className={inputClasses}
              name="lastName"
              autoComplete="family-name"
              required
              maxLength={100}
            />
          </label>
        </div>

        <div className="mt-4 space-y-4">
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
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-700">
              Phone
              <em className="text-[10px] font-medium not-italic text-zinc-400">
                Optional
              </em>
            </span>

            <input
              className={inputClasses}
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={30}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <legend className="px-2 text-sm font-bold text-zinc-900">
          Shop information
        </legend>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-zinc-700">
            Business or shop name
          </span>

          <input
            className={inputClasses}
            name="organizationName"
            autoComplete="organization"
            required
            minLength={2}
            maxLength={120}
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-700">
              Business email
              <em className="text-[10px] font-medium not-italic text-zinc-400">
                Optional
              </em>
            </span>

            <input
              className={inputClasses}
              name="organizationEmail"
              type="email"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-700">
              Business phone
              <em className="text-[10px] font-medium not-italic text-zinc-400">
                Optional
              </em>
            </span>

            <input
              className={inputClasses}
              name="organizationPhone"
              type="tel"
              maxLength={30}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <legend className="px-2 text-sm font-bold text-zinc-900">
          Secure your account
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Password
            </span>

            <div className="relative">
              <input
                className={`${inputClasses} pr-11`}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={12}
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

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Confirm password
            </span>

            <div className="relative">
              <input
                className={`${inputClasses} pr-11`}
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-400 transition hover:text-zinc-700 focus:outline-none"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </label>
        </div>

        <p className="mt-3 text-xs leading-5 text-zinc-500">
          12+ characters with uppercase, lowercase, a number, and a special
          character.
        </p>
      </fieldset>

      <button
        className="flex h-12 w-full items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-bold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating your workspace..." : "Start my free trial"}
      </button>

      <p className="text-center text-[11px] leading-5 text-zinc-400">
        By creating an account, you agree to the MotoDesk terms of service and
        privacy policy.
      </p>
    </form>
  );
}

//************************************************************** */
