import Link from "next/link";

import { AuthShell } from "@/features/auth/components/AuthShell";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { formatPlanName } from "@/features/auth/auth.utils";

//************************************************************** */

type RegisterPageProps = {
  searchParams: Promise<{
    plan?: string | string[];
  }>;
};

//************************************************************** */

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;

  const rawPlan = Array.isArray(params.plan)
    ? params.plan[0]
    : params.plan;

  const plan = formatPlanName(rawPlan);

  return (
    <AuthShell
      eyebrow="Create your workspace"
      title="Start your MotoDesk trial"
      description="Create the owner account and shop workspace your team will use to run MotoDesk."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm plan={plan} />
    </AuthShell>
  );
}

//************************************************************** */