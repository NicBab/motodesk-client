"use client";

import { RotateCcw, X } from "lucide-react";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import { useGetPartsQuery } from "@/store/api/partsApi";

import {
  useCreatePartReturnMutation,
  useUpdatePartReturnMutation,
} from "@/store/api/partReturnsApi";

import { useGetPurchaseOrdersQuery } from "@/store/api/purchaseOrdersApi";

import { useGetRepairOrdersQuery } from "@/store/api/repairOrdersApi";

import { useGetVendorsQuery } from "@/store/api/vendorsApi";

import type { PartReturn, PartReturnType } from "../part-return.types";

//************************************************************** */

type Props = {
  organizationId: string;

  open: boolean;

  partReturn: PartReturn | null;

  onClose: () => void;
};

//************************************************************** */

type FormState = {
  returnType: PartReturnType;

  partId: string;

  quantity: string;

  vendorId: string;

  purchaseOrderId: string;

  repairOrderId: string;

  restockingFee: string;

  returnAuthorizationNumber: string;

  creditAmount: string;

  notes: string;
};

//************************************************************** */

const returnTypes: Array<{
  value: PartReturnType;
  label: string;
}> = [
  {
    value: "TO_VENDOR",
    label: "To Vendor",
  },
  {
    value: "TO_INVENTORY",
    label: "To Inventory",
  },
  {
    value: "WRONG_PART",
    label: "Wrong Part",
  },
  {
    value: "DAMAGED",
    label: "Damaged",
  },
  {
    value: "UNUSED_RO_PART",
    label: "Unused RO Part",
  },
  {
    value: "CORE_RETURN",
    label: "Core Return",
  },
  {
    value: "WARRANTY_RETURN",
    label: "Warranty Return",
  },
];

//************************************************************** */

