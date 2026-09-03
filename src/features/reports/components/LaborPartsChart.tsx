import type { ReportLaborPartsBreakdown } from "../report.types";

import { formatReportCurrency, formatReportNumber } from "../report.utils";

//************************************************************** */

type LaborPartsChartProps = {
  data: ReportLaborPartsBreakdown;
};

//************************************************************** */

const RADIUS = 72;

const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

//************************************************************** */

export function LaborPartsChart({ data }: LaborPartsChartProps) {
  const total = data.laborRevenue + data.partsRevenue;

  if (total <= 0) {
    return (
      <div className="grid h-[260px] place-items-center text-center">
        <p className="text-sm text-zinc-400">
          No labor or parts revenue for this period.
        </p>
      </div>
    );
  }

  const laborPercent = (data.laborRevenue / total) * 100;

  const partsPercent = 100 - laborPercent;

  const laborDash = (laborPercent / 100) * CIRCUMFERENCE;

  const partsDash = CIRCUMFERENCE - laborDash;

  //************************************************************** */

  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center">
      <div className="relative h-44 w-44">
        <svg
          role="img"
          aria-label="Labor versus parts revenue"
          viewBox="0 0 176 176"
          className="h-full w-full -rotate-90"
        >
          <circle
            cx="88"
            cy="88"
            r={RADIUS}
            fill="none"
            strokeWidth="22"
            className="stroke-zinc-100"
          />

          <circle
            cx="88"
            cy="88"
            r={RADIUS}
            fill="none"
            strokeWidth="22"
            strokeDasharray={`${laborDash} ${partsDash}`}
            strokeDashoffset="0"
            strokeLinecap="butt"
            className="stroke-orange-500"
          >
            <title>{`Labor: ${formatReportCurrency(data.laborRevenue)}`}</title>
          </circle>

          <circle
            cx="88"
            cy="88"
            r={RADIUS}
            fill="none"
            strokeWidth="22"
            strokeDasharray={`${partsDash} ${laborDash}`}
            strokeDashoffset={-laborDash}
            strokeLinecap="butt"
            className="stroke-sky-500"
          >
            <title>{`Parts: ${formatReportCurrency(data.partsRevenue)}`}</title>
          </circle>
        </svg>

        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Total
            </p>

            <p className="mt-0.5 text-lg font-bold tracking-tight text-zinc-900">
              {formatCompactCurrency(total)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid w-full grid-cols-2 gap-3">
        <RevenueLegend
          colorClassName="bg-orange-500"
          label="Labor"
          value={data.laborRevenue}
          percent={laborPercent}
        />

        <RevenueLegend
          colorClassName="bg-sky-500"
          label="Parts"
          value={data.partsRevenue}
          percent={partsPercent}
        />
      </div>
    </div>
  );
}

//************************************************************** */

function RevenueLegend({
  colorClassName,
  label,
  value,
  percent,
}: {
  colorClassName: string;

  label: string;

  value: number;

  percent: number;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${colorClassName}`} />

        <span className="text-xs font-semibold text-zinc-600">{label}</span>
      </div>

      <p className="mt-1 truncate text-sm font-bold text-zinc-900">
        {formatReportCurrency(value)}
      </p>

      <p className="text-[10px] text-zinc-400">
        {formatReportNumber(percent, 1)}%
      </p>
    </div>
  );
}

//************************************************************** */

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}m`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}k`;
  }

  return formatReportCurrency(value);
}

//************************************************************** */
