import type {
  ReportTechnicianPerformance,
  ReportTopCustomer,
  ReportTopPart,
} from "../report.types";

import { formatReportCurrency, formatReportNumber } from "../report.utils";

import { ReportTableEmpty, ReportTableShell } from "./ReportTableShell";

//************************************************************** */

type ReportLeaderboardsProps = {
  technicians: ReportTechnicianPerformance[];

  customers: ReportTopCustomer[];

  parts: ReportTopPart[];
};

//************************************************************** */

export function ReportLeaderboards({
  technicians,
  customers,
  parts,
}: ReportLeaderboardsProps) {
  return (
    <>
      <ReportTableShell
        title="Technician Performance"
        className="lg:col-span-2"
      >
        {technicians.length === 0 ? (
          <ReportTableEmpty>
            No technician performance data for this period.
          </ReportTableEmpty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs text-zinc-400">
                  <Header>Technician</Header>

                  <Header right>ROs</Header>

                  <Header right>RO Hrs</Header>

                  <Header right>Clocked Hrs</Header>

                  <Header right>Efficiency</Header>

                  <Header right>Labor Rev</Header>

                  <Header right>Total Rev</Header>

                  <Header right>Avg Ticket</Header>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {technicians.map((technician) => (
                  <tr key={technician.membershipId}>
                    <Cell className="font-medium text-zinc-800">
                      {technician.name}
                    </Cell>

                    <Cell right>{technician.repairOrderCount}</Cell>

                    <Cell right>
                      {formatReportNumber(technician.billedHours, 1)}
                    </Cell>

                    <Cell right>
                      {technician.clockedHours > 0
                        ? formatReportNumber(technician.clockedHours, 1)
                        : "—"}
                    </Cell>

                    <Cell
                      right
                      className={getEfficiencyClassName(technician.efficiency)}
                    >
                      {technician.efficiency === null
                        ? "—"
                        : `${formatReportNumber(technician.efficiency, 0)}%`}
                    </Cell>

                    <Cell right>
                      {formatReportCurrency(technician.laborRevenue)}
                    </Cell>

                    <Cell right className="font-semibold text-zinc-800">
                      {formatReportCurrency(technician.totalRevenue)}
                    </Cell>

                    <Cell right className="text-zinc-500">
                      {formatReportCurrency(technician.averageTicket)}
                    </Cell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportTableShell>

      <ReportTableShell title="Top 5 Customers by Revenue">
        {customers.length === 0 ? (
          <ReportTableEmpty>
            No customer revenue data for this period.
          </ReportTableEmpty>
        ) : (
          <div className="divide-y divide-zinc-100">
            {customers.map((customer, index) => (
              <div
                key={customer.customerId}
                className="flex items-center gap-3 py-3"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange-50 text-xs font-bold text-orange-600">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-800">
                    {customer.name}
                  </p>

                  <p className="text-xs text-zinc-400">
                    {customer.repairOrderCount}{" "}
                    {customer.repairOrderCount === 1 ? "RO" : "ROs"}
                  </p>
                </div>

                <span className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
                  {formatReportCurrency(customer.revenue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </ReportTableShell>

      <ReportTableShell title="Top 5 Parts Sold">
        {parts.length === 0 ? (
          <ReportTableEmpty>No parts sold in this period.</ReportTableEmpty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs text-zinc-400">
                  <Header>Part #</Header>

                  <Header>Description</Header>

                  <Header right>Qty</Header>

                  <Header right>Revenue</Header>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {parts.map((part) => (
                  <tr
                    key={
                      part.partId ?? `${part.partNumber}-${part.description}`
                    }
                  >
                    <Cell className="font-mono text-xs">{part.partNumber}</Cell>

                    <Cell className="max-w-52 truncate">
                      {part.description}
                    </Cell>

                    <Cell right>{part.quantity}</Cell>

                    <Cell right className="font-semibold">
                      {formatReportCurrency(part.revenue)}
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
      className={`px-3 py-2 ${right ? "text-right" : "text-left"} ${className}`}
    >
      {children}
    </td>
  );
}

//************************************************************** */

function getEfficiencyClassName(efficiency: number | null): string {
  if (efficiency === null) {
    return "text-zinc-400";
  }

  if (efficiency >= 100) {
    return "font-semibold text-emerald-600";
  }

  if (efficiency >= 80) {
    return "font-semibold text-amber-600";
  }

  return "font-semibold text-red-600";
}

//************************************************************** */
