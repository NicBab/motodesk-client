"use client";

import {
  type FormEvent,
  useState,
} from "react";

import {
  Briefcase,
  Globe,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";

import {
  toast,
} from "sonner";

import type {
  AuthenticatedUser,
} from "@/features/auth/auth.types";

import {
  useUpdateProfileMutation,
} from "@/store/api/authApi";

//************************************************************** */

const TIMEZONES = [
  "America/Chicago",
  "America/New_York",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "UTC",
] as const;

//************************************************************** */

const inputClasses =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

const iconInputClasses =
  `${inputClasses} pl-10`;

//************************************************************** */

type SettingsProfileProps = {
  user:
    AuthenticatedUser;
};

//************************************************************** */

export function SettingsProfile({
  user,
}: SettingsProfileProps) {
  const [
    updateProfile,
    {
      isLoading:
        isSaving,
    },
  ] =
    useUpdateProfileMutation();

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  //************************************************************** */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError(
      null,
    );

    const formData =
      new FormData(
        event.currentTarget,
      );

    const firstName =
      readRequired(
        formData,
        "firstName",
      );

    const lastName =
      readRequired(
        formData,
        "lastName",
      );

    const phone =
      readOptional(
        formData,
        "phone",
      );

    const jobTitle =
      readOptional(
        formData,
        "jobTitle",
      );

    const preferredTimezone =
      readRequired(
        formData,
        "preferredTimezone",
      );

    if (
      !firstName ||
      !lastName
    ) {
      setError(
        "First name and last name are required.",
      );

      return;
    }

    if (
      !preferredTimezone
    ) {
      setError(
        "Preferred timezone is required.",
      );

      return;
    }

    try {
      await updateProfile({
        firstName,
        lastName,
        phone,
        jobTitle,
        preferredTimezone,
      }).unwrap();

      toast.success(
        "Profile updated",
      );
    } catch {
      toast.error(
        "Failed to update profile",
      );

      setError(
        "MotoDesk could not save your profile changes.",
      );
    }
  }

  //************************************************************** */

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <header className="border-b border-zinc-100 px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <User className="h-4 w-4" />

          Profile
        </h2>
      </header>

      <form
        key={`${user.id}-${user.firstName}-${user.lastName}-${user.phone ?? ""}-${user.jobTitle ?? ""}-${user.preferredTimezone}`}
        onSubmit={
          handleSubmit
        }
        className="space-y-5 p-5"
      >
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {
              error
            }
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="First Name"
            htmlFor="firstName"
          >
            <input
              id="firstName"
              name="firstName"
              type="text"
              defaultValue={
                user.firstName
              }
              placeholder="John"
              required
              className={
                inputClasses
              }
            />
          </Field>

          <Field
            label="Last Name"
            htmlFor="lastName"
          >
            <input
              id="lastName"
              name="lastName"
              type="text"
              defaultValue={
                user.lastName
              }
              placeholder="Doe"
              required
              className={
                inputClasses
              }
            />
          </Field>
        </div>

        <Field
          label="Email"
          htmlFor="email"
        >
          <div className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3">
            <Mail className="h-4 w-4 text-zinc-400" />

            <span className="text-sm text-zinc-500">
              {
                user.email
              }
            </span>
          </div>

          <p className="mt-1.5 text-xs text-zinc-400">
            Email cannot be changed from Profile settings.
          </p>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Phone"
            htmlFor="phone"
          >
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={
                  user.phone ??
                  ""
                }
                placeholder="(555) 000-0000"
                className={
                  iconInputClasses
                }
              />
            </div>
          </Field>

          <Field
            label="Job Title"
            htmlFor="jobTitle"
          >
            <div className="relative">
              <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                defaultValue={
                  user.jobTitle ??
                  ""
                }
                placeholder="Service Advisor"
                className={
                  iconInputClasses
                }
              />
            </div>
          </Field>
        </div>

        <Field
          label="Preferred Timezone"
          htmlFor="preferredTimezone"
        >
          <div className="relative">
            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <select
              id="preferredTimezone"
              name="preferredTimezone"
              defaultValue={
                user.preferredTimezone
              }
              className={
                iconInputClasses
              }
            >
              {TIMEZONES.map(
                (
                  timezone,
                ) => (
                  <option
                    key={
                      timezone
                    }
                    value={
                      timezone
                    }
                  >
                    {
                      timezone
                    }
                  </option>
                ),
              )}
            </select>
          </div>
        </Field>

        <div className="flex justify-end border-t border-zinc-100 pt-5">
          <button
            type="submit"
            disabled={
              isSaving
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />

            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

//************************************************************** */

function Field({
  label,
  htmlFor,
  children,
}: {
  label:
    string;

  htmlFor:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={
          htmlFor
        }
        className="mb-2 block text-sm font-medium text-zinc-700"
      >
        {
          label
        }
      </label>

      {
        children
      }
    </div>
  );
}

//************************************************************** */

function readRequired(
  formData:
    FormData,
  key:
    string,
): string {
  const value =
    formData.get(
      key,
    );

  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

//************************************************************** */

function readOptional(
  formData:
    FormData,
  key:
    string,
): string | null {
  const value =
    readRequired(
      formData,
      key,
    );

  return value ||
    null;
}

//************************************************************** */