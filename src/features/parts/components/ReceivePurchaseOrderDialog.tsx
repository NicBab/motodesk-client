"use client";

import { PackageCheck, X } from "lucide-react";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import { useReceivePurchaseOrderMutation } from "@/store/api/purchaseOrdersApi";

import type {
  PurchaseOrder,
  PurchaseOrderLine,
} from "../purchase-order.types";

//************************************************************** */

type Props = {
  organizationId: string;

  purchaseOrder: PurchaseOrder | null;

  open: boolean;

  onClose: () => void;
};

//************************************************************** */

type ReceiveLineState = {
  receivedQty: string;
  damagedQty: string;
  backorderedQty: string;

  actualCost: string;
  binLocation: string;
  notes: string;
};

//************************************************************** */

type ReceiveState = Record<string, ReceiveLineState>;

//************************************************************** */

export function ReceivePurchaseOrderDialog({
  organizationId,
  purchaseOrder,
  open,
  onClose,
}: Props) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [packingSlip, setPackingSlip] = useState("");
  const [receiptNotes, setReceiptNotes] = useState("");

  const [receiveState, setReceiveState] = useState<ReceiveState>({});

  const [receivePurchaseOrder, { isLoading }] =
    useReceivePurchaseOrderMutation();

  //************************************************************** */

  const totals = useMemo(() => {
    if (!purchaseOrder) {
      return {
        ordered: 0,
        received: 0,
        remaining: 0,
      };
    }

    const ordered = purchaseOrder.lines.reduce(
      (sum, line) => sum + toNumber(line.orderedQty),
      0,
    );

    const received = purchaseOrder.lines.reduce(
      (sum, line) => sum + toNumber(line.receivedQty),
      0,
    );

    return {
      ordered,
      received,
      remaining: Math.max(ordered - received, 0),
    };
  }, [purchaseOrder]);

  //************************************************************** */

  if (!open || !purchaseOrder) {
    return null;
  }

  //************************************************************** */

  function getLineState(line: PurchaseOrderLine): ReceiveLineState {
    return receiveState[line.id] ?? createInitialLineState(line);
  }

  //************************************************************** */

  function updateLine(
    line: PurchaseOrderLine,
    field: keyof ReceiveLineState,
    value: string,
  ) {
    setReceiveState((current) => {
      const currentLineState = current[line.id] ?? createInitialLineState(line);

      return {
        ...current,

        [line.id]: {
          ...currentLineState,

          [field]: value,
        },
      };
    });
  }

  //************************************************************** */

  function resetForm() {
    setInvoiceNumber("");
    setPackingSlip("");
    setReceiptNotes("");
    setReceiveState({});
  }

  //************************************************************** */

  function handleClose() {
    if (isLoading) {
      return;
    }

    resetForm();
    onClose();
  }

  //************************************************************** */

  async function handleSave() {
    if (!purchaseOrder) {
      return;
    }

    const receiptLines = purchaseOrder.lines
      .map((line) => {
        const state = getLineState(line);

        return {
          line,
          state,
          quantity: toNumber(state.receivedQty),
        };
      })
      .filter(({ quantity }) => quantity > 0);

    if (receiptLines.length === 0) {
      toast.error("Enter a received quantity for at least one PO line.");
      return;
    }

    for (const { line, state, quantity } of receiptLines) {
      const remainingQty = getRemainingQty(line);

      if (quantity > remainingQty) {
        toast.error(
          `${line.partNumber} cannot receive more than ${formatQuantity(
            remainingQty,
          )}.`,
        );
        return;
      }

      if (toNumber(state.damagedQty) < 0) {
        toast.error("Damaged quantity cannot be negative.");
        return;
      }

      if (toNumber(state.backorderedQty) < 0) {
        toast.error("Backordered quantity cannot be negative.");
        return;
      }

      if (toNumber(state.actualCost) < 0) {
        toast.error("Actual cost cannot be negative.");
        return;
      }
    }

    try {
      await receivePurchaseOrder({
        organizationId,
        purchaseOrderId: purchaseOrder.id,
        data: {
          ...(invoiceNumber.trim()
            ? {
                invoiceNumber: invoiceNumber.trim(),
              }
            : {}),

          ...(packingSlip.trim()
            ? {
                packingSlip: packingSlip.trim(),
              }
            : {}),

          ...(receiptNotes.trim()
            ? {
                notes: receiptNotes.trim(),
              }
            : {}),

          lines: receiptLines.map(({ line, state, quantity }) => ({
            purchaseOrderLineId: line.id,
            quantity,
            damagedQty: toNumber(state.damagedQty),
            backorderedQty: toNumber(state.backorderedQty),

            ...(hasNumber(state.actualCost)
              ? {
                  actualCost: toNumber(state.actualCost),
                }
              : {}),

            ...(state.binLocation.trim()
              ? {
                  binLocation: state.binLocation.trim(),
                }
              : {}),

            ...(state.notes.trim()
              ? {
                  notes: state.notes.trim(),
                }
              : {}),
          })),
        },
      }).unwrap();

      toast.success(
        `Receipt saved for PO #${purchaseOrder.poNumber}. Receipt history, inventory, and linked repair orders were updated.`,
      );

      resetForm();
      onClose();
    } catch {
      toast.error("MotoDesk could not complete the purchase order receipt.");
    }
  }

  //************************************************************** */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-orange-500" />

              <h2 className="text-lg font-bold text-zinc-900">
                Receive PO #{purchaseOrder.poNumber}
              </h2>
            </div>

            <p className="mt-1 text-sm text-zinc-500">
              {purchaseOrder.vendor.name}
            </p>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
            aria-label="Close receiving dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid gap-3 border-b border-zinc-200 bg-zinc-50 px-6 py-4 sm:grid-cols-4">
          <SummaryCard label="Status" value={formatStatus(purchaseOrder.status)} />

          <SummaryCard
            label="Ordered"
            value={
              purchaseOrder.orderedAt ? formatDate(purchaseOrder.orderedAt) : "—"
            }
          />

          <SummaryCard
            label="Expected"
            value={
              purchaseOrder.expectedAt
                ? formatDate(purchaseOrder.expectedAt)
                : "—"
            }
          />

          <SummaryCard
            label="Received"
            value={`${formatQuantity(totals.received)} / ${formatQuantity(
              totals.ordered,
            )}`}
          />
        </div>

        <div className="border-b border-zinc-200 px-6 py-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Invoice #"
              value={invoiceNumber}
              disabled={isLoading}
              placeholder="Vendor invoice number"
              onChange={setInvoiceNumber}
            />

            <Field
              label="Packing Slip"
              value={packingSlip}
              disabled={isLoading}
              placeholder="Packing slip number"
              onChange={setPackingSlip}
            />

            <Field
              label="Receipt Notes"
              value={receiptNotes}
              disabled={isLoading}
              placeholder="Notes for this receipt"
              onChange={setReceiptNotes}
            />
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {purchaseOrder.lines.map((line) => {
            const state = getLineState(line);
            const orderedQty = toNumber(line.orderedQty);
            const alreadyReceivedQty = toNumber(line.receivedQty);
            const remainingQty = getRemainingQty(line);
            const complete = remainingQty <= 0;

            return (
              <section
                key={line.id}
                className={`rounded-xl border p-4 ${
                  complete
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-zinc-900">
                        {line.description}
                      </p>

                      {complete ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          RECEIVED
                        </span>
                      ) : null}

                      {line.repairOrderPartLineId ? (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                          RO LINKED
                        </span>
                      ) : null}

                      {!line.partId ? (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-600">
                          SPECIAL ORDER
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 font-mono text-xs text-zinc-500">
                      {line.partNumber}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-right text-xs">
                    <QuantitySummary label="Ordered" value={orderedQty} />
                    <QuantitySummary
                      label="Received"
                      value={alreadyReceivedQty}
                    />
                    <QuantitySummary
                      label="Remaining"
                      value={remainingQty}
                      emphasize={remainingQty > 0}
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field
                    label="Received"
                    value={state.receivedQty}
                    type="number"
                    min="0"
                    max={String(remainingQty)}
                    step="0.001"
                    disabled={complete || isLoading}
                    placeholder="0"
                    onChange={(value) => updateLine(line, "receivedQty", value)}
                  />

                  <Field
                    label="Damaged"
                    value={state.damagedQty}
                    type="number"
                    min="0"
                    step="0.001"
                    disabled={complete || isLoading}
                    placeholder="0"
                    onChange={(value) => updateLine(line, "damagedQty", value)}
                  />

                  <Field
                    label="Backordered"
                    value={state.backorderedQty}
                    type="number"
                    min="0"
                    step="0.001"
                    disabled={complete || isLoading}
                    placeholder="0"
                    onChange={(value) =>
                      updateLine(line, "backorderedQty", value)
                    }
                  />

                  <Field
                    label="Actual Cost"
                    value={state.actualCost}
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={complete || isLoading}
                    placeholder="0.00"
                    onChange={(value) => updateLine(line, "actualCost", value)}
                  />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Bin Location"
                    value={state.binLocation}
                    disabled={complete || isLoading || !line.partId}
                    placeholder={line.partId ? "A-1" : "Not applicable"}
                    onChange={(value) => updateLine(line, "binLocation", value)}
                  />

                  <Field
                    label="Line Notes"
                    value={state.notes}
                    disabled={complete || isLoading}
                    placeholder="Optional line-level receiving note"
                    onChange={(value) => updateLine(line, "notes", value)}
                  />
                </div>
              </section>
            );
          })}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            Remaining quantity: {" "}
            <strong className="text-zinc-700">
              {formatQuantity(totals.remaining)}
            </strong>
          </p>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleClose}
              className="h-10 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isLoading || purchaseOrder.lines.length === 0}
              onClick={() => void handleSave()}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PackageCheck className="h-4 w-4" />
              {isLoading ? "Processing..." : "Save Receipt"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

//************************************************************** */

function createInitialLineState(line: PurchaseOrderLine): ReceiveLineState {
  return {
    receivedQty: "",
    damagedQty: "",
    backorderedQty: "",
    actualCost:
      line.actualCost !== null && line.actualCost !== undefined
        ? String(line.actualCost)
        : String(line.unitCost ?? ""),
    binLocation: line.binLocation ?? line.part?.location ?? "",
    notes: "",
  };
}

//************************************************************** */

function getRemainingQty(line: PurchaseOrderLine): number {
  return Math.max(toNumber(line.orderedQty) - toNumber(line.receivedQty), 0);
}

//************************************************************** */

function Field({
  label,
  value,
  type = "text",
  min,
  max,
  step,
  placeholder,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  type?: "text" | "number";
  min?: string;
  max?: string;
  step?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-zinc-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      />
    </label>
  );
}

//************************************************************** */

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-zinc-800">{value}</p>
    </div>
  );
}

//************************************************************** */

function QuantitySummary({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: number;
  emphasize?: boolean;
}) {
  return (
    <div>
      <p className="text-zinc-400">{label}</p>
      <p
        className={`mt-0.5 font-bold ${
          emphasize ? "text-amber-600" : "text-zinc-700"
        }`}
      >
        {formatQuantity(value)}
      </p>
    </div>
  );
}

//************************************************************** */

function hasNumber(value: string): boolean {
  return value.trim().length > 0 && Number.isFinite(Number(value));
}

//************************************************************** */

function toNumber(value: string | number | null | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

//************************************************************** */

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
  }).format(value);
}

//************************************************************** */

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

//************************************************************** */

function formatStatus(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

const inputClassName =
  "h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500";

//************************************************************** */
