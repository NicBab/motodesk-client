import type { ReportStatusDistributionItem } from "../report.types";

import { formatReportStatus } from "../report.utils";

//************************************************************** */

type StatusDistributionChartProps = {
  data: ReportStatusDistributionItem[];
};

//************************************************************** */

export function StatusDistributionChart({
  data,
}: StatusDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="grid min-h-[190px] place-items-center text-center">
        <p className="text-sm text-zinc-400">
          No repair-order status data for this period.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(
    1,

    ...data.map((item) => item.count),
  );

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-3 py-1">
      {data.map((item) => {
        const width = (item.count / maxCount) * 100;

        const percent = total > 0 ? (item.count / total) * 100 : 0;

        return (
          <div
            key={item.status}
            className="grid gap-2 sm:grid-cols-[170px_minmax(0,1fr)_75px]"
          >
            <div className="flex min-w-0 items-center justify-between gap-2 sm:block">
              <p className="truncate text-xs font-semibold text-zinc-700">
                {formatReportStatus(item.status)}
              </p>

              <p className="shrink-0 text-[10px] text-zinc-400 sm:mt-0.5">
                {percent.toFixed(1)}%
              </p>
            </div>

            <div className="flex h-7 items-center overflow-hidden rounded-md bg-zinc-100">
              <div
                title={`${formatReportStatus(item.status)}: ${item.count}`}
                className={`h-full min-w-1 rounded-md ${getStatusColorClassName(
                  item.status,
                )}`}
                style={{
                  width: `${width}%`,
                }}
              />
            </div>

            <div className="hidden items-center justify-end sm:flex">
              <span className="text-sm font-bold tabular-nums text-zinc-800">
                {item.count}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

//************************************************************** */

function getStatusColorClassName(status: string): string {
  switch (status) {
    case "ESTIMATE":
      return "bg-blue-500";

    case "AWAITING_APPROVAL":
      return "bg-violet-500";

    case "APPROVED":
      return "bg-indigo-500";

    case "WAITING_ON_PARTS":
      return "bg-red-500";

    case "PARTS_DELIVERED":
      return "bg-cyan-500";

    case "READY_TO_WORK":
      return "bg-emerald-500";

    case "IN_PROGRESS":
      return "bg-amber-500";

    case "WORK_COMPLETED":
    case "COMPLETED":
      return "bg-green-500";

    case "READY_FOR_PICKUP":
      return "bg-teal-500";

    case "CASHIERED":
      return "bg-orange-500";

    case "PICKED_UP":
      return "bg-zinc-500";

    case "CANCELLED":
      return "bg-zinc-400";

    default:
      return "bg-slate-500";
  }
}

//************************************************************** */