export function PartReturnDialog({
  organizationId,
  open,
  partReturn,
  onClose,
}: Props) {
  const [form, setForm] = useState<FormState>(() =>
    createFormState(partReturn),
  );

  const [formKey, setFormKey] = useState<string | null>(null);

  const desiredFormKey = partReturn?.id ?? "new";

  if (open && formKey !== desiredFormKey) {
    setFormKey(desiredFormKey);

    setForm(createFormState(partReturn));
  }

  const { data: parts = [] } = useGetPartsQuery({
    organizationId,

    isActive: true,
  });

  const { data: vendors = [] } = useGetVendorsQuery({
    organizationId,

    isActive: true,
  });

  const { data: purchaseOrders = [] } = useGetPurchaseOrdersQuery({
    organizationId,

    isActive: true,
  });

  const { data: repairOrders = [] } = useGetRepairOrdersQuery({
    organizationId,

    isActive: true,
  });

  const [createPartReturn, { isLoading: isCreating }] =
    useCreatePartReturnMutation();

  const [updatePartReturn, { isLoading: isUpdating }] =
    useUpdatePartReturnMutation();

  const isSaving = isCreating || isUpdating;

  const inventoryReturn =
    form.returnType === "TO_INVENTORY" || form.returnType === "UNUSED_RO_PART";

  //************************************************************** */

  const filteredPurchaseOrders = useMemo(() => {
    if (!form.partId) {
      return purchaseOrders;
    }

    return purchaseOrders.filter((purchaseOrder) =>
      purchaseOrder.lines.some((line) => line.partId === form.partId),
    );
  }, [form.partId, purchaseOrders]);

  //************************************************************** */

  if (!open) {
    return null;
  }

  //************************************************************** */

  function updateForm<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,

      [field]: value,
    }));
  }

  //************************************************************** */

  function handlePartChange(partId: string) {
    setForm((current) => ({
      ...current,

      partId,

      purchaseOrderId: "",

      repairOrderId: "",
    }));
  }

  //************************************************************** */

  function handlePurchaseOrderChange(purchaseOrderId: string) {
    const purchaseOrder = purchaseOrders.find(
      (item) => item.id === purchaseOrderId,
    );

    setForm((current) => ({
      ...current,

      purchaseOrderId,

      vendorId: purchaseOrder?.vendorId ?? current.vendorId,
    }));
  }

  //************************************************************** */

  function handleClose() {
    if (isSaving) {
      return;
    }

    setFormKey(null);

    onClose();
  }

  //************************************************************** */

  async function handleSave() {
    if (!form.partId) {
      toast.error("Select a part.");

      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Return quantity must be greater than zero.");

      return;
    }

    if (!inventoryReturn && !form.vendorId) {
      toast.error("Select a vendor for this return type.");

      return;
    }

    try {
      if (partReturn) {
        await updatePartReturn({
          organizationId,

          partReturnId: partReturn.id,

          data: {
            returnType: form.returnType,

            quantity,

            vendorId: form.vendorId || null,

            purchaseOrderId: form.purchaseOrderId || null,

            repairOrderId: form.repairOrderId || null,

            restockingFee: numberValue(form.restockingFee),

            returnAuthorizationNumber:
              form.returnAuthorizationNumber.trim() || null,

            creditAmount: numberValue(form.creditAmount),

            notes: form.notes.trim() || null,
          },
        }).unwrap();

        toast.success(`Return #${partReturn.returnNumber} updated.`);
      } else {
        await createPartReturn({
          organizationId,

          returnType: form.returnType,

          partId: form.partId,

          quantity,

          ...(form.vendorId
            ? {
                vendorId: form.vendorId,
              }
            : {}),

          ...(form.purchaseOrderId
            ? {
                purchaseOrderId: form.purchaseOrderId,
              }
            : {}),

          ...(form.repairOrderId
            ? {
                repairOrderId: form.repairOrderId,
              }
            : {}),

          restockingFee: numberValue(form.restockingFee),

          ...(form.returnAuthorizationNumber.trim()
            ? {
                returnAuthorizationNumber:
                  form.returnAuthorizationNumber.trim(),
              }
            : {}),

          creditAmount: numberValue(form.creditAmount),

          ...(form.notes.trim()
            ? {
                notes: form.notes.trim(),
              }
            : {}),
        }).unwrap();

        toast.success("Return created.");
      }

      setFormKey(null);

      onClose();
    } catch {
      toast.error(
        partReturn
          ? "MotoDesk could not update the return."
          : "MotoDesk could not create the return.",
      );
    }
  }

  //************************************************************** */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-500" />

              <h2 className="text-lg font-bold text-zinc-900">
                {partReturn
                  ? `Edit Return #${partReturn.returnNumber}`
                  : "New Return"}
              </h2>
            </div>

            <p className="mt-1 text-xs text-zinc-500">
              Create and track vendor or inventory part returns.
            </p>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label="Return Type">
              <select
                value={form.returnType}
                onChange={(event) =>
                  updateForm("returnType", event.target.value as PartReturnType)
                }
                disabled={isSaving}
                className={inputClassName}
              >
                {returnTypes.map((returnType) => (
                  <option key={returnType.value} value={returnType.value}>
                    {returnType.label}
                  </option>
                ))}
              </select>
            </FieldLabel>

            <FieldLabel label="Quantity">
              <input
                type="number"
                min="0.001"
                step="0.001"
                value={form.quantity}
                disabled={isSaving}
                onChange={(event) => updateForm("quantity", event.target.value)}
                className={inputClassName}
              />
            </FieldLabel>
          </div>

          <FieldLabel label="Part">
            <select
              value={form.partId}
              onChange={(event) => handlePartChange(event.target.value)}
              disabled={isSaving || Boolean(partReturn)}
              className={inputClassName}
            >
              <option value="">Select part...</option>

              {parts.map((part) => (
                <option key={part.id} value={part.id}>
                  {part.partNumber} — {part.description}
                </option>
              ))}
            </select>
          </FieldLabel>

          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label="Vendor">
              <select
                value={form.vendorId}
                onChange={(event) => updateForm("vendorId", event.target.value)}
                disabled={isSaving || inventoryReturn}
                className={inputClassName}
              >
                <option value="">
                  {inventoryReturn ? "Not required" : "Select vendor..."}
                </option>

                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </FieldLabel>

            <FieldLabel label="Purchase Order">
              <select
                value={form.purchaseOrderId}
                onChange={(event) =>
                  handlePurchaseOrderChange(event.target.value)
                }
                disabled={isSaving}
                className={inputClassName}
              >
                <option value="">None</option>

                {filteredPurchaseOrders.map((purchaseOrder) => (
                  <option key={purchaseOrder.id} value={purchaseOrder.id}>
                    PO #{purchaseOrder.poNumber} — {purchaseOrder.vendor.name}
                  </option>
                ))}
              </select>
            </FieldLabel>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label="Repair Order">
              <select
                value={form.repairOrderId}
                onChange={(event) =>
                  updateForm("repairOrderId", event.target.value)
                }
                disabled={isSaving}
                className={inputClassName}
              >
                <option value="">None</option>

                {repairOrders.map((repairOrder) => (
                  <option key={repairOrder.id} value={repairOrder.id}>
                    RO #{repairOrder.roNumber} —{" "}
                    {formatCustomerName(repairOrder)}
                  </option>
                ))}
              </select>
            </FieldLabel>

            <FieldLabel label="Return Authorization #">
              <input
                value={form.returnAuthorizationNumber}
                onChange={(event) =>
                  updateForm("returnAuthorizationNumber", event.target.value)
                }
                disabled={isSaving}
                placeholder="RMA / authorization"
                className={inputClassName}
              />
            </FieldLabel>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label="Restocking Fee">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.restockingFee}
                onChange={(event) =>
                  updateForm("restockingFee", event.target.value)
                }
                disabled={isSaving}
                className={inputClassName}
              />
            </FieldLabel>

            <FieldLabel label="Expected Credit">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.creditAmount}
                onChange={(event) =>
                  updateForm("creditAmount", event.target.value)
                }
                disabled={isSaving}
                className={inputClassName}
              />
            </FieldLabel>
          </div>

          <FieldLabel label="Notes">
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) => updateForm("notes", event.target.value)}
              disabled={isSaving}
              className={`${inputClassName} h-auto py-2`}
            />
          </FieldLabel>
        </div>

        <footer className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-6 py-4">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleClose}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleSave()}
            className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {isSaving
              ? "Saving..."
              : partReturn
                ? "Save Changes"
                : "Create Return"}
          </button>
        </footer>
      </div>
    </div>
  );
}

