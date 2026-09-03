"use client";

import { CalendarClock, ExternalLink } from "lucide-react";

import type { RepairOrder } from "@/features/repair-orders/repair-order.types";

//************************************************************** */

type UnscheduledWorkPanelProps = {
  repairOrders: RepairOrder[];

  onSchedule: (repairOrder: RepairOrder) => void;

  onViewRepairOrder: (repairOrder: RepairOrder) => void;
};

//************************************************************** */

export function UnscheduledWorkPanel({
  repairOrders,
  onSchedule,
  onViewRepairOrder,
}: UnscheduledWorkPanelProps) {
  if (repairOrders.length === 0) {
    return (
      <section className="grid min-h-72 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-center">
        <div>
          <p className="text-sm font-semibold text-zinc-700">
            No repair orders are waiting to be scheduled.
          </p>

          <p className="mt-1 max-w-md text-xs leading-5 text-zinc-400">
            Ready-to-work repair orders appear here when they have no active
            schedule.
          </p>
        </div>
      </section>
    );
  }

  const sorted = [...repairOrders].sort(
    (left, right) =>
      getPriorityRank(left.priority) - getPriorityRank(right.priority),
  );

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <header className="border-b border-zinc-200 bg-zinc-50 px-5 py-3">
        <p className="text-sm font-semibold text-zinc-700">
          {repairOrders.length} unscheduled repair order
          {repairOrders.length === 1 ? "" : "s"}
        </p>
      </header>

      <div className="hidden divide-y divide-zinc-100 md:block">
        {sorted.map((repairOrder) => {
          const customerName = getCustomerName(repairOrder);

          const vehicle = getVehicleDescription(repairOrder);

          const promisedDate = formatPromisedDate(repairOrder.promisedDate);

          const overdue = isPastPromise(repairOrder.promisedDate);

          return (
            <div
              key={repairOrder.id}
              className="flex items-center gap-3 px-5 py-3 transition hover:bg-zinc-50"
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${getPriorityDotClassName(
                  repairOrder.priority,
                )}`}
              />

              <div className="grid min-w-0 flex-1 grid-cols-[minmax(120px,1fr)_minmax(160px,1fr)_140px_120px_auto] items-center gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">
                    RO #{repairOrder.roNumber}
                  </p>

                  <p className="truncate text-xs text-zinc-500">
                    {customerName}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-700">{vehicle}</p>

                  <p className="truncate text-xs text-zinc-400">
                    {repairOrder.complaint ?? "No complaint entered"}
                  </p>
                </div>

                <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Ready to Work
                </span>

                <div>
                  <p className="text-[11px] text-zinc-400">Promised</p>

                  <p
                    className={`text-xs font-medium ${
                      overdue ? "text-red-600" : "text-zinc-600"
                    }`}
                  >
                    {promisedDate}
                    {overdue ? " · overdue" : ""}
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onViewRepairOrder(repairOrder)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => onSchedule(repairOrder)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-orange-500 px-3 text-xs font-semibold text-white transition hover:bg-orange-600"
                  >
                    <CalendarClock className="h-3.5 w-3.5" />
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="divide-y divide-zinc-100 md:hidden">
        {sorted.map((repairOrder) => (
          <div key={repairOrder.id} className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${getPriorityDotClassName(
                  repairOrder.priority,
                )}`}
              />

              <p className="text-sm font-semibold text-zinc-900">
                RO #{repairOrder.roNumber}
              </p>

              <span className="ml-auto rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                Ready
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Customer" value={getCustomerName(repairOrder)} />

              <Info
                label="Vehicle"
                value={getVehicleDescription(repairOrder)}
              />

              <Info
                label="Promised"
                value={formatPromisedDate(repairOrder.promisedDate)}
              />

              <Info
                label="Priority"
                value={formatPriority(repairOrder.priority)}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onViewRepairOrder(repairOrder)}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-700"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View RO
              </button>

              <button
                type="button"
                onClick={() => onSchedule(repairOrder)}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3 text-xs font-semibold text-white"
              >
                <CalendarClock className="h-3.5 w-3.5" />
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

//************************************************************** */

function Info({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-zinc-400">{label}</p>

      <p className="truncate text-sm text-zinc-700">{value}</p>
    </div>
  );
}

//************************************************************** */

function getCustomerName(repairOrder: RepairOrder): string {
  if (repairOrder.customer.companyName) {
    return repairOrder.customer.companyName;
  }

  return (
    [repairOrder.customer.firstName, repairOrder.customer.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "Unknown customer"
  );
}

//************************************************************** */

function getVehicleDescription(repairOrder: RepairOrder): string {
  return (
    [
      repairOrder.vehicle.year,
      repairOrder.vehicle.make,
      repairOrder.vehicle.model,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || "No vehicle"
  );
}

//************************************************************** */

function getPriorityRank(priority: RepairOrder["priority"]): number {
  switch (priority) {
    case "EMERGENCY":
      return 0;

    case "RUSH":
      return 1;

    case "STANDARD":
      return 2;

    case "HOLD":
      return 3;
  }
}

//************************************************************** */

function getPriorityDotClassName(priority: RepairOrder["priority"]): string {
  switch (priority) {
    case "EMERGENCY":
      return "bg-red-500";

    case "RUSH":
      return "bg-orange-500";

    case "HOLD":
      return "bg-zinc-400";

    case "STANDARD":
    default:
      return "bg-blue-500";
  }
}

//************************************************************** */

function formatPriority(priority: RepairOrder["priority"]): string {
  return priority
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (value) => value.toUpperCase());
}

//************************************************************** */

function formatPromisedDate(value: string | null): string {
  if (!value) {
    return "No promise";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",

    day: "numeric",

    year: "numeric",
  }).format(date);
}

//************************************************************** */

function isPastPromise(value: string | null): boolean {
  if (!value) {
    return false;
  }

  const promise = new Date(value);

  const today = new Date();

  promise.setHours(0, 0, 0, 0);

  today.setHours(0, 0, 0, 0);

  return promise < today;
}

//************************************************************** */
