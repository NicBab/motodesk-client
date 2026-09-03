"use client";

import { useMemo, useState } from "react";

import { Search } from "lucide-react";

import type { ReportPosTransaction } from "../report.types";

import { formatReportCurrency, formatReportDateTime } from "../report.utils";

import {
  formatReportTableValue,
  ReportStatusBadge,
  ReportTableEmpty,
  ReportTableShell,
} from "./ReportTableShell";

//************************************************************** */

type ReportPosTransactionsTableProps = {
  transactions: ReportPosTransaction[];
};

//************************************************************** */

export function ReportPosTransactionsTable({
  transactions,
}: ReportPosTransactionsTableProps) {
  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");

  const [paymentFilter, setPaymentFilter] = useState("all");

  //************************************************************** */

  const typeOptions = useMemo(
    () =>
      Array.from(
        new Set(transactions.map((transaction) => transaction.type)),
      ).sort(),
    [transactions],
  );

  const paymentOptions = useMemo(
    () =>
      Array.from(
        new Set(transactions.map((transaction) => transaction.paymentMethod)),
      )
        .filter(Boolean)
        .sort(),
    [transactions],
  );

  //************************************************************** */

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      if (typeFilter !== "all" && transaction.type !== typeFilter) {
        return false;
      }

      if (
        paymentFilter !== "all" &&
        transaction.paymentMethod !== paymentFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        String(transaction.saleNumber),

        transaction.customerName,

        transaction.roNumber === null ? "" : String(transaction.roNumber),

        transaction.cashierName ?? "",

        transaction.paymentMethod,

        transaction.type,

        transaction.status,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [transactions, search, typeFilter, paymentFilter]);

  //************************************************************** */

  return (
    <ReportTableShell
      title="POS Sales Log"
      count={filtered.length}
      className="lg:col-span-2"
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search sales, customers, receipts, or ROs..."
              className="h-9 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-700 outline-none"
          >
            <option value="all">All Types</option>

            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {formatReportTableValue(option)}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
            className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-700 outline-none"
          >
            <option value="all">All Payment Types</option>

            {paymentOptions.map((option) => (
              <option key={option} value={option}>
                {formatReportTableValue(option)}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {filtered.length === 0 ? (
        <ReportTableEmpty>
          No POS transactions match the current filters.
        </ReportTableEmpty>
      ) : (
        <div className="max-h-80 overflow-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-zinc-200 text-xs text-zinc-400">
                <Header>Sale #</Header>

                <Header>Date</Header>

                <Header>Customer</Header>

                <Header>Type</Header>

                <Header>RO #</Header>

                <Header>Payment</Header>

                <Header right>Items</Header>

                <Header right>Total</Header>

                <Header>Status</Header>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {filtered.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="transition hover:bg-zinc-50"
                >
                  <Cell className="font-mono text-xs font-semibold">
                    #{transaction.saleNumber}
                  </Cell>

                  <Cell className="text-xs text-zinc-500">
                    {formatReportDateTime(transaction.createdAt)}
                  </Cell>

                  <Cell>{transaction.customerName}</Cell>

                  <Cell>
                    <ReportStatusBadge value={transaction.type} />
                  </Cell>

                  <Cell className="font-mono text-xs text-zinc-500">
                    {transaction.roNumber === null
                      ? "—"
                      : `#${transaction.roNumber}`}
                  </Cell>

                  <Cell className="text-xs text-zinc-500">
                    {formatReportTableValue(transaction.paymentMethod)}
                  </Cell>

                  <Cell right>{transaction.itemCount}</Cell>

                  <Cell
                    right
                    className={`font-semibold tabular-nums ${
                      transaction.type === "REFUND"
                        ? "text-red-600"
                        : "text-zinc-900"
                    }`}
                  >
                    {transaction.type === "REFUND" ? "-" : ""}
                    {formatReportCurrency(transaction.total)}
                  </Cell>

                  <Cell>
                    <ReportStatusBadge value={transaction.status} />
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReportTableShell>
  );
}

//************************************************************** */

function Header({
  children,
  right = false,
}: {
  children: React.ReactNode;

  right?: boolean;
}) {
  return (
    <th
      className={`whitespace-nowrap px-3 py-2 font-medium ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

//************************************************************** */

function Cell({
  children,
  right = false,
  className = "",
}: {
  children: React.ReactNode;

  right?: boolean;

  className?: string;
}) {
  return (
    <td
      className={`whitespace-nowrap px-3 py-2 ${
        right ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}

//************************************************************** */
