//************************************************************** */

"use client";

import type {
  ReactNode,
} from "react";

import {
  Bike,
} from "lucide-react";

import {
  useGetVehiclesQuery,
} from "@/store/api/vehiclesApi";

import {
  formatVehicleLabel,
  formatVehicleName,
} from "@/features/vehicles/vehicle.utils";

//************************************************************** */

type CustomerVehiclesTabProps = {
  organizationId: string;
  customerId: string;
};

//************************************************************** */

export function CustomerVehiclesTab({
  organizationId,
  customerId,
}: CustomerVehiclesTabProps) {
  const {
    data: vehicles = [],
    isLoading,
    isError,
  } = useGetVehiclesQuery({
    organizationId,
    customerId,
    isActive: true,
  });

  if (isLoading) {
    return (
      <TabMessage>
        Loading owned vehicles...
      </TabMessage>
    );
  }

  if (isError) {
    return (
      <TabMessage>
        MotoDesk could not load this
        customer&apos;s vehicles.
      </TabMessage>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="grid min-h-56 place-items-center p-8 text-center">
        <div>
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-zinc-100 text-zinc-400">
            <Bike className="h-5 w-5" />
          </div>

          <p className="mt-4 text-sm font-semibold text-zinc-700">
            No owned vehicles
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            Vehicles assigned to this
            customer will appear here.
          </p>
        </div>
      </div>
    );
  }
//************************************************************** */
  return (
    <div className="divide-y divide-zinc-100">
      {vehicles.map((vehicle) => (
        <div
          key={vehicle.id}
          className="flex items-center justify-between gap-4 px-1 py-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-500">
              <Bike className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {formatVehicleName(
                  vehicle.year,
                  vehicle.make,
                  vehicle.model,
                  vehicle.trim,
                )}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
                <span>
                  {formatVehicleLabel(
                    vehicle.type,
                  )}
                </span>

                {vehicle.vin ? (
                  <span>
                    VIN {vehicle.vin}
                  </span>
                ) : null}

                {vehicle.mileage !==
                null ? (
                  <span>
                    {vehicle.mileage.toLocaleString()}{" "}
                    mi
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
              {formatVehicleLabel(
                vehicle.classification,
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

//************************************************************** */

function TabMessage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-56 place-items-center p-8 text-sm text-zinc-500">
      {children}
    </div>
  );
}

//************************************************************** */