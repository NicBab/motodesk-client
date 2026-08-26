"use client";

import { useState } from "react";

import { toast } from "sonner";

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { useCreateRepairOrderMutation } from "@/store/api/repairOrdersApi";

import type { CreateRepairOrderInput } from "../repair-order.types";

import { RepairOrderDialogShell } from "./RepairOrderDialogShell";

import { RepairOrderForm, type RepairOrderFormValues } from "./RepairOrderForm";

type CreateRepairOrderDialogProps = {
  organizationId: string;
  open: boolean;
  onClose: () => void;
};

type ApiErrorResponse = {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
};

export function CreateRepairOrderDialog({
  organizationId,
  open,
  onClose,
}: CreateRepairOrderDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const [createRepairOrder, { isLoading }] = useCreateRepairOrderMutation();

  if (!open) {
    return null;
  }

  async function handleSubmit(values: RepairOrderFormValues): Promise<void> {
    setError(null);

    try {
      await createRepairOrder({
        organizationId,
        ...(values as Omit<CreateRepairOrderInput, "organizationId">),
      }).unwrap();

      toast.success("Repair order created successfully.");

      onClose();
    } catch (caughtError) {
      const message = getApiErrorMessage(caughtError);

      setError(message);
      toast.error(message);
    }
  }

  return (
    <RepairOrderDialogShell
      title="New repair order"
      description="Create a repair order by selecting the customer, vehicle, priority, and initial service intake details."
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

      <RepairOrderForm
        organizationId={organizationId}
        submitLabel="Create repair order"
        isSubmitting={isLoading}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </RepairOrderDialogShell>
  );
}

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

  return "MotoDesk could not create the repair order.";
}
