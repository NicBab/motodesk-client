//************************************************************** */

"use client";

import { type FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { verifyEmail } from "@/features/auth/api/verify-email";

import { resendEmailVerification } from "@/features/auth/api/resend-email-verification";

//************************************************************** */

type VerifyEmailFormProps = {
  email: string;
};

//************************************************************** */

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "MotoDesk could not verify this code. Please try again.";
}

//************************************************************** */

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const router = useRouter();

  const [code, setCode] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);

  const [isResending, setIsResending] = useState(false);

  //************************************************************** */

  function handleCodeChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);

    setCode(digitsOnly);

    setError(null);
  }

  //************************************************************** */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    setSuccessMessage(null);

    if (code.length !== 6) {
      setError("Enter the six-digit verification code from your email.");

      return;
    }

    setIsVerifying(true);

    try {
      await verifyEmail({
        token: code,
      });

      router.replace("/dashboard");

      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsVerifying(false);
    }
  }

  //************************************************************** */

  async function handleResend() {
    if (!email) {
      setError(
        "Your email address is missing. Return to registration and try again.",
      );

      return;
    }

    setError(null);

    setSuccessMessage(null);

    setIsResending(true);

    try {
      const result = await resendEmailVerification({
        email,
      });

      setCode("");

      setSuccessMessage(result.message);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsResending(false);
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
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
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
          </div>
        ) : null}

        <div>
          <label
            className="mb-2 block text-xs font-semibold text-zinc-700"
            htmlFor="verification-code"
          >
            Verification code
          </label>

          <input
            id="verification-code"
            name="verificationCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(event) => handleCodeChange(event.target.value)}
            disabled={isVerifying || isResending}
            autoFocus
            required
            aria-describedby="verification-code-help"
            className="h-14 w-full rounded-lg border border-zinc-300 bg-white px-4 text-center font-mono text-2xl font-bold tracking-[0.45em] text-zinc-900 outline-none transition placeholder:text-zinc-300 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50"
            placeholder="000000"
          />

          <p
            id="verification-code-help"
            className="mt-2 text-xs leading-5 text-zinc-500"
          >
            Enter the six-digit code sent to{" "}
            <span className="font-semibold text-zinc-700">
              {email || "your email address"}
            </span>
            .
          </p>
        </div>

        <button
          className="flex h-12 w-full items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-bold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isVerifying || isResending || code.length !== 6}
        >
          {isVerifying ? "Verifying..." : "Verify email"}
        </button>

        <div className="border-t border-zinc-200 pt-5 text-center">
          <p className="text-xs text-zinc-500">Didn&apos;t receive the code?</p>

          <button
            type="button"
            onClick={handleResend}
            disabled={isVerifying || isResending || !email}
            className="mt-2 text-sm font-semibold text-orange-600 transition hover:text-orange-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResending ? "Sending new code..." : "Resend verification code"}
          </button>
        </div>
      </div>
    </form>
  );
}

//************************************************************** */
