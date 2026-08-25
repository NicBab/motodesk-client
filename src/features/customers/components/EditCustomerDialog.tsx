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
  useUpdateCustomerMutation,
} from "@/store/api/customersApi";

import type {
  Customer,
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

type EditCustomerDialogProps = {
  organizationId: string;
  customer: Customer | null;
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

export function EditCustomerDialog({
  organizationId,
  customer,
  open,
  onClose,
}: EditCustomerDialogProps) {
  const [error, setError] =
    useState<string | null>(null);

  const [
    updateCustomer,
    {
      isLoading,
    },
  ] = useUpdateCustomerMutation();

  if (!open || !customer) {
    return null;
  }

  async function handleSubmit(
    values:
      | CustomerFormValues
      | UpdateCustomerData,
  ): Promise<void> {
    if (!customer) {
      const message =
        "No customer was selected.";

      setError(message);
      toast.error(message);

      return;
    }

    setError(null);

    try {
      await updateCustomer({
        organizationId,
        customerId: customer.id,
        data:
          values as UpdateCustomerData,
      }).unwrap();

      toast.success(
        "Customer updated successfully.",
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

  //************************************************************** */

  return (
    <CustomerDialogShell
      title="Edit customer"
      description="Update customer contact details, address information, and internal notes."
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
        customer={customer}
        submitLabel="Save changes"
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

  return "MotoDesk could not update the customer.";
}

//************************************************************** */