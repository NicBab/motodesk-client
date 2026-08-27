"use client";

import Link from "next/link";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Bike,
  Boxes,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  Users,
  Wrench,
  X,
} from "lucide-react";

import { useOpenRepairOrders } from "@/features/repair-orders/open-repair-orders.context";

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
    href: "/vehicles",
    label: "Vehicles",
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

export function AppSidebar() {
  const pathname = usePathname();

  const router = useRouter();

  const searchParams = useSearchParams();

  const { openRepairOrders, closeRepairOrder } = useOpenRepairOrders();

  const activeRepairOrderId = searchParams.get("ro");

  function handleCloseRepairOrder(
    event: React.MouseEvent<HTMLButtonElement>,
    repairOrderId: string,
  ) {
    event.preventDefault();
    event.stopPropagation();

    closeRepairOrder(repairOrderId);

    if (activeRepairOrderId === repairOrderId) {
      router.push("/repair-orders");
    }
  }

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

        {openRepairOrders.length > 0 ? (
          <div className="mt-3 space-y-1 border-t border-zinc-800 pt-3">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Open ROs
            </p>

            {openRepairOrders.map((repairOrder) => {
              const active = activeRepairOrderId === repairOrder.id;

              return (
                <Link
                  key={repairOrder.id}
                  href={`/repair-orders?ro=${repairOrder.id}`}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-zinc-800 text-white ring-1 ring-orange-500/50"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Wrench className="h-3.5 w-3.5 shrink-0 text-orange-500" />

                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-zinc-100">
                      RO #{repairOrder.roNumber}
                    </p>

                    <p className="truncate text-xs text-zinc-500">
                      {repairOrder.customerName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(event) =>
                      handleCloseRepairOrder(event, repairOrder.id)
                    }
                    title="Close quick reference"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-zinc-500 transition hover:bg-zinc-700 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Link>
              );
            })}
          </div>
        ) : null}
      </nav>

      <div className="border-t border-zinc-800 px-5 py-4">
        <p className="text-[10px] tracking-wide text-zinc-600">
          © 2026 MotoDesk
        </p>
      </div>
    </aside>
  );
}
