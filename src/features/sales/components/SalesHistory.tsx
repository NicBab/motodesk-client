"use client";

import { Eye, RotateCcw, Search } from "lucide-react";

import { useMemo, useState } from "react";

import type { Sale, SaleReturnReason } from "../sale.types";

//************************************************************** */

type HistoryFilter = "ALL" | "PURCHASES" | "RETURNS" | SaleReturnReason;

//************************************************************** */

type Props = {
  sales: Sale[];

  search: string;

  onSearchChange: (value: string) => void;

  onView: (sale: Sale) => void;

  onReturn: (sale: Sale) => void;
};

//************************************************************** */

const historyFilters: Array<{
  value: HistoryFilter;

  label: string;
}> = [
  {
    value: "ALL",
    label: "All Transactions",
  },
  {
    value: "PURCHASES",
    label: "Purchases",
  },
  {
    value: "RETURNS",
    label: "All Returns",
  },
  {
    value: "WARRANTY",
    label: "Warranty",
  },
  {
    value: "WRONG_PART",
    label: "Wrong Part",
  },
  {
    value: "DEFECTIVE_PART",
    label: "Defective",
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
    label: "Other Returns",
  },
];

//************************************************************** */

export function SalesHistory({
  sales,
  search,
  onSearchChange,
  onView,
  onReturn,
}: Props) {
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("ALL");

  //************************************************************** */

  const filteredSales = useMemo(
    () =>
      sales.filter((sale) => {
        if (historyFilter === "ALL") {
          return true;
        }

        if (historyFilter === "PURCHASES") {
          return sale.type === "POS";
        }

        if (historyFilter === "RETURNS") {
          return sale.type === "REFUND";
        }

        return sale.type === "REFUND" && sale.returnReason === historyFilter;
      }),
    [sales, historyFilter],
  );

  //************************************************************** */

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="grid gap-3 border-b border-zinc-200 p-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search sale #, customer, part..."
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          />
        </div>

        <select
          value={historyFilter}
          onChange={(event) =>
            setHistoryFilter(event.target.value as HistoryFilter)
          }
          className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
        >
          {historyFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <Heading>Transaction #</Heading>

              <Heading>Type</Heading>

              <Heading>Date</Heading>

              <Heading>Customer</Heading>

              <Heading>Payment</Heading>

              <Heading align="right">Total</Heading>

              <Heading>Status</Heading>

              <Heading align="right">Actions</Heading>
            </tr>
          </thead>

          <tbody>
            {filteredSales.map((sale) => {
              const canReturn =
                sale.type === "POS" &&
                sale.status !== "REFUNDED" &&
                sale.status !== "VOID" &&
                sale.lines.some(
                  (line) =>
                    line.type === "PART" &&
                    Number(line.quantity) > Number(line.returnedQty),
                );

              return (
                <tr
                  key={sale.id}
                  className="border-b border-zinc-100 hover:bg-zinc-50"
                >
                  <Cell mono strong>
                    #{sale.saleNumber}
                  </Cell>

                  <Cell>
                    <TransactionBadge sale={sale} />
                  </Cell>

                  <Cell>{formatDateTime(sale.createdAt)}</Cell>

                  <Cell strong>{sale.customerName}</Cell>

                  <Cell>{formatLabel(sale.paymentMethod)}</Cell>

                  <Cell align="right">
                    <span
                      className={
                        sale.type === "REFUND"
                          ? "font-bold text-orange-600"
                          : "font-bold text-zinc-900"
                      }
                    >
                      {sale.type === "REFUND" ? "-" : ""}
                      {formatCurrency(Number(sale.total))}
                    </span>
                  </Cell>

                  <Cell>
                    <StatusBadge status={sale.status} />
                  </Cell>

                  <Cell align="right">
                    <div className="flex justify-end gap-1.5">
                      {canReturn ? (
                        <button
                          type="button"
                          onClick={() => onReturn(sale)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Return
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => onView(sale)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </div>
                  </Cell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredSales.length === 0 ? (
        <div className="grid min-h-56 place-items-center p-8 text-center text-sm text-zinc-500">
          No transactions match this history filter.
        </div>
      ) : null}

      <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
        <span className="text-xs text-zinc-500">
          {filteredSales.length} transaction
          {filteredSales.length === 1 ? "" : "s"}
        </span>

        {historyFilter !== "ALL" ? (
          <span className="text-xs font-semibold text-zinc-500">
            {
              historyFilters.find((filter) => filter.value === historyFilter)
                ?.label
            }
          </span>
        ) : null}
      </div>
    </section>
  );
}

//************************************************************** */

function TransactionBadge({ sale }: { sale: Sale }) {
  if (sale.type === "REFUND") {
    return (
      <div>
        <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">
          Return
        </span>

        {sale.returnReason ? (
          <p className="mt-1 text-[11px] font-semibold text-zinc-500">
            {formatLabel(sale.returnReason)}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-bold text-zinc-700">
      Purchase
    </span>
  );
}

//************************************************************** */

function StatusBadge({ status }: { status: Sale["status"] }) {
  const className =
    status === "REFUNDED"
      ? "border-orange-200 bg-orange-50 text-orange-700"
      : status === "PARTIALLY_REFUNDED"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : status === "VOID"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${className}`}
    >
      {formatLabel(status)}
    </span>
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

function Cell({
  children,
  align = "left",
  mono = false,
  strong = false,
}: {
  children: React.ReactNode;

  align?: "left" | "right";

  mono?: boolean;

  strong?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 text-sm text-zinc-700 ${
        align === "right" ? "text-right" : "text-left"
      } ${mono ? "font-mono" : ""} ${
        strong ? "font-semibold text-zinc-900" : ""
      }`}
    >
      {children}
    </td>
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
