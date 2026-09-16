//************************************************************** */

"use client";

import { type FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { createOrganizationSlug } from "../auth.utils";

import { useCreateOrganizationMutation } from "@/store/api/organizationsApi";

import { baseApi } from "@/store/api/baseApi";

import { useAppDispatch } from "@/store/hooks";

import { switchInvitedOrganization } from "@/features/membership-invitations/api/switch-invited-organization";

//************************************************************** */

const inputClasses =
  "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (
      error as {
        data?: unknown;
      }
    ).data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  }

  return "MotoDesk could not create your workspace. Please try again.";
}

//************************************************************** */

export function OnboardingForm() {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [createOrganization, { isLoading: isSubmitting }] =
    useCreateOrganizationMutation();

  const [error, setError] = useState<string | null>(null);

  //************************************************************** */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const formData = new FormData(event.currentTarget);

    const organizationName = String(
      formData.get("organizationName") ?? "",
    ).trim();

    const organizationSlug = createOrganizationSlug(organizationName);

    if (!organizationSlug) {
      setError("Enter a valid business or shop name.");

      return;
    }

    //************************************************************** */

    try {
      const organization = await createOrganization({
        name: organizationName,

        slug: organizationSlug,

        email:
          String(formData.get("organizationEmail") ?? "").trim() || undefined,

        phone:
          String(formData.get("organizationPhone") ?? "").trim() || undefined,
      }).unwrap();

      //************************************************************** */
      // Organization creation persists the OWNER membership, but the
      // current access token was issued before that membership existed.
      // Switch into the new organization so MotoDesk issues a fresh
      // membership-aware access token before entering the application.

      await switchInvitedOrganization(organization.id);

      //************************************************************** */
      // Organization creation gives the authenticated user an owner
      // membership. Clear cached API data so the application reloads
      // membership-aware state after onboarding.

      dispatch(baseApi.util.resetApiState());

      router.replace("/dashboard");

      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  }

  //************************************************************** */

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-4">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-orange-600">
          Google account connected
        </span>

        <strong className="mt-1 block text-sm font-bold text-orange-900">
          Finish setting up your MotoDesk workspace
        </strong>

        <p className="mt-1 text-xs leading-5 text-orange-800/70">
          Your account is ready. Add your business or shop information to create
          the workspace your team will use.
        </p>
      </div>

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
            autoFocus
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
              autoComplete="email"
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
              autoComplete="tel"
              maxLength={30}
            />
          </label>
        </div>
      </fieldset>

      <button
        className="flex h-12 w-full items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-bold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating your workspace..." : "Create my workspace"}
      </button>

      <p className="text-center text-[11px] leading-5 text-zinc-400">
        You&apos;ll be added as the owner of this MotoDesk workspace.
      </p>
    </form>
  );
}

//************************************************************** */
