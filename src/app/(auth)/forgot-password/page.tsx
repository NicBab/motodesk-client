//************************************************************** */

import Link from "next/link";

import {
  AuthShell,
} from "@/features/auth/components/AuthShell";

import {
  ForgotPasswordForm,
} from "@/features/auth/components/ForgotPasswordForm";

//************************************************************** */

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter the email address associated with your MotoDesk account and we'll send you a secure password-reset link."
      footer={
        <>
          Remember your password?{" "}
          <Link href="/login">
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}

//************************************************************** */