//************************************************************** */

function createFormState(partReturn: PartReturn | null): FormState {
  return {
    returnType: partReturn?.returnType ?? "TO_VENDOR",

    partId: partReturn?.partId ?? "",

    quantity: partReturn?.quantity ?? "1",

    vendorId: partReturn?.vendorId ?? "",

    purchaseOrderId: partReturn?.purchaseOrderId ?? "",

    repairOrderId: partReturn?.repairOrderId ?? "",

    restockingFee: partReturn?.restockingFee ?? "0",

    returnAuthorizationNumber: partReturn?.returnAuthorizationNumber ?? "",

    creditAmount: partReturn?.creditAmount ?? "0",

    notes: partReturn?.notes ?? "",
  };
}

//************************************************************** */

function FieldLabel({
  label,
  children,
}: {
  label: string;

  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-zinc-700">
        {label}
      </span>

      {children}
    </label>
  );
}

//************************************************************** */

function numberValue(value: string): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

//************************************************************** */

function formatCustomerName(repairOrder: {
  customer: {
    firstName: string | null;

    lastName: string | null;

    companyName: string | null;
  };
}): string {
  if (repairOrder.customer.companyName) {
    return repairOrder.customer.companyName;
  }

  const name = [repairOrder.customer.firstName, repairOrder.customer.lastName]
    .filter(Boolean)
    .join(" ");

  return name || "Customer";
}

//************************************************************** */

const inputClassName =
  "h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-orange-500 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500";

//************************************************************** */
