"use client";

import { X } from "lucide-react";

import { toast } from "sonner";

import {
  useCreatePartMutation,
  useUpdatePartMutation,
} from "@/store/api/partsApi";

import type { Part } from "../part.types";

import { PartForm, type PartFormValues } from "./PartForm";

type PartDialogProps = {
  organizationId: string;

  part?: Part | null;

  open: boolean;

  onClose: () => void;
};

export function PartDialog({
  organizationId,
  part,
  open,
  onClose,
}: PartDialogProps) {
  const [createPart, { isLoading: isCreating }] = useCreatePartMutation();

  const [updatePart, { isLoading: isUpdating }] = useUpdatePartMutation();

  if (!open) {
    return null;
  }

  const disabled = isCreating || isUpdating;

  async function handleSubmit(values: PartFormValues) {
    if (!values.partNumber.trim()) {
      toast.error("Part number is required.");

      return;
    }

    if (!values.description.trim()) {
      toast.error("Description is required.");

      return;
    }

    try {
      if (part) {
        await updatePart({
          organizationId,
          partId: part.id,

          data: {
            partNumber: values.partNumber.trim(),

            oemPartNumber: values.oemPartNumber.trim() || undefined,

            description: values.description.trim(),

            brand: values.brand.trim() || undefined,

            category: values.category.trim() || undefined,

            reorderPoint: numberValue(values.reorderPoint),

            costPrice: numberValue(values.costPrice),

            sellPrice: numberValue(values.sellPrice),

            location: values.location.trim() || undefined,
          },
        }).unwrap();

        toast.success("Part updated.");
      } else {
        await createPart({
          organizationId,

          partNumber: values.partNumber.trim(),

          oemPartNumber: values.oemPartNumber.trim() || undefined,

          description: values.description.trim(),

          brand: values.brand.trim() || undefined,

          category: values.category.trim() || undefined,

          qtyOnHand: numberValue(values.qtyOnHand),

          reorderPoint: numberValue(values.reorderPoint),

          costPrice: numberValue(values.costPrice),

          sellPrice: numberValue(values.sellPrice),

          location: values.location.trim() || undefined,
        }).unwrap();

        toast.success("Part added.");
      }

      onClose();
    } catch {
      toast.error(
        part
          ? "MotoDesk could not update the part."
          : "MotoDesk could not add the part.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              {part ? "Edit Part" : "Add Part"}
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              {part ? part.partNumber : "Create a new inventory part."}
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
          <PartForm
  key={part?.id ?? "new-part"}
  part={part}
  disabled={disabled}
  onSubmit={handleSubmit}
/>
        </div>
      </div>
    </div>
  );
}

function numberValue(value: string): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}
