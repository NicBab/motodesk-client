"use client";

import { ArrowLeft, Printer, ReceiptText, RotateCcw } from "lucide-react";

import type { Sale } from "../sale.types";

//************************************************************** */

type Props = {
  sale: Sale;

  onClose: () => void;

  onReturn?: (sale: Sale) => void;
};

//************************************************************** */

export function SaleReceipt({ sale, onClose, onReturn }: Props) {
  const canReturn =
    sale.type === "POS" &&
    sale.status !== "REFUNDED" &&
    sale.status !== "VOID" &&
    sale.lines.some(
      (line) =>
        line.type === "PART" &&
        Number(line.quantity) > Number(line.returnedQty),
    );

  const title = sale.type === "REFUND" ? "Refund Receipt" : "MotoDesk Receipt";

  //************************************************************** */

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {canReturn && onReturn ? (
            <button
              type="button"
              onClick={() => onReturn(sale)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 text-sm font-semibold text-orange-700 hover:bg-orange-100"
            >
              <RotateCcw className="h-4 w-4" />
              Return Items
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-500 px-3 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
        <div className="flex items-start justify-between border-b border-zinc-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-orange-500" />

              <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
            </div>

            <p className="mt-1 text-sm text-zinc-500">
              {sale.type === "REFUND"
                ? `Refund #${sale.saleNumber}`
                : `Sale #${sale.saleNumber}`}
            </p>

            {sale.originalSaleNumber ? (
              <p className="mt-1 text-xs text-zinc-500">
                Original Sale #{sale.originalSaleNumber}
              </p>
            ) : null}
          </div>

          <div className="text-right text-sm text-zinc-500">
            <p>{formatDateTime(sale.createdAt)}</p>

            <p className="mt-1">
              {sale.type === "REFUND" ? "Processed by" : "Cashier"}:{" "}
              {sale.type === "REFUND"
                ? (sale.processedByName ?? "—")
                : (sale.cashierName ?? "—")}
            </p>
          </div>
        </div>

        <div className="grid gap-4 border-b border-zinc-200 py-5 sm:grid-cols-2">
          <Info label="Customer" value={sale.customerName} />

          <Info
            label={sale.type === "REFUND" ? "Refund Method" : "Payment"}
            value={formatLabel(sale.paymentMethod)}
          />

          {sale.returnReason ? (
            <Info
              label="Return Reason"
              value={formatLabel(sale.returnReason)}
            />
          ) : null}

          {sale.returnDisposition ? (
            <Info
              label="Disposition"
              value={formatLabel(sale.returnDisposition)}
            />
          ) : null}
        </div>

        <div className="py-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="py-2 text-left text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Item
                </th>

                <th className="py-2 text-right text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Qty
                </th>

                <th className="py-2 text-right text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Price
                </th>

                <th className="py-2 text-right text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {sale.lines.map((line) => (
                <tr key={line.id} className="border-b border-zinc-100">
                  <td className="py-3">
                    <p className="font-semibold text-zinc-900">
                      {line.description}
                    </p>

                    <p className="mt-0.5 font-mono text-xs text-zinc-500">
                      {line.partNumber ?? "—"}
                    </p>

                    {sale.type === "POS" && Number(line.returnedQty) > 0 ? (
                      <p className="mt-1 text-xs font-medium text-orange-600">
                        Returned: {line.returnedQty}
                      </p>
                    ) : null}
                  </td>

                  <td className="py-3 text-right text-sm text-zinc-700">
                    {line.quantity}
                  </td>

                  <td className="py-3 text-right text-sm text-zinc-700">
                    {formatCurrency(Number(line.unitPrice))}
                  </td>

                  <td className="py-3 text-right text-sm font-semibold text-zinc-900">
                    {formatCurrency(
                      Number(line.quantity) * Number(line.unitPrice),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto max-w-sm space-y-2 border-t border-zinc-200 pt-4">
          <Summary label="Subtotal" value={Number(sale.subtotal)} />

          <Summary label="Discount" value={-Number(sale.discountAmount)} />

          <Summary
            label={`Tax (${Number(sale.taxRate).toFixed(2)}%)`}
            value={Number(sale.taxAmount)}
          />

          <div className="border-t border-zinc-200 pt-2">
            <Summary
              label={sale.type === "REFUND" ? "Refund Total" : "Total"}
              value={Number(sale.total)}
              strong
            />
          </div>

          {sale.type === "POS" && Number(sale.refundedTotal) > 0 ? (
            <Summary label="Refunded" value={-Number(sale.refundedTotal)} />
          ) : null}
        </div>

        {sale.payments.length > 1 ? (
          <div className="mt-5 border-t border-zinc-200 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Payments
            </p>

            <div className="mt-2 space-y-1.5">
              {sale.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-zinc-600">
                    {formatLabel(payment.method)}
                  </span>

                  <span className="font-semibold text-zinc-900">
                    {formatCurrency(Number(payment.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

//************************************************************** */

function Info({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

//************************************************************** */

function Summary({
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
        className={strong ? "font-bold text-zinc-900" : "text-sm text-zinc-500"}
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

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",

    timeStyle: "short",
  }).format(date);
}

//************************************************************** */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",

    currency: "USD",
  }).format(value);
}

//************************************************************** */
