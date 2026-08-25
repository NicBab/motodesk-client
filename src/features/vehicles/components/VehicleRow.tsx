//************************************************************** */

import { Archive, Bike, RotateCcw } from "lucide-react";

import type { Vehicle } from "../vehicle.types";

import { formatVehicleLabel, formatVehicleName } from "../vehicle.utils";

//************************************************************** */

type VehicleRowProps = {
  vehicle: Vehicle;
  actionDisabled: boolean;

  onEdit: (vehicle: Vehicle) => void;

  onArchive: (vehicle: Vehicle) => Promise<void>;

  onRestore: (vehicle: Vehicle) => Promise<void>;
};

//************************************************************** */

export function VehicleRow({
  vehicle,
  actionDisabled,
  onEdit,
  onArchive,
  onRestore,
}: VehicleRowProps) {
  return (
    <tr className="group border-b border-zinc-100 transition last:border-b-0 hover:bg-zinc-50">
      <td className="p-0">
        <button
          type="button"
          onClick={() => onEdit(vehicle)}
          className="flex w-full items-center gap-3 px-4 py-4 text-left"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-500 transition group-hover:bg-orange-50 group-hover:text-orange-600">
            <Bike className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 group-hover:text-orange-600">
              {formatVehicleName(
                vehicle.year,
                vehicle.make,
                vehicle.model,
                vehicle.trim,
              )}
            </p>

            {vehicle.color ? (
              <p className="mt-0.5 text-xs text-zinc-400">{vehicle.color}</p>
            ) : (
              <p className="mt-0.5 text-[11px] text-zinc-400">
                View or edit vehicle
              </p>
            )}
          </div>
        </button>
      </td>

      <td className="px-4 py-4 text-xs text-zinc-600">
        {formatVehicleLabel(vehicle.type)}
      </td>

      <td className="px-4 py-4">
        <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
          {formatVehicleLabel(vehicle.classification)}
        </span>
      </td>

      <td className="px-4 py-4">
        <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
          {formatVehicleLabel(vehicle.inventoryStatus)}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="space-y-1">
          <p className="text-xs text-zinc-600">{vehicle.vin || "No VIN"}</p>

          {vehicle.stockNumber ? (
            <p className="text-[11px] text-zinc-400">
              Stock {vehicle.stockNumber}
            </p>
          ) : null}
        </div>
      </td>

      <td className="px-4 py-4 text-xs text-zinc-600">
        {vehicle.mileage !== null ? vehicle.mileage.toLocaleString() : "—"}
      </td>

      <td className="px-4 py-4">
        {vehicle.isActive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
            Archived
          </span>
        )}
      </td>

      <td className="px-4 py-4 text-right">
        {vehicle.isActive ? (
          <button
            type="button"
            disabled={actionDisabled}
            onClick={() => void onArchive(vehicle)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-medium text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Archive className="h-3.5 w-3.5" />
            Archive
          </button>
        ) : (
          <button
            type="button"
            disabled={actionDisabled}
            onClick={() => void onRestore(vehicle)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-medium text-zinc-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restore
          </button>
        )}
      </td>
    </tr>
  );
}

//************************************************************** */
