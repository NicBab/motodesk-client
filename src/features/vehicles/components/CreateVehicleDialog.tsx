//************************************************************** */

"use client";

import { useState } from "react";

import { toast } from "sonner";

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { useCreateVehicleMutation } from "@/store/api/vehiclesApi";

import type { CreateVehicleInput, UpdateVehicleData } from "../vehicle.types";

import { VehicleDialogShell } from "./VehicleDialogShell";

import { VehicleForm, type VehicleFormValues } from "./VehicleForm";

//************************************************************** */

type CreateVehicleDialogProps = {
  organizationId: string;
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

export function CreateVehicleDialog({
  organizationId,
  open,
  onClose,
}: CreateVehicleDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const [createVehicle, { isLoading }] = useCreateVehicleMutation();

  if (!open) {
    return null;
  }

  async function handleSubmit(
    values: VehicleFormValues | UpdateVehicleData,
  ): Promise<void> {
    setError(null);

    try {
      await createVehicle({
        organizationId,
        ...(values as Omit<CreateVehicleInput, "organizationId">),
      }).unwrap();

      toast.success("Vehicle created successfully.");

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
      title="Add vehicle"
      description="Create a vehicle record for service, inventory, sales, and customer ownership."
      onClose={onClose}
    >
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
        submitLabel="Create vehicle"
        isSubmitting={isLoading}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
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

  return "MotoDesk could not create the vehicle.";
}

//************************************************************** */
