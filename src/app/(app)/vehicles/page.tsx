//************************************************************** */

"use client";

import { Plus, Search } from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import { CreateVehicleDialog } from "@/features/vehicles/components/CreateVehicleDialog";

import { EditVehicleDialog } from "@/features/vehicles/components/EditVehicleDialog";

import { VehicleRow } from "@/features/vehicles/components/VehicleRow";

import {
  EmptyVehicles,
  VehicleTableHeading,
  VehicleTableMessage,
} from "@/features/vehicles/components/VehicleTableState";

import type {
  Vehicle,
  VehicleClassification,
  VehicleInventoryStatus,
  VehicleType,
} from "@/features/vehicles/vehicle.types";

import { formatVehicleName } from "@/features/vehicles/vehicle.utils";

import {
  useArchiveVehicleMutation,
  useGetVehiclesQuery,
  useRestoreVehicleMutation,
} from "@/store/api/vehiclesApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

type VehicleStatusFilter = "active" | "archived";

//************************************************************** */

export default function VehiclesPage() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState<"" | VehicleType>("");

  const [classificationFilter, setClassificationFilter] = useState<
    "" | VehicleClassification
  >("");

  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<
    "" | VehicleInventoryStatus
  >("");

  const [statusFilter, setStatusFilter] =
    useState<VehicleStatusFilter>("active");

  const [createOpen, setCreateOpen] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const {
    data: vehicles = [],
    isLoading,
    isFetching,
    isError,
  } = useGetVehiclesQuery(
    {
      organizationId: organizationId ?? "",

      search: search.trim() || undefined,

      type: typeFilter || undefined,

      classification: classificationFilter || undefined,

      inventoryStatus: inventoryStatusFilter || undefined,

      isActive: statusFilter === "active",
    },
    {
      skip: !organizationId,
    },
  );

  const [archiveVehicle, { isLoading: isArchiving }] =
    useArchiveVehicleMutation();

  const [restoreVehicle, { isLoading: isRestoring }] =
    useRestoreVehicleMutation();
//************************************************************** */
  async function handleArchive(vehicle: Vehicle): Promise<void> {
    if (!organizationId) {
      toast.error("No organization is currently selected.");

      return;
    }

    const confirmed = window.confirm(
      `Archive ${formatVehicleName(
        vehicle.year,
        vehicle.make,
        vehicle.model,
        vehicle.trim,
      )}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await archiveVehicle({
        organizationId,
        vehicleId: vehicle.id,
      }).unwrap();

      toast.success("Vehicle archived successfully.");
    } catch {
      toast.error("MotoDesk could not archive the vehicle.");
    }
  }
//************************************************************** */
  async function handleRestore(vehicle: Vehicle): Promise<void> {
    if (!organizationId) {
      toast.error("No organization is currently selected.");

      return;
    }

    try {
      await restoreVehicle({
        organizationId,
        vehicleId: vehicle.id,
      }).unwrap();

      toast.success("Vehicle restored successfully.");
    } catch {
      toast.error("MotoDesk could not restore the vehicle.");
    }
  }
//************************************************************** */
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Vehicles
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage customer vehicles, inventory vehicles, and stock status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          disabled={!organizationId}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add vehicle
        </button>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-zinc-200 p-4 xl:grid-cols-[minmax(0,1fr)_160px_170px_180px_150px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vehicles..."
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as "" | VehicleType)
            }
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          >
            <option value="">All types</option>

            <option value="MOTORCYCLE">Motorcycle</option>

            <option value="ATV">ATV</option>

            <option value="UTV">UTV</option>

            <option value="SCOOTER">Scooter</option>

            <option value="PWC">PWC</option>

            <option value="SNOWMOBILE">Snowmobile</option>
          </select>

          <select
            value={classificationFilter}
            onChange={(event) =>
              setClassificationFilter(
                event.target.value as "" | VehicleClassification,
              )
            }
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          >
            <option value="">All classes</option>

            <option value="NEW">New</option>

            <option value="USED">Used</option>

            <option value="SERVICE">Service</option>
          </select>

          <select
            value={inventoryStatusFilter}
            onChange={(event) =>
              setInventoryStatusFilter(
                event.target.value as "" | VehicleInventoryStatus,
              )
            }
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          >
            <option value="">All inventory status</option>

            <option value="AVAILABLE">Available</option>

            <option value="RESERVED">Reserved</option>

            <option value="PENDING_SALE">Pending sale</option>

            <option value="SOLD">Sold</option>

            <option value="WHOLESALE">Wholesale</option>

            <option value="UNAVAILABLE">Unavailable</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as VehicleStatusFilter)
            }
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          >
            <option value="active">Active</option>

            <option value="archived">Archived</option>
          </select>
        </div>

        {isLoading ? (
          <VehicleTableMessage>Loading vehicles...</VehicleTableMessage>
        ) : isError ? (
          <VehicleTableMessage>
            MotoDesk could not load vehicles.
          </VehicleTableMessage>
        ) : vehicles.length === 0 ? (
          <EmptyVehicles />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-left">
                    <VehicleTableHeading>Vehicle</VehicleTableHeading>

                    <VehicleTableHeading>Type</VehicleTableHeading>

                    <VehicleTableHeading>Classification</VehicleTableHeading>

                    <VehicleTableHeading>Inventory</VehicleTableHeading>

                    <VehicleTableHeading>VIN / Stock</VehicleTableHeading>

                    <VehicleTableHeading>Mileage</VehicleTableHeading>

                    <VehicleTableHeading>Status</VehicleTableHeading>

                    <VehicleTableHeading>Actions</VehicleTableHeading>
                  </tr>
                </thead>

                <tbody>
                  {vehicles.map((vehicle) => (
                    <VehicleRow
                      key={vehicle.id}
                      vehicle={vehicle}
                      actionDisabled={isArchiving || isRestoring}
                      onEdit={setSelectedVehicle}
                      onArchive={handleArchive}
                      onRestore={handleRestore}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
              <p className="text-xs text-zinc-500">
                {vehicles.length} vehicle
                {vehicles.length === 1 ? "" : "s"}
              </p>

              {isFetching ? (
                <span className="text-xs text-zinc-400">Updating...</span>
              ) : null}
            </div>
          </>
        )}
      </section>

      {organizationId ? (
        <>
          <CreateVehicleDialog
            organizationId={organizationId}
            open={createOpen}
            onClose={() => setCreateOpen(false)}
          />

          <EditVehicleDialog
            organizationId={organizationId}
            vehicle={selectedVehicle}
            open={selectedVehicle !== null}
            onClose={() => setSelectedVehicle(null)}
          />
        </>
      ) : null}
    </div>
  );
}

//************************************************************** */
