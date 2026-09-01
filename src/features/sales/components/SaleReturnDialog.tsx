"use client";

import { RotateCcw, X } from "lucide-react";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import { useCreateSaleReturnMutation } from "@/store/api/salesApi";

import type {
  Sale,
  SaleReturnDisposition,
  SaleReturnReason,
  SaleTenderMethod,
} from "../sale.types";

//************************************************************** */

type ReturnLineDraft = {
  saleLineId: string;

  partNumber: string;

  description: string;

  soldQty: number;

  returnedQty: number;

  remainingQty: number;

  quantity: string;

  unitPrice: number;
};

//************************************************************** */

type Props = {
  organizationId: string;

  sale: Sale;

  open: boolean;

  onClose: () => void;

  onCompleted: (refund: Sale) => void;
};

//************************************************************** */

const reasons: Array<{
  value: SaleReturnReason;

  label: string;
}> = [
  {
    value: "WRONG_PART",

    label: "Wrong Part",
  },
  {
    value: "DEFECTIVE_PART",

    label: "Defective Part",
  },
  {
    value: "WARRANTY",

    label: "Warranty",
  },
  {
    value: "CUSTOMER_CANCELLED",

    label: "Customer Cancelled",
  },
  {
    value: "DUPLICATE_SALE",

    label: "Duplicate Sale",
  },
  {
    value: "PRICING_ADJUSTMENT",

    label: "Pricing Adjustment",
  },
  {
    value: "GOODWILL",

    label: "Goodwill",
  },
  {
    value: "INVENTORY_CORRECTION",

    label: "Inventory Correction",
  },
  {
    value: "OTHER",

    label: "Other",
  },
];

//************************************************************** */

const tenderMethods: Array<{
  value: SaleTenderMethod;

  label: string;
}> = [
  {
    value: "CASH",

    label: "Cash",
  },
  {
    value: "CREDIT_CARD",

    label: "Credit Card",
  },
  {
    value: "DEBIT_CARD",

    label: "Debit Card",
  },
  {
    value: "CHECK",

    label: "Check",
  },
  {
    value: "ACH",

    label: "ACH",
  },
  {
    value: "EXTERNAL_TERMINAL",

    label: "External Terminal",
  },
];

//************************************************************** */

