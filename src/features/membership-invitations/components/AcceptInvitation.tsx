"use client";

import { CheckCircle2, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

import { type FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { ApiError } from "@/lib/api/api-error";

import { login } from "@/features/auth/api/login";

import { isStrongPassword } from "@/features/auth/auth.utils";

import { acceptMembershipInvitation } from "../api/accept-invitation";

import { registerInvitedUser } from "../api/register-invited-user";

import { switchInvitedOrganization } from "../api/switch-invited-organization";

import { useGetCurrentUserQuery } from "@/store/api/authApi";

import { baseApi } from "@/store/api/baseApi";

import { useAppDispatch } from "@/store/hooks";

//************************************************************** */

type Props = {
  token: string;
};

//************************************************************** */

type AuthMode = "login" | "register";

//************************************************************** */

export function AcceptInvitation({ token }: Props) {
  const router = useRouter();

  const dispatch = useAppDispatch();

  const [mode, setMode] = useState<AuthMode>("login");

  const [error, setError] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //************************************************************** */

  const { data: session, isLoading: sessionLoading } = useGetCurrentUserQuery();

  //************************************************************** */

  async function finishInvitation() {
    const membership = await acceptMembershipInvitation(token);

    await switchInvitedOrganization(membership.organizationId);

    dispatch(baseApi.util.resetApiState());

    toast.success(`Welcome to ${membership.organizationName}.`);

    router.replace("/dashboard");

    router.refresh();
  }

  //************************************************************** */

  async function handleAcceptExistingSession() {
    setError(null);

    setProcessing(true);

    try {
      await finishInvitation();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setProcessing(false);
    }
  }

  //************************************************************** */

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const formData = new FormData(event.currentTarget);

    setProcessing(true);

    try {
      await login({
        email: String(formData.get("email") ?? "").trim(),

        password: String(formData.get("password") ?? ""),
      });

      /*
       * Login creates the authenticated cookie required by
       * the invitation acceptance endpoint.
       */
      await finishInvitation();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setProcessing(false);
    }
  }

  //************************************************************** */

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const formData = new FormData(event.currentTarget);

    const password = String(formData.get("password") ?? "");

    const confirmPassword = String(formData.get("confirmPassword") ?? "");

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

    setProcessing(true);

    try {
      await registerInvitedUser({
        firstName: String(formData.get("firstName") ?? "").trim(),

        lastName: String(formData.get("lastName") ?? "").trim(),

        email: String(formData.get("email") ?? "").trim(),

        password,
      });

      /*
       * Standalone registration creates the User and session.
       * It deliberately does not create another Organization.
       */
      await finishInvitation();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setProcessing(false);
    }
  }

  //************************************************************** */

  if (sessionLoading) {
    return (
      <InvitationCard>
        <p className="text-center text-sm text-zinc-500">
          Checking your MotoDesk session...
        </p>
      </InvitationCard>
    );
  }

  //************************************************************** */
  // Existing authenticated user

  if (session?.user) {
    return (
      <InvitationCard>
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-orange-500" />

          <h2 className="mt-4 text-xl font-bold text-zinc-900">
            Accept MotoDesk Invitation
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            You are signed in as{" "}
            <strong className="text-zinc-700">{session.user.email}</strong>.
          </p>
        </div>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <button
          type="button"
          disabled={processing}
          onClick={() => void handleAcceptExistingSession()}
          className={primaryButtonClassName}
        >
          {processing ? "Accepting Invitation..." : "Accept Invitation"}
        </button>

        <p className="text-center text-xs leading-5 text-zinc-400">
          The invitation must belong to the same email address as this account.
        </p>
      </InvitationCard>
    );
  }

  //************************************************************** */
  // Authentication mode selector

  return (
    <InvitationCard>
      <div className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-orange-50 text-orange-500">
          {mode === "login" ? (
            <LogIn className="h-6 w-6" />
          ) : (
            <UserPlus className="h-6 w-6" />
          )}
        </div>

        <h2 className="mt-4 text-xl font-bold text-zinc-900">Join MotoDesk</h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Sign in with an existing MotoDesk account or create your employee
          account to accept the invitation.
        </p>
      </div>

      <div className="grid grid-cols-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
        <button
          type="button"
          disabled={processing}
          onClick={() => {
            setMode("login");

            setError(null);
          }}
          className={mode === "login" ? activeTabClassName : tabClassName}
        >
          Sign In
        </button>

        <button
          type="button"
          disabled={processing}
          onClick={() => {
            setMode("register");

            setError(null);
          }}
          className={mode === "register" ? activeTabClassName : tabClassName}
        >
          Create Account
        </button>
      </div>

      {error ? <ErrorMessage>{error}</ErrorMessage> : null}

      {mode === "login" ? (
        <LoginInvitationForm
          processing={processing}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((current) => !current)}
          onSubmit={handleLogin}
        />
      ) : (
        <RegisterInvitationForm
          processing={processing}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          onTogglePassword={() => setShowPassword((current) => !current)}
          onToggleConfirmPassword={() =>
            setShowConfirmPassword((current) => !current)
          }
          onSubmit={handleRegister}
        />
      )}
    </InvitationCard>
  );
}

