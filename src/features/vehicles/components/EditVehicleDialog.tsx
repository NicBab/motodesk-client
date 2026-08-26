//************************************************************** */

"use client";

import { useState } from "react";

import { toast } from "sonner";

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { useUpdateVehicleMutation } from "@/store/api/vehiclesApi";

import type { UpdateVehicleData, Vehicle } from "../vehicle.types";

import { VehicleDialogShell } from "./VehicleDialogShell";

import { VehicleForm, type VehicleFormValues } from "./VehicleForm";

import { VehicleServiceHistoryTab } from "./VehicleServiceHistoryTab";

import { VehicleTabs, type VehicleTab } from "./VehicleTabs";

//************************************************************** */

type EditVehicleDialogProps = {
  organizationId: string;
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
};

//************************************************************** */

type ApiErrorResponse = {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
};

//************************************************************** */

export function EditVehicleDialog({
  organizationId,
  vehicle,
  open,
  onClose,
}: EditVehicleDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<VehicleTab>("details");

  const [updateVehicle, { isLoading }] = useUpdateVehicleMutation();

  if (!open || !vehicle) {
    return null;
  }
  //************************************************************** */
  async function handleSubmit(
    values: VehicleFormValues | UpdateVehicleData,
  ): Promise<void> {
    if (!vehicle) {
      const message = "No vehicle was selected.";

      setError(message);
      toast.error(message);

      return;
    }

    setError(null);

    try {
      await updateVehicle({
        organizationId,
        vehicleId: vehicle.id,
        data: values as UpdateVehicleData,
      }).unwrap();

      toast.success("Vehicle updated successfully.");

      onClose();
    } catch (caughtError) {
      const message = getApiErrorMessage(caughtError);

      setError(message);
      toast.error(message);
    }
  }
  //************************************************************** */
  return (
    <VehicleDialogShell
      title="Vehicle"
      description="View vehicle details and complete service history."
      onClose={onClose}
    >
      <VehicleTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-6">
        {activeTab === "details" ? (
          <>
            {error ? (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            ) : null}

            <VehicleForm
              organizationId={organizationId}
              vehicle={vehicle}
              submitLabel="Save changes"
              isSubmitting={isLoading}
              onSubmit={handleSubmit}
              onCancel={onClose}
            />
          </>
        ) : null}

        {activeTab === "service" ? (
          <VehicleServiceHistoryTab
            organizationId={organizationId}
            vehicleId={vehicle.id}
          />
        ) : null}
      </div>
    </VehicleDialogShell>
  );
}

//************************************************************** */
function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "status" in error) {
    const fetchError = error as FetchBaseQueryError;

    if (
      "data" in fetchError &&
      fetchError.data &&
      typeof fetchError.data === "object" &&
      "message" in fetchError.data
    ) {
      const data = fetchError.data as ApiErrorResponse;

      return data.message;
    }
  }

  return "MotoDesk could not update the vehicle.";
}

//************************************************************** */
