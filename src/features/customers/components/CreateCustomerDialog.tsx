//************************************************************** */

"use client";

import {
  useState,
} from "react";

import {
  toast,
} from "sonner";

import type {
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

import {
  useCreateCustomerMutation,
} from "@/store/api/customersApi";

import type {
  CreateCustomerInput,
  UpdateCustomerData,
} from "../customer.types";

import {
  CustomerDialogShell,
} from "./CustomerDialogShell";

import {
  CustomerForm,
  type CustomerFormValues,
} from "./CustomerForm";

//************************************************************** */

type CreateCustomerDialogProps = {
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

export function CreateCustomerDialog({
  organizationId,
  open,
  onClose,
}: CreateCustomerDialogProps) {
  const [error, setError] =
    useState<string | null>(null);

  const [
    createCustomer,
    {
      isLoading,
    },
  ] = useCreateCustomerMutation();

  if (!open) {
    return null;
  }

  async function handleSubmit(
    values:
      | CustomerFormValues
      | UpdateCustomerData,
  ): Promise<void> {
    setError(null);

    try {
      await createCustomer({
        organizationId,
        ...(values as Omit<
          CreateCustomerInput,
          "organizationId"
        >),
      }).unwrap();

      toast.success(
        "Customer created successfully.",
      );

      onClose();
    } catch (caughtError) {
      const message =
        getApiErrorMessage(
          caughtError,
        );

      setError(message);

      toast.error(message);
    }
  }

  return (
    <CustomerDialogShell
      title="Add customer"
      description="Create a customer record for service, sales, units, and repair orders."
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

      <CustomerForm
        submitLabel="Create customer"
        isSubmitting={isLoading}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </CustomerDialogShell>
  );
}

//************************************************************** */

function getApiErrorMessage(
  error: unknown,
): string {
  if (
    error &&
    typeof error === "object" &&
    "status" in error
  ) {
    const fetchError =
      error as FetchBaseQueryError;

    if (
      "data" in fetchError &&
      fetchError.data &&
      typeof fetchError.data ===
        "object" &&
      "message" in fetchError.data
    ) {
      const data =
        fetchError.data as ApiErrorResponse;

      return data.message;
    }
  }

  return "MotoDesk could not create the customer.";
}

//************************************************************** */