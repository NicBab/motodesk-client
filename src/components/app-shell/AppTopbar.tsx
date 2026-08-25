"use client";

import Link from "next/link";

import {
  BarChart3,
  CalendarDays,
  Clock,
  Settings,
  UserCog,
} from "lucide-react";

import type { AuthSession } from "@/features/auth/auth.types";

import { LogoutButton } from "@/features/auth/components/LogoutButton";

//************************************************************** */

type AppTopbarProps = {
  session: AuthSession;
};

const navigationItems = [
  {
    href: "/time-clock",
    label: "Time Clock",
    icon: Clock,
  },
  {
    href: "/employees",
    label: "Employees",
    icon: UserCog,
  },
  {
    href: "/scheduling",
    label: "Scheduling",
    icon: CalendarDays,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
] as const;

//************************************************************** */

export function AppTopbar({
  session,
}: AppTopbarProps) {
  const initials = `${session.user.firstName.charAt(0)}${session.user.lastName.charAt(0)}`;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <nav className="flex items-center gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              <Icon className="h-4 w-4" />

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Link>

        <div className="h-7 w-px bg-zinc-200" />

        <div className="text-right">
          <p className="text-xs font-semibold text-zinc-900">
            {session.user.firstName}{" "}
            {session.user.lastName}
          </p>

          <p className="text-[10px] text-zinc-500">
            {session.membership?.organizationName ??
              "MotoDesk"}
          </p>
        </div>

        <div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-900 text-xs font-bold text-white">
          {initials.toUpperCase()}
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}

//************************************************************** */