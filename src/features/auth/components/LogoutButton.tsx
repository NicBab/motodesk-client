//************************************************************** */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { logout } from "../api/logout";

import { useAppDispatch } from "@/store/hooks";
import { baseApi } from "@/store/api/baseApi";
import { clearWorkspace } from "@/store/slices/workspaceSlice";

//************************************************************** */

export function LogoutButton() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await logout();

      dispatch(clearWorkspace());
      dispatch(baseApi.util.resetApiState());

      router.replace("/login");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting
        ? "Signing out..."
        : "Sign out"}
    </button>
  );
}

//************************************************************** */