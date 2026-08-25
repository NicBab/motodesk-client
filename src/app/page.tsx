"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "@/features/auth/api/get-current-user";

//************************************************************** */

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then(() => {
        if (!active) return;

        router.replace("/dashboard");
      })
      .catch(() => {
        if (!active) return;

        router.replace("/login");
      });

    return () => {
      active = false;
    };
  }, [router]);

//************************************************************** */

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50">
      <p className="text-sm text-zinc-500">
        Loading MotoDesk...
      </p>
    </main>
  );
}

//************************************************************** */