import type {
  ReportCashieredRepairOrder,
  ReportPickedUpRepairOrder,
} from "../report.types";

import { formatReportCurrency, formatReportDateTime } from "../report.utils";

import {
  ReportStatusBadge,
  ReportTableEmpty,
  ReportTableShell,
} from "./ReportTableShell";

//************************************************************** */

type ReportActivityTablesProps = {
  cashiered: ReportCashieredRepairOrder[];

  pickedUp: ReportPickedUpRepairOrder[];
};

//************************************************************** */

export function ReportActivityTables({
  cashiered,
  pickedUp,
}: ReportActivityTablesProps) {
  return (
    <>
      <ReportTableShell
        title="Units Cashiered"
        count={cashiered.length}
        className="lg:col-span-2"
      >
        {cashiered.length === 0 ? (
          <ReportTableEmpty>
            No cashiered units in this period.
          </ReportTableEmpty>
        ) : (
          <div className="max-h-72 overflow-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-zinc-200 text-xs text-zinc-400">
                  <Header>RO #</Header>

                  <Header>Customer</Header>

                  <Header>Vehicle</Header>

                  <Header>Cashiered At</Header>

                  <Header>Cashier</Header>

                  <Header align="right">Invoice Total</Header>

                  <Header>Payment Status</Header>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {cashiered.map((row) => (
                  <tr key={row.id} className="transition hover:bg-zinc-50">
                    <Cell className="font-mono text-xs font-semibold text-zinc-800">
                      #{row.roNumber}
                    </Cell>

                    <Cell>{row.customerName}</Cell>

                    <Cell className="text-xs text-zinc-500">{row.vehicle}</Cell>

                    <Cell className="text-xs text-zinc-500">
                      {formatReportDateTime(row.cashieredAt)}
                    </Cell>

                    <Cell className="text-xs">{row.cashierName ?? "—"}</Cell>

                    <Cell align="right" className="font-semibold tabular-nums">
                      {formatReportCurrency(row.invoiceTotal)}
                    </Cell>

                    <Cell>
                      <ReportStatusBadge value={row.cashierStatus} />
                    </Cell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportTableShell>

      <ReportTableShell
        title="Units Picked Up"
        count={pickedUp.length}
        className="lg:col-span-2"
      >
        {pickedUp.length === 0 ? (
          <ReportTableEmpty>No pickups in this period.</ReportTableEmpty>
        ) : (
          <div className="max-h-72 overflow-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-zinc-200 text-xs text-zinc-400">
                  <Header>RO #</Header>

                  <Header>Customer</Header>

                  <Header>Vehicle</Header>

                  <Header>Picked Up At</Header>

                  <Header>Released By</Header>

                  <Header>Picked Up By</Header>

                  <Header>Cashier Status</Header>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {pickedUp.map((row) => (
                  <tr key={row.id} className="transition hover:bg-zinc-50">
                    <Cell className="font-mono text-xs font-semibold text-zinc-800">
                      #{row.roNumber}
                    </Cell>

                    <Cell>{row.customerName}</Cell>

                    <Cell className="text-xs text-zinc-500">{row.vehicle}</Cell>

                    <Cell className="text-xs text-zinc-500">
                      {formatReportDateTime(row.pickedUpAt)}
                    </Cell>

                    <Cell className="text-xs">{row.releasedBy ?? "—"}</Cell>

                    <Cell className="text-xs">
                      {row.pickupRecipient ?? "—"}
                    </Cell>

                    <Cell>
                      <ReportStatusBadge value={row.cashierStatus} />
                    </Cell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportTableShell>
    </>
  );
}

//************************************************************** */

function Header({
  children,
  align = "left",
}: {
  children: React.ReactNode;

  align?: "left" | "right";
}) {
  return (
    <th
      className={`whitespace-nowrap px-3 py-2 font-medium ${
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
  className = "",
}: {
  children: React.ReactNode;

  align?: "left" | "right";

  className?: string;
}) {
  return (
    <td
      className={`whitespace-nowrap px-3 py-2 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}

//************************************************************** */
