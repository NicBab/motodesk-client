"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Bike,
  Boxes,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  Users,
  Wrench,
} from "lucide-react";

//************************************************************** */

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/customers",
    label: "Customers",
    icon: Users,
  },
  {
    href: "/units",
    label: "Units",
    icon: Bike,
  },
  {
    href: "/repair-orders",
    label: "Repair Orders",
    icon: Wrench,
  },
  {
    href: "/parts",
    label: "Parts",
    icon: Package,
  },
  {
    href: "/sales",
    label: "Sales",
    icon: CircleDollarSign,
  },
  {
    href: "/inventory",
    label: "Inventory",
    icon: Boxes,
  },
] as const;

//************************************************************** */

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-300">
      <div className="flex h-20 items-center border-b border-zinc-800 px-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
            <Wrench className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-white">
              MotoDesk
            </p>

            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Shop Management
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 px-5 py-4">
        <p className="text-[10px] tracking-wide text-zinc-600">
          © 2026 MotoDesk
        </p>
      </div>
    </aside>
  );
}

//************************************************************** */