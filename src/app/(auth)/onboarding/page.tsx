//************************************************************** */

import Link from "next/link";

import {
  AuthShell,
} from "@/features/auth/components/AuthShell";

import {
  OnboardingForm,
} from "@/features/auth/components/OnboardingForm";

//************************************************************** */

export default function OnboardingPage() {
  return (
    <AuthShell
      eyebrow="Workspace setup"
      title="Set up your MotoDesk workspace"
      description="Tell us about your business or shop to finish setting up your account."
      footer={
        <>
          Already belong to a MotoDesk workspace?{" "}
          <Link
            href="/login"
          >
            Sign in
          </Link>
        </>
      }
    >
      <OnboardingForm />
    </AuthShell>
  );
}

//************************************************************** */