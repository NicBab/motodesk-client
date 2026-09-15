"use client";

import Link from "next/link";

import { ArrowRight, ClipboardList } from "lucide-react";

import type { DashboardRecentRepairOrderActivity } from "../dashboard.types";

//************************************************************** */

type DashboardRecentActivityProps = {
  activity: DashboardRecentRepairOrderActivity[];
};

//************************************************************** */

export function DashboardRecentActivity({
  activity,
}: DashboardRecentActivityProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Recent Repair Order Activity
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Recently updated repair orders
          </p>
        </div>

        <Link
          href="/repair-orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 transition hover:text-orange-700"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {activity.length === 0 ? (
        <div className="grid min-h-48 place-items-center p-6 text-center">
          <div>
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-zinc-100 text-zinc-400">
              <ClipboardList className="h-5 w-5" />
            </div>

            <p className="mt-3 text-sm font-medium text-zinc-700">
              No recent repair order activity
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Recently updated repair orders will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {activity.map((repairOrder) => (
            <Link
              key={repairOrder.id}
              href={`/repair-orders?ro=${repairOrder.id}`}
              className="group flex items-center gap-4 px-5 py-4 transition hover:bg-zinc-50"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-500 transition group-hover:bg-orange-50 group-hover:text-orange-600">
                <ClipboardList className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900 transition group-hover:text-orange-600">
                    RO #{repairOrder.roNumber}
                  </p>

                  <StatusBadge status={repairOrder.status} />

                  <PriorityBadge priority={repairOrder.priority} />
                </div>

                <p className="mt-1 truncate text-xs text-zinc-600">
                  {repairOrder.customerName}
                  {" · "}
                  {repairOrder.vehicleDescription || "Vehicle not specified"}
                </p>
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-xs text-zinc-500">
                  {formatRelativeTime(repairOrder.updatedAt)}
                </p>
              </div>

              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

//************************************************************** */

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
      {formatLabel(status)}
    </span>
  );
}

//************************************************************** */

function PriorityBadge({ priority }: { priority: string }) {
  const className =
    priority === "EMERGENCY"
      ? "bg-red-50 text-red-700"
      : priority === "RUSH"
        ? "bg-amber-50 text-amber-700"
        : priority === "HOLD"
          ? "bg-zinc-100 text-zinc-500"
          : "bg-emerald-50 text-emerald-700";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${className}`}
    >
      {formatLabel(priority)}
    </span>
  );
}

//************************************************************** */

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime();

  const now = Date.now();

  const difference = Math.max(0, now - timestamp);

  const minutes = Math.floor(difference / 60_000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",

    day: "numeric",
  }).format(new Date(value));
}

//************************************************************** */
