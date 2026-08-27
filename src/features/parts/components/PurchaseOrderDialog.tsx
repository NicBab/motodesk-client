"use client";

import { Plus, Trash2, X } from "lucide-react";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import { useGetPartsQuery } from "@/store/api/partsApi";

import { useCreatePurchaseOrderMutation } from "@/store/api/purchaseOrdersApi";

import { useGetVendorsQuery } from "@/store/api/vendorsApi";

//************************************************************** */

type PurchaseOrderDraftLine = {
  key: string;

  partNumber: string;
  description: string;

  partId: string;

  repairOrderPartLineId: string;

  quantity: string;
  unitCost: string;
};

//************************************************************** */

export type PurchaseOrderInitialLine = {
  partId?: string;

  repairOrderPartLineId?: string;

  partNumber: string;

  description: string;

  quantity: number;

  unitCost: number;
};

//************************************************************** */

type Props = {
  organizationId: string;

  open: boolean;

  initialLines?: PurchaseOrderInitialLine[];

  onClose: () => void;
};

//************************************************************** */

export function PurchaseOrderDialog({
  organizationId,
  open,
  initialLines,
  onClose,
}: Props) {
  const [vendorId, setVendorId] = useState("");

  const [expectedAt, setExpectedAt] = useState("");

  const [vendorReference, setVendorReference] = useState("");

  const [shippingCost, setShippingCost] = useState("0");

  const [taxAmount, setTaxAmount] = useState("0");

  const [notes, setNotes] = useState("");

  const [lines, setLines] = useState<PurchaseOrderDraftLine[]>(() =>
    initialLines?.length
      ? initialLines.map(createInitialLine)
      : [createEmptyLine()],
  );

  //************************************************************** */

  const { data: vendors = [] } = useGetVendorsQuery({
    organizationId,

    isActive: true,
  });

  const { data: parts = [] } = useGetPartsQuery({
    organizationId,

    isActive: true,
  });

  const [createPurchaseOrder, { isLoading: isCreating }] =
    useCreatePurchaseOrderMutation();

  //************************************************************** */

  const partLookup = useMemo(() => {
    const lookup = new Map<string, (typeof parts)[number]>();

    for (const part of parts) {
      lookup.set(normalizePartNumber(part.partNumber), part);

      if (part.oemPartNumber) {
        lookup.set(normalizePartNumber(part.oemPartNumber), part);
      }

      for (const alternate of part.alternatePartNumbers) {
        lookup.set(normalizePartNumber(alternate), part);
      }
    }

    return lookup;
  }, [parts]);

  //************************************************************** */

  if (!open) {
    return null;
  }

  //************************************************************** */

  const subtotal = lines.reduce(
    (total, line) =>
      total + numberValue(line.quantity) * numberValue(line.unitCost),
    0,
  );

  const total = subtotal + numberValue(shippingCost) + numberValue(taxAmount);

  //************************************************************** */

  function updateLine(key: string, updates: Partial<PurchaseOrderDraftLine>) {
    setLines((current) =>
      current.map((line) =>
        line.key === key
          ? {
              ...line,
              ...updates,
            }
          : line,
      ),
    );
  }

  //************************************************************** */

  function handlePartNumberChange(key: string, value: string) {
    updateLine(key, {
      partNumber: value,

      /*
       * If the user manually changes the part
       * number, clear only the inventory link.
       *
       * Preserve repairOrderPartLineId because
       * special-order RO parts are allowed to
       * remain non-inventory parts.
       */
      partId: "",
    });
  }

  //************************************************************** */

  function handleResolvePart(key: string) {
    const line = lines.find((item) => item.key === key);

    if (!line) {
      return;
    }

    const partNumber = line.partNumber.trim();

    if (!partNumber) {
      updateLine(key, {
        partId: "",
      });

      return;
    }

    const part = partLookup.get(normalizePartNumber(partNumber));

    if (!part) {
      updateLine(key, {
        partId: "",
      });

      return;
    }

    updateLine(key, {
      partId: part.id,

      partNumber: part.partNumber,

      description: part.description,

      unitCost: part.costPrice,
    });
  }

  //************************************************************** */

  function handleAddLine() {
    setLines((current) => [...current, createEmptyLine()]);
  }

  //************************************************************** */

  function handleRemoveLine(key: string) {
    setLines((current) => {
      if (current.length === 1) {
        return [createEmptyLine()];
      }

      return current.filter((line) => line.key !== key);
    });
  }

  //************************************************************** */

  async function handleCreate() {
    if (!vendorId) {
      toast.error("Select a vendor.");

      return;
    }

    const enteredLines = lines.filter(
      (line) => line.partNumber.trim() || line.description.trim(),
    );

    if (enteredLines.length === 0) {
      toast.error("Add at least one PO line.");

      return;
    }

    for (const line of enteredLines) {
      if (!line.partNumber.trim()) {
        toast.error("Every PO line needs a part number.");

        return;
      }

      if (!line.description.trim()) {
        toast.error(`Enter a description for ${line.partNumber.trim()}.`);

        return;
      }

      const quantity = Number(line.quantity);

      const unitCost = Number(line.unitCost);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        toast.error("Every PO line needs a valid quantity.");

        return;
      }

      if (!Number.isFinite(unitCost) || unitCost < 0) {
        toast.error("Every PO line needs a valid unit cost.");

        return;
      }
    }

    //************************************************************** */

    try {
      await createPurchaseOrder({
        organizationId,

        vendorId,

        ...(expectedAt
          ? {
              expectedAt,
            }
          : {}),

        ...(vendorReference.trim()
          ? {
              vendorReference: vendorReference.trim(),
            }
          : {}),

        shippingCost: numberValue(shippingCost),

        taxAmount: numberValue(taxAmount),

        ...(notes.trim()
          ? {
              notes: notes.trim(),
            }
          : {}),

        lines: enteredLines.map((line) => ({
          ...(line.partId
            ? {
                partId: line.partId,
              }
            : {
                partNumber: line.partNumber.trim(),

                description: line.description.trim(),
              }),

          ...(line.repairOrderPartLineId
            ? {
                repairOrderPartLineId: line.repairOrderPartLineId,
              }
            : {}),

          orderedQty: Number(line.quantity),

          unitCost: Number(line.unitCost),
        })),
      }).unwrap();

      toast.success("Purchase order created.");

      onClose();
    } catch {
      toast.error("MotoDesk could not create the purchase order.");
    }
  }

  //************************************************************** */

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              Create Purchase Order
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Enter inventory or vendor-only parts.
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

        <div className="space-y-6 p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Vendor" required>
              <select
                value={vendorId}
                onChange={(event) => setVendorId(event.target.value)}
                className={inputClassName}
              >
                <option value="">Select vendor...</option>

                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Expected delivery">
              <input
                type="date"
                value={expectedAt}
                onChange={(event) => setExpectedAt(event.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Vendor reference">
              <input
                value={vendorReference}
                onChange={(event) => setVendorReference(event.target.value)}
                placeholder="Confirmation / reference"
                className={inputClassName}
              />
            </Field>
          </div>

          <section className="overflow-hidden rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  PO Lines
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  Type or paste a part number. Inventory matches fill
                  automatically; vendor-only parts remain manual.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddLine}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                <Plus className="h-3.5 w-3.5" />
                Add line
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-zinc-200 bg-white">
                    <Heading>Part Number</Heading>

                    <Heading>Description</Heading>

                    <Heading align="right">Qty</Heading>

                    <Heading align="right">Unit Cost</Heading>

                    <Heading align="right">Line Total</Heading>

                    <Heading align="right">Actions</Heading>
                  </tr>
                </thead>

                <tbody>
                  {lines.map((line) => {
                    const selectedPart = line.partId
                      ? (parts.find((part) => part.id === line.partId) ?? null)
                      : null;

                    const lineTotal =
                      numberValue(line.quantity) * numberValue(line.unitCost);

                    return (
                      <tr
                        key={line.key}
                        className="border-b border-zinc-100 last:border-b-0"
                      >
                        <td className="px-4 py-3 align-top">
                          <input
                            value={line.partNumber}
                            onChange={(event) =>
                              handlePartNumberChange(
                                line.key,

                                event.target.value,
                              )
                            }
                            onBlur={() => handleResolvePart(line.key)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();

                                handleResolvePart(line.key);
                              }
                            }}
                            placeholder="Part #"
                            className="h-9 w-full rounded-md border border-zinc-300 bg-white px-2 font-mono text-sm font-semibold text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500"
                          />

                          {selectedPart ? (
                            <p className="mt-1 text-xs font-medium text-emerald-600">
                              Inventory linked
                            </p>
                          ) : line.repairOrderPartLineId ? (
                            <p className="mt-1 text-xs font-medium text-blue-600">
                              RO special order
                            </p>
                          ) : line.partNumber.trim() ? (
                            <p className="mt-1 text-xs text-zinc-400">
                              Manual / not in inventory
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-3 align-top">
                          <input
                            value={line.description}
                            onChange={(event) =>
                              updateLine(
                                line.key,

                                {
                                  description: event.target.value,
                                },
                              )
                            }
                            placeholder="Part description"
                            className="h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500"
                          />

                          {selectedPart ? (
                            <p className="mt-1 text-xs text-zinc-400">
                              On hand: {selectedPart.qtyOnHand}
                              {" · "}
                              Allocated: {selectedPart.qtyAllocated}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-3 text-right align-top">
                          <input
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={line.quantity}
                            onChange={(event) =>
                              updateLine(
                                line.key,

                                {
                                  quantity: event.target.value,
                                },
                              )
                            }
                            className="h-9 w-24 rounded-md border border-zinc-300 bg-white px-2 text-right text-sm font-medium text-zinc-900 outline-none focus:border-orange-500"
                          />
                        </td>

                        <td className="px-4 py-3 text-right align-top">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitCost}
                            onChange={(event) =>
                              updateLine(
                                line.key,

                                {
                                  unitCost: event.target.value,
                                },
                              )
                            }
                            className="h-9 w-28 rounded-md border border-zinc-300 bg-white px-2 text-right text-sm font-medium text-zinc-900 outline-none focus:border-orange-500"
                          />
                        </td>

                        <td className="px-4 py-3 text-right align-top text-sm font-semibold text-zinc-900">
                          {formatCurrency(lineTotal)}
                        </td>

                        <td className="px-4 py-3 text-right align-top">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(line.key)}
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 px-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px]">
            <Field label="Notes">
              <textarea
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 outline-none focus:border-orange-500"
              />
            </Field>

            <Field label="Shipping">
              <input
                type="number"
                min="0"
                step="0.01"
                value={shippingCost}
                onChange={(event) => setShippingCost(event.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Tax">
              <input
                type="number"
                min="0"
                step="0.01"
                value={taxAmount}
                onChange={(event) => setTaxAmount(event.target.value)}
                className={inputClassName}
              />
            </Field>
          </div>

          <div className="ml-auto max-w-sm space-y-2 border-t border-zinc-200 pt-4">
            <SummaryRow label="Subtotal" value={subtotal} />

            <SummaryRow label="Shipping" value={numberValue(shippingCost)} />

            <SummaryRow label="Tax" value={numberValue(taxAmount)} />

            <div className="border-t border-zinc-200 pt-2">
              <SummaryRow label="Total" value={total} strong />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-zinc-200 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isCreating}
              onClick={() => void handleCreate()}
              className="h-10 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Draft PO"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

//************************************************************** */

function createEmptyLine(): PurchaseOrderDraftLine {
  return {
    key: crypto.randomUUID(),

    partNumber: "",

    description: "",

    partId: "",

    repairOrderPartLineId: "",

    quantity: "1",

    unitCost: "0",
  };
}

//************************************************************** */

function createInitialLine(
  line: PurchaseOrderInitialLine,
): PurchaseOrderDraftLine {
  return {
    key: crypto.randomUUID(),

    partNumber: line.partNumber,

    description: line.description,

    partId: line.partId ?? "",

    repairOrderPartLineId: line.repairOrderPartLineId ?? "",

    quantity: String(line.quantity),

    unitCost: String(line.unitCost),
  };
}

//************************************************************** */

function normalizePartNumber(value: string): string {
  return value.trim().toUpperCase();
}

//************************************************************** */

function numberValue(value: string): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

//************************************************************** */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",

    currency: "USD",
  }).format(value);
}

//************************************************************** */

function Field({
  label,
  required = false,
  children,
}: {
  label: string;

  required?: boolean;

  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-zinc-700">
        {label}

        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>

      {children}
    </label>
  );
}

//************************************************************** */

function Heading({
  children,
  align = "left",
}: {
  children: React.ReactNode;

  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

//************************************************************** */

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;

  value: number;

  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "text-sm font-semibold text-zinc-900"
            : "text-sm text-zinc-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-base font-bold text-zinc-900"
            : "text-sm font-semibold text-zinc-900"
        }
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

//************************************************************** */

const inputClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500";

//************************************************************** */
