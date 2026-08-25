"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "@/features/auth/api/get-current-user";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import type { AuthSession } from "@/features/auth/auth.types";

export default function DashboardPage() {
  const router = useRouter();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((currentSession) => {
        if (!active) return;

        setSession(currentSession);
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;

        router.replace("/login");
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-50">
        <p className="text-sm text-zinc-500">
          Loading MotoDesk...
        </p>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-orange-500">
              MotoDesk Workspace
            </p>

            <h1 className="mt-1 text-2xl font-bold text-zinc-900">
              Welcome, {session.user.firstName}.
            </h1>

            <p className="mt-2 text-sm text-zinc-600">
              {session.membership?.organizationName ??
                "Your MotoDesk organization"}{" "}
              is connected.
            </p>

            {session.membership ? (
              <p className="mt-1 text-xs text-zinc-400">
                Role: {session.membership.role}
              </p>
            ) : null}
          </div>

          <LogoutButton />
        </div>
      </div>
    </main>
  );
}