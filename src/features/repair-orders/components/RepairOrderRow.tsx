import { ClipboardList } from "lucide-react";

import type { RepairOrder } from "../repair-order.types";

type RepairOrderRowProps = {
  repairOrder: RepairOrder;

  onOpen: (repairOrder: RepairOrder) => void;
};

export function RepairOrderRow({ repairOrder, onOpen }: RepairOrderRowProps) {
  const customerName = getCustomerName(repairOrder);

  const vehicleName = getVehicleName(repairOrder);

  return (
    <tr className="group border-b border-zinc-100 transition last:border-b-0 hover:bg-zinc-50">
      <td className="p-0">
        <button
          type="button"
          onClick={() => onOpen(repairOrder)}
          className="flex w-full items-center gap-3 px-4 py-4 text-left"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-500 transition group-hover:bg-orange-50 group-hover:text-orange-600">
            <ClipboardList className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-900 group-hover:text-orange-600">
              RO #{repairOrder.roNumber}
            </p>

            <p className="mt-0.5 text-[11px] text-zinc-400">
              Open repair order
            </p>
          </div>
        </button>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm font-medium text-zinc-800">{customerName}</p>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-zinc-700">{vehicleName}</p>

        {repairOrder.vehicle.vin ? (
          <p className="mt-0.5 text-[11px] text-zinc-400">
            VIN {repairOrder.vehicle.vin}
          </p>
        ) : null}
      </td>

      <td className="px-4 py-4">
        <StatusBadge status={repairOrder.status} />
      </td>

      <td className="px-4 py-4">
        <PriorityBadge priority={repairOrder.priority} />
      </td>

      <td className="max-w-xs px-4 py-4">
        <p className="truncate text-xs text-zinc-600">
          {repairOrder.complaint || "No complaint recorded"}
        </p>
      </td>

      <td className="px-4 py-4 text-xs text-zinc-600">
        {repairOrder.scheduledDate
          ? formatDate(repairOrder.scheduledDate)
          : "—"}
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
      {formatLabel(status)}
    </span>
  );
}

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
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      {formatLabel(priority)}
    </span>
  );
}

function getCustomerName(repairOrder: RepairOrder): string {
  if (repairOrder.customer.companyName) {
    return repairOrder.customer.companyName;
  }

  const name = [repairOrder.customer.firstName, repairOrder.customer.lastName]
    .filter(Boolean)
    .join(" ");

  return name || "Unnamed customer";
}

function getVehicleName(repairOrder: RepairOrder): string {
  return [
    repairOrder.vehicle.year,
    repairOrder.vehicle.make,
    repairOrder.vehicle.model,
    repairOrder.vehicle.trim,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
