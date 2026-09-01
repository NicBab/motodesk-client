"use client";

import { Eye, ReceiptText, RotateCcw } from "lucide-react";

import { useState } from "react";

import { SaleReceipt } from "@/features/sales/components/SaleReceipt";

import type { Sale } from "@/features/sales/sale.types";

import { useGetSalesQuery } from "@/store/api/salesApi";

//************************************************************** */

type Props = {
  organizationId: string;

  customerId: string;
};

//************************************************************** */

export function CustomerPurchaseHistoryTab({
  organizationId,
  customerId,
}: Props) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const {
    data: sales = [],
    isLoading,
    isFetching,
    isError,
  } = useGetSalesQuery({
    organizationId,

    customerId,
  });

  //************************************************************** */

  if (selectedSale) {
    return (
      <SaleReceipt sale={selectedSale} onClose={() => setSelectedSale(null)} />
    );
  }

  //************************************************************** */

  if (isLoading) {
    return <TabMessage>Loading purchase history...</TabMessage>;
  }

  if (isError) {
    return (
      <TabMessage>
        MotoDesk could not load this customer&apos;s purchase history.
      </TabMessage>
    );
  }

  //************************************************************** */

  const purchases = sales.filter(
    (sale) => sale.type === "POS" || sale.type === "REFUND",
  );

  const grossSales = purchases
    .filter((sale) => sale.type === "POS")
    .reduce((sum, sale) => sum + Number(sale.total), 0);

  const refunds = purchases
    .filter((sale) => sale.type === "REFUND")
    .reduce((sum, sale) => sum + Number(sale.total), 0);

  const netPurchases = grossSales - refunds;

  //************************************************************** */

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Transactions" value={String(purchases.length)} />

        <Metric label="Gross Purchases" value={formatCurrency(grossSales)} />

        <Metric label="Net Purchases" value={formatCurrency(netPurchases)} />
      </div>

      {purchases.length === 0 ? (
        <TabMessage>
          No point-of-sale purchases are recorded for this customer yet.
        </TabMessage>
      ) : (
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <Heading>Transaction</Heading>

                  <Heading>Date</Heading>

                  <Heading>Items</Heading>

                  <Heading>Payment</Heading>

                  <Heading align="right">Total</Heading>

                  <Heading align="right">Action</Heading>
                </tr>
              </thead>

              <tbody>
                {purchases.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`grid h-8 w-8 place-items-center rounded-lg ${
                            sale.type === "REFUND"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {sale.type === "REFUND" ? (
                            <RotateCcw className="h-4 w-4" />
                          ) : (
                            <ReceiptText className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <p className="font-mono text-sm font-semibold text-zinc-900">
                            #{sale.saleNumber}
                          </p>

                          <p className="text-[11px] font-semibold text-zinc-500">
                            {sale.type === "REFUND" ? "Refund" : "POS Sale"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {formatDateTime(sale.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-zinc-900">
                        {sale.lines.length} item
                        {sale.lines.length === 1 ? "" : "s"}
                      </p>

                      <p className="mt-0.5 max-w-56 truncate text-xs text-zinc-500">
                        {sale.lines.map((line) => line.description).join(", ")}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {formatLabel(sale.paymentMethod)}
                    </td>

                    <td className="px-4 py-3 text-right">
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
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSale(sale)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
            <span className="text-xs text-zinc-500">
              {purchases.length} transaction
              {purchases.length === 1 ? "" : "s"}
            </span>

            {isFetching ? (
              <span className="text-xs text-zinc-400">Updating...</span>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}

//************************************************************** */

function Metric({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-zinc-900">{value}</p>
    </div>
  );
}

//************************************************************** */

function TabMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
      {children}
    </div>
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
