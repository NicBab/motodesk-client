//************************************************************** */

"use client";

import { ClipboardList } from "lucide-react";

import type { ReactNode } from "react";

import { useGetRepairOrdersQuery } from "@/store/api/repairOrdersApi";

import type { RepairOrder } from "@/features/repair-orders/repair-order.types";

//************************************************************** */

type VehicleServiceHistoryTabProps = {
  organizationId: string;
  vehicleId: string;
};

//************************************************************** */

export function VehicleServiceHistoryTab({
  organizationId,
  vehicleId,
}: VehicleServiceHistoryTabProps) {
  const {
    data: repairOrders = [],
    isLoading,
    isError,
  } = useGetRepairOrdersQuery({
    organizationId,
    vehicleId,
  });

  if (isLoading) {
    return <HistoryMessage>Loading service history...</HistoryMessage>;
  }

  if (isError) {
    return (
      <HistoryMessage>
        MotoDesk could not load this vehicle&apos;s service history.
      </HistoryMessage>
    );
  }

  if (repairOrders.length === 0) {
    return (
      <div className="grid min-h-56 place-items-center p-8 text-center">
        <div>
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-zinc-100 text-zinc-400">
            <ClipboardList className="h-5 w-5" />
          </div>

          <p className="mt-4 text-sm font-semibold text-zinc-700">
            No service history
          </p>

          <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-400">
            Repair orders associated with this vehicle will appear here.
          </p>
        </div>
      </div>
    );
  }
  //************************************************************** */
  return (
    <div className="space-y-3">
      {repairOrders.map((repairOrder) => (
        <RepairOrderHistoryItem
          key={repairOrder.id}
          repairOrder={repairOrder}
        />
      ))}
    </div>
  );
}

//************************************************************** */

type RepairOrderHistoryItemProps = {
  repairOrder: RepairOrder;
};

//************************************************************** */

function RepairOrderHistoryItem({ repairOrder }: RepairOrderHistoryItemProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-zinc-900">
              RO #{repairOrder.roNumber}
            </p>

            <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
              {formatRepairOrderLabel(repairOrder.status)}
            </span>

            <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
              {formatRepairOrderLabel(repairOrder.priority)}
            </span>
          </div>

          {repairOrder.complaint ? (
            <p className="mt-3 text-sm leading-6 text-zinc-700">
              {repairOrder.complaint}
            </p>
          ) : (
            <p className="mt-3 text-xs text-zinc-400">
              No customer complaint recorded.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500">
            <span>Opened {formatDate(repairOrder.createdAt)}</span>

            {repairOrder.scheduledDate ? (
              <span>Scheduled {formatDate(repairOrder.scheduledDate)}</span>
            ) : null}

            {repairOrder.promisedDate ? (
              <span>Promised {formatDate(repairOrder.promisedDate)}</span>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Balance
          </p>

          <p className="mt-1 text-sm font-semibold text-zinc-900">
            {formatCurrency(repairOrder.remainingBalance)}
          </p>
        </div>
      </div>

      {repairOrder.notes ? (
        <div className="mt-4 border-t border-zinc-100 pt-3">
          <p className="text-xs leading-5 text-zinc-500">{repairOrder.notes}</p>
        </div>
      ) : null}
    </article>
  );
}

//************************************************************** */

function HistoryMessage({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-56 place-items-center p-8 text-sm text-zinc-500">
      {children}
    </div>
  );
}

//************************************************************** */

function formatRepairOrderLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

//************************************************************** */

function formatCurrency(value: string): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

//************************************************************** */
