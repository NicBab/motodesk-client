"use client";

import { useMemo, useState } from "react";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import type {
  ReportFilterOption,
  ReportRepairOrderTransaction,
} from "../report.types";

import { formatReportCurrency, formatReportDateTime } from "../report.utils";

import {
  formatReportTableValue,
  ReportStatusBadge,
  ReportTableEmpty,
  ReportTableShell,
} from "./ReportTableShell";

//************************************************************** */

type ReportRepairOrdersTableProps = {
  transactions: ReportRepairOrderTransaction[];

  technicians: ReportFilterOption[];

  serviceAdvisors: ReportFilterOption[];
};

//************************************************************** */

const PAGE_SIZE = 15;

//************************************************************** */

export function ReportRepairOrdersTable({
  transactions,
  technicians,
  serviceAdvisors,
}: ReportRepairOrdersTableProps) {
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [technicianFilter, setTechnicianFilter] = useState("all");

  const [advisorFilter, setAdvisorFilter] = useState("all");

  const [page, setPage] = useState(0);

  //************************************************************** */

  const statusOptions = useMemo(
    () =>
      Array.from(
        new Set(transactions.map((transaction) => transaction.status)),
      ).sort(),
    [transactions],
  );

  //************************************************************** */

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...transactions]
      .filter((transaction) => {
        if (statusFilter !== "all" && transaction.status !== statusFilter) {
          return false;
        }

        if (
          technicianFilter !== "all" &&
          transaction.technicianMembershipId !== technicianFilter
        ) {
          return false;
        }

        if (
          advisorFilter !== "all" &&
          transaction.serviceAdvisorMembershipId !== advisorFilter
        ) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [
          String(transaction.roNumber),

          transaction.customerName,

          transaction.vehicle,

          transaction.vin ?? "",

          transaction.technicianName ?? "",

          transaction.serviceAdvisorName ?? "",

          transaction.status,

          transaction.priority,
        ].some((value) => value.toLowerCase().includes(query));
      })
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );
  }, [transactions, search, statusFilter, technicianFilter, advisorFilter]);

  //************************************************************** */

  const pageCount = Math.max(
    1,

    Math.ceil(filtered.length / PAGE_SIZE),
  );

  const safePage = Math.min(page, pageCount - 1);

  const visible = filtered.slice(
    safePage * PAGE_SIZE,

    (safePage + 1) * PAGE_SIZE,
  );

  //************************************************************** */

  function resetPageAndSet(setter: (value: string) => void, value: string) {
    setter(value);

    setPage(0);
  }

  //************************************************************** */

  return (
    <ReportTableShell
      title="Repair Order Transaction Log"
      count={filtered.length}
      className="lg:col-span-2"
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                resetPageAndSet(setSearch, event.target.value)
              }
              placeholder="Search RO transactions..."
              className="h-9 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              resetPageAndSet(setStatusFilter, event.target.value)
            }
            className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-700 outline-none"
          >
            <option value="all">All Statuses</option>

            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {formatReportTableValue(status)}
              </option>
            ))}
          </select>

          <select
            value={technicianFilter}
            onChange={(event) =>
              resetPageAndSet(setTechnicianFilter, event.target.value)
            }
            className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-700 outline-none"
          >
            <option value="all">All Technicians</option>

            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
              </option>
            ))}
          </select>

          <select
            value={advisorFilter}
            onChange={(event) =>
              resetPageAndSet(setAdvisorFilter, event.target.value)
            }
            className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-700 outline-none"
          >
            <option value="all">All Advisors</option>

            {serviceAdvisors.map((advisor) => (
              <option key={advisor.id} value={advisor.id}>
                {advisor.name}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {visible.length === 0 ? (
        <ReportTableEmpty>
          No repair-order transactions match the current filters.
        </ReportTableEmpty>
      ) : (
        <>
          <div className="max-h-96 overflow-auto">
            <table className="w-full min-w-[1120px] text-sm">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-zinc-200 text-xs text-zinc-400">
                  <Header>RO #</Header>

                  <Header>Date</Header>

                  <Header>Customer</Header>

                  <Header>Vehicle</Header>

                  <Header>Tech</Header>

                  <Header>Advisor</Header>

                  <Header right>Labor</Header>

                  <Header right>Parts</Header>

                  <Header right>Tax</Header>

                  <Header right>Total</Header>

                  <Header>Status</Header>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {visible.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="transition hover:bg-zinc-50"
                  >
                    <Cell className="font-mono text-xs font-semibold">
                      #{transaction.roNumber}
                    </Cell>

                    <Cell className="text-xs text-zinc-500">
                      {formatReportDateTime(transaction.createdAt)}
                    </Cell>

                    <Cell>{transaction.customerName}</Cell>

                    <Cell className="text-xs text-zinc-500">
                      {transaction.vehicle}
                    </Cell>

                    <Cell className="text-xs">
                      {transaction.technicianName ?? "—"}
                    </Cell>

                    <Cell className="text-xs">
                      {transaction.serviceAdvisorName ?? "—"}
                    </Cell>

                    <Cell right>
                      {formatReportCurrency(transaction.laborRevenue)}
                    </Cell>

                    <Cell right>
                      {formatReportCurrency(transaction.partsRevenue)}
                    </Cell>

                    <Cell right className="text-zinc-500">
                      {formatReportCurrency(transaction.tax)}
                    </Cell>

                    <Cell right className="font-semibold tabular-nums">
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

          {pageCount > 1 ? (
            <div className="mt-3 flex flex-col gap-2 border-t border-zinc-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-zinc-400">
                Showing {safePage * PAGE_SIZE + 1}–
                {Math.min(
                  (safePage + 1) * PAGE_SIZE,

                  filtered.length,
                )}{" "}
                of {filtered.length}
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage === 0}
                  onClick={() => setPage(safePage - 1)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-300 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="px-2 text-xs text-zinc-500">
                  Page {safePage + 1} of {pageCount}
                </span>

                <button
                  type="button"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage(safePage + 1)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-300 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </>
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