//************************************************************** */

function LoginInvitationForm({
  processing,
  showPassword,
  onTogglePassword,
  onSubmit,
}: {
  processing: boolean;

  showPassword: boolean;

  onTogglePassword: () => void;

  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Field label="Email Address">
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          disabled={processing}
          className={inputClassName}
        />
      </Field>

      <Field label="Password">
        <PasswordInput
          name="password"
          autoComplete="current-password"
          show={showPassword}
          disabled={processing}
          onToggle={onTogglePassword}
        />
      </Field>

      <button
        type="submit"
        disabled={processing}
        className={primaryButtonClassName}
      >
        {processing ? "Signing In..." : "Sign In & Accept"}
      </button>
    </form>
  );
}

//************************************************************** */

function RegisterInvitationForm({
  processing,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit,
}: {
  processing: boolean;

  showPassword: boolean;

  showConfirmPassword: boolean;

  onTogglePassword: () => void;

  onToggleConfirmPassword: () => void;

  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First Name">
          <input
            name="firstName"
            autoComplete="given-name"
            required
            maxLength={100}
            disabled={processing}
            className={inputClassName}
          />
        </Field>

        <Field label="Last Name">
          <input
            name="lastName"
            autoComplete="family-name"
            required
            maxLength={100}
            disabled={processing}
            className={inputClassName}
          />
        </Field>
      </div>

      <Field label="Invitation Email">
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          disabled={processing}
          className={inputClassName}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password">
          <PasswordInput
            name="password"
            autoComplete="new-password"
            show={showPassword}
            disabled={processing}
            onToggle={onTogglePassword}
          />
        </Field>

        <Field label="Confirm Password">
          <PasswordInput
            name="confirmPassword"
            autoComplete="new-password"
            show={showConfirmPassword}
            disabled={processing}
            onToggle={onToggleConfirmPassword}
          />
        </Field>
      </div>

      <p className="text-xs leading-5 text-zinc-500">
        Password must be at least 12 characters with uppercase, lowercase, a
        number, and a special character.
      </p>

      <button
        type="submit"
        disabled={processing}
        className={primaryButtonClassName}
      >
        {processing ? "Creating Account..." : "Create Account & Accept"}
      </button>
    </form>
  );
}

//************************************************************** */

function PasswordInput({
  name,
  autoComplete,
  show,
  disabled,
  onToggle,
}: {
  name: string;

  autoComplete: string;

  show: boolean;

  disabled: boolean;

  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={12}
        maxLength={128}
        disabled={disabled}
        className={`${inputClassName} pr-11`}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-400 transition hover:text-zinc-700 disabled:opacity-50"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

//************************************************************** */

function InvitationCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-xl space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      {children}
    </div>
  );
}

//************************************************************** */

function Field({
  label,
  children,
}: {
  label: string;

  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-zinc-700">
        {label}
      </span>

      {children}
    </label>
  );
}

//************************************************************** */

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {children}
    </div>
  );
}

//************************************************************** */

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "MotoDesk could not complete the invitation. Please try again.";
}

//************************************************************** */

const inputClassName =
  "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-zinc-100";

const primaryButtonClassName =
  "flex h-11 w-full items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60";

const tabClassName =
  "rounded-md px-3 py-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-800";

const activeTabClassName =
  "rounded-md bg-white px-3 py-2 text-sm font-semibold text-orange-600 shadow-sm";

//************************************************************** */