export function SaleReturnDialog({
  organizationId,
  sale,
  open,
  onClose,
  onCompleted,
}: Props) {
  const [reason, setReason] = useState<SaleReturnReason>("WRONG_PART");

  const [disposition, setDisposition] = useState<SaleReturnDisposition>(
    "RETURN_TO_INVENTORY",
  );

  const [refundMethod, setRefundMethod] = useState<SaleTenderMethod>(
    sale.payments[0]?.method ?? "CASH",
  );

  const [paymentReference, setPaymentReference] = useState("");

  const [managerNotes, setManagerNotes] = useState("");

  const [lines, setLines] = useState<ReturnLineDraft[]>(() =>
    sale.lines
      .filter((line) => line.type === "PART")
      .map((line) => {
        const soldQty = Number(line.quantity);

        const returnedQty = Number(line.returnedQty);

        return {
          saleLineId: line.id,

          partNumber: line.partNumber ?? "—",

          description: line.description,

          soldQty,

          returnedQty,

          remainingQty: Math.max(soldQty - returnedQty, 0),

          quantity: "0",

          unitPrice: Number(line.unitPrice),
        };
      }),
  );

  const [createSaleReturn, { isLoading: isSubmitting }] =
    useCreateSaleReturnMutation();

  //************************************************************** */

  const selectedLines = useMemo(
    () =>
      lines
        .map((line) => ({
          ...line,

          numericQuantity: numberValue(line.quantity),
        }))
        .filter((line) => line.numericQuantity > 0),
    [lines],
  );

  const refundPreview = useMemo(
    () => calculateRefundPreview(sale, selectedLines),
    [sale, selectedLines],
  );

  //************************************************************** */

  if (!open) {
    return null;
  }

  //************************************************************** */

  function updateQuantity(saleLineId: string, value: string) {
    setLines((current) =>
      current.map((line) =>
        line.saleLineId === saleLineId
          ? {
              ...line,

              quantity: value,
            }
          : line,
      ),
    );
  }

  //************************************************************** */

  async function handleSubmit() {
    if (selectedLines.length === 0) {
      toast.error("Select at least one item to return.");

      return;
    }

    for (const line of selectedLines) {
      if (line.numericQuantity > line.remainingQty) {
        toast.error(
          `${line.partNumber} only has ${formatQuantity(
            line.remainingQty,
          )} remaining to return.`,
        );

        return;
      }
    }

    if (refundPreview.total <= 0) {
      toast.error("The selected lines do not have a refundable balance.");

      return;
    }

    try {
      const refund = await createSaleReturn({
        organizationId,

        saleId: sale.id,

        reason,

        disposition,

        ...(managerNotes.trim()
          ? {
              managerNotes: managerNotes.trim(),
            }
          : {}),

        lines: selectedLines.map((line) => ({
          originalSaleLineId: line.saleLineId,

          quantity: line.numericQuantity,
        })),

        payments: [
          {
            method: refundMethod,

            amount: refundPreview.total,

            ...(paymentReference.trim()
              ? {
                  reference: paymentReference.trim(),
                }
              : {}),
          },
        ],
      }).unwrap();

      toast.success(`Refund #${refund.saleNumber} completed.`);

      onCompleted(refund);
    } catch {
      toast.error("MotoDesk could not complete the return.");
    }
  }

  //************************************************************** */

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-500" />

              <h2 className="text-lg font-bold text-zinc-900">
                Return Sale #{sale.saleNumber}
              </h2>
            </div>

            <p className="mt-1 text-xs text-zinc-500">
              Select the quantity being returned and how the merchandise should
              be handled.
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Return Reason">
              <select
                value={reason}
                disabled={isSubmitting}
                onChange={(event) =>
                  setReason(event.target.value as SaleReturnReason)
                }
                className={inputClassName}
              >
                {reasons.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Disposition">
              <select
                value={disposition}
                disabled={isSubmitting}
                onChange={(event) =>
                  setDisposition(event.target.value as SaleReturnDisposition)
                }
                className={inputClassName}
              >
                <option value="RETURN_TO_INVENTORY">Return to Inventory</option>

                <option value="SCRAP_NON_RESELLABLE">
                  Scrap / Non-Resellable
                </option>
              </select>
            </Field>

            <Field label="Refund Method">
              <select
                value={refundMethod}
                disabled={isSubmitting}
                onChange={(event) =>
                  setRefundMethod(event.target.value as SaleTenderMethod)
                }
                className={inputClassName}
              >
                {tenderMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <section className="overflow-hidden rounded-xl border border-zinc-200">
            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <h3 className="text-sm font-semibold text-zinc-900">
                Return Items
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-zinc-200 bg-white">
                    <Heading>Part</Heading>

                    <Heading align="right">Sold</Heading>

                    <Heading align="right">Already Returned</Heading>

                    <Heading align="right">Remaining</Heading>

                    <Heading align="right">Return Qty</Heading>
                  </tr>
                </thead>

                <tbody>
                  {lines.map((line) => (
                    <tr
                      key={line.saleLineId}
                      className="border-b border-zinc-100 last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-zinc-900">
                          {line.description}
                        </p>

                        <p className="mt-0.5 font-mono text-xs text-zinc-500">
                          {line.partNumber}
                        </p>
                      </td>

                      <NumberCell value={line.soldQty} />

                      <NumberCell value={line.returnedQty} />

                      <NumberCell value={line.remainingQty} />

                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min="0"
                          max={line.remainingQty}
                          step="0.001"
                          value={line.quantity}
                          disabled={isSubmitting || line.remainingQty <= 0}
                          onChange={(event) =>
                            updateQuantity(line.saleLineId, event.target.value)
                          }
                          className="h-9 w-24 rounded-lg border border-zinc-300 bg-white px-2 text-right text-sm font-semibold text-zinc-900 outline-none focus:border-orange-500 disabled:bg-zinc-100 disabled:text-zinc-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Refund Reference">
              <input
                value={paymentReference}
                disabled={isSubmitting}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder="Card auth / check # / terminal reference"
                className={inputClassName}
              />
            </Field>

            <Field label="Manager Notes">
              <input
                value={managerNotes}
                disabled={isSubmitting}
                onChange={(event) => setManagerNotes(event.target.value)}
                placeholder="Optional return notes"
                className={inputClassName}
              />
            </Field>
          </div>

          <div className="ml-auto max-w-sm space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <SummaryRow
              label="Return Subtotal"
              value={refundPreview.subtotal}
            />

            <SummaryRow
              label="Discount Reversal"
              value={-refundPreview.discount}
            />

            <SummaryRow label="Tax Refund" value={refundPreview.tax} />

            <div className="border-t border-zinc-200 pt-2">
              <SummaryRow
                label="Refund Total"
                value={refundPreview.total}
                strong
              />
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-6 py-4">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting || selectedLines.length === 0}
            onClick={() => void handleSubmit()}
            className="h-10 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting
              ? "Processing..."
              : `Refund ${formatCurrency(refundPreview.total)}`}
          </button>
        </footer>
      </div>
    </div>
  );
}

//************************************************************** */

function calculateRefundPreview(
  sale: Sale,
  lines: Array<
    ReturnLineDraft & {
      numericQuantity: number;
    }
  >,
) {
  const subtotal = money(
    lines.reduce((sum, line) => sum + line.numericQuantity * line.unitPrice, 0),
  );

  const originalSubtotal = Number(sale.subtotal);

  const originalDiscount = Number(sale.discountAmount);

  const discountRatio =
    originalSubtotal > 0 ? originalDiscount / originalSubtotal : 0;

  const discount = money(subtotal * discountRatio);

  const taxable = money(Math.max(subtotal - discount, 0));

  const tax = money(taxable * (Number(sale.taxRate) / 100));

  const calculated = money(taxable + tax);

  const remainingRefundable = money(
    Math.max(Number(sale.total) - Number(sale.refundedTotal), 0),
  );

  return {
    subtotal,

    discount,

    tax,

    total: money(Math.min(calculated, remainingRefundable)),
  };
}

//************************************************************** */

function Field({
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

function Heading({
  children,
  align = "left",
}: {
  children: React.ReactNode;

  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

//************************************************************** */

function NumberCell({ value }: { value: number }) {
  return (
    <td className="px-4 py-3 text-right text-sm font-semibold text-zinc-700">
      {formatQuantity(value)}
    </td>
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
          strong ? "text-sm font-bold text-zinc-900" : "text-sm text-zinc-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-bold text-zinc-900"
            : "text-sm font-semibold text-zinc-900"
        }
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

//************************************************************** */

function numberValue(value: string): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

//************************************************************** */

function money(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

//************************************************************** */

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
  }).format(value);
}

//************************************************************** */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",

    currency: "USD",
  }).format(value);
}

//************************************************************** */

const inputClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-orange-500 disabled:bg-zinc-100 disabled:text-zinc-500";

//************************************************************** */
