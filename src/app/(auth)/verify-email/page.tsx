//************************************************************** */

import Link from "next/link";

import {
  AuthShell,
} from "@/features/auth/components/AuthShell";

import {
  VerifyEmailForm,
} from "@/features/auth/components/VerifyEmailForm";

//************************************************************** */

type VerifyEmailPageProps = {
  searchParams: Promise<{
    email?: string | string[];
  }>;
};

//************************************************************** */

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params =
    await searchParams;

  const rawEmail =
    Array.isArray(
      params.email,
    )
      ? params.email[0]
      : params.email;

  const email =
    rawEmail?.trim() ?? "";

  return (
    <AuthShell
      eyebrow="Verify your account"
      title="Check your email"
      description="We sent a six-digit verification code to your email address. Enter the code below to verify your MotoDesk account."
      footer={
        <>
          Already verified?{" "}
          <Link href="/login">
            Sign in
          </Link>
        </>
      }
    >
      <VerifyEmailForm
        email={email}
      />
    </AuthShell>
  );
}

//************************************************************** */