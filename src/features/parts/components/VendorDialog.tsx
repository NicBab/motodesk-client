"use client";

import { X } from "lucide-react";

import { toast } from "sonner";

import {
  useCreateVendorMutation,
  useUpdateVendorMutation,
} from "@/store/api/vendorsApi";

import type { Vendor } from "../vendor.types";

import { VendorForm, type VendorFormValues } from "./VendorForm";

type VendorDialogProps = {
  organizationId: string;

  vendor?: Vendor | null;

  open: boolean;

  onClose: () => void;
};

export function VendorDialog({
  organizationId,
  vendor,
  open,
  onClose,
}: VendorDialogProps) {
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();

  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();

  if (!open) {
    return null;
  }

  const disabled = isCreating || isUpdating;

  async function handleSubmit(values: VendorFormValues) {
    const name = values.name.trim();

    if (!name) {
      toast.error("Vendor name is required.");

      return;
    }

    const currentVendor = vendor ?? null;

    const data = {
      name,

      accountNumber: optional(values.accountNumber),

      contactName: optional(values.contactName),

      contactEmail: optional(values.contactEmail),

      contactPhone: optional(values.contactPhone),

      email: optional(values.email),

      phone: optional(values.phone),

      website: optional(values.website),

      addressLine1: optional(values.addressLine1),

      addressLine2: optional(values.addressLine2),

      city: optional(values.city),

      state: optional(values.state),

      postalCode: optional(values.postalCode),

      country: optional(values.country),

      notes: optional(values.notes),
    };

    try {
      if (currentVendor) {
        await updateVendor({
          organizationId,

          vendorId: currentVendor.id,

          data,
        }).unwrap();

        toast.success("Vendor updated.");
      } else {
        await createVendor({
          organizationId,
          ...data,
        }).unwrap();

        toast.success("Vendor added.");
      }

      onClose();
    } catch {
      toast.error(
        currentVendor
          ? "MotoDesk could not update the vendor."
          : "MotoDesk could not add the vendor.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              {vendor ? "Edit Vendor" : "Add Vendor"}
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              {vendor ? vendor.name : "Create a purchasing vendor."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <VendorForm
            key={vendor?.id ?? "new-vendor"}
            vendor={vendor}
            disabled={disabled}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}

function optional(value: string): string | undefined {
  const trimmed = value.trim();

  return trimmed || undefined;
}
