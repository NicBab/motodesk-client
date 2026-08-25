import Link from "next/link";

import { AuthShell } from "@/features/auth/components/AuthShell";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to MotoDesk"
      description="Access your shop workspace, service operations, and team activity."
      footer={
        <>
          New to MotoDesk?{" "}
          <Link href="/register">
            Start a free trial
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}