//************************************************************** */

import Link from "next/link";

import {
  AuthShell,
} from "@/features/auth/components/AuthShell";

import {
  ResetPasswordForm,
} from "@/features/auth/components/ResetPasswordForm";

//************************************************************** */

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

//************************************************************** */

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params =
    await searchParams;

  const rawToken =
    Array.isArray(
      params.token,
    )
      ? params.token[0]
      : params.token;

  const token =
    rawToken?.trim() ?? "";

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Create a new password for your MotoDesk account. Your reset link can only be used once."
      footer={
        <>
          Remember your password?{" "}
          <Link href="/login">
            Back to sign in
          </Link>
        </>
      }
    >
      <ResetPasswordForm
        token={token}
      />
    </AuthShell>
  );
}

//************************************************************** */