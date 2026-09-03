import type { ReportRevenueTrendPoint } from "../report.types";

import { formatReportCurrency } from "../report.utils";

//************************************************************** */

type RevenueTrendChartProps = {
  data: ReportRevenueTrendPoint[];
};

//************************************************************** */

const CHART_HEIGHT = 220;

const CHART_TOP = 14;

const CHART_BOTTOM = 34;

const CHART_LEFT = 58;

const CHART_RIGHT = 16;

//************************************************************** */

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const hasRevenue = data.some(
    (point) => point.repairOrderRevenue !== 0 || point.posRevenue !== 0,
  );

  if (!hasRevenue) {
    return <ChartEmptyState>No revenue data for this period.</ChartEmptyState>;
  }

  const maxValue = Math.max(
    1,

    ...data.flatMap((point) => [
      Math.abs(point.repairOrderRevenue),

      Math.abs(point.posRevenue),
    ]),
  );

  const plotHeight = CHART_HEIGHT - CHART_TOP - CHART_BOTTOM;

  const chartWidth = Math.max(
    520,

    data.length * 90 + CHART_LEFT + CHART_RIGHT,
  );

  const plotWidth = chartWidth - CHART_LEFT - CHART_RIGHT;

  const bucketWidth = plotWidth / Math.max(1, data.length);

  const barWidth = Math.min(24, bucketWidth * 0.28);

  const ticks = createValueTicks(maxValue);

  //************************************************************** */

  return (
    <div className="overflow-x-auto">
      <svg
        role="img"
        aria-label="Revenue trend showing repair order and POS revenue"
        viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
        className="h-[220px] min-w-[520px] w-full"
      >
        {/* Grid + Y Axis */}

        {ticks.map((tick) => {
          const y = CHART_TOP + plotHeight - (tick / maxValue) * plotHeight;

          return (
            <g key={tick}>
              <line
                x1={CHART_LEFT}
                y1={y}
                x2={chartWidth - CHART_RIGHT}
                y2={y}
                stroke="currentColor"
                className="text-zinc-200"
                strokeDasharray="4 4"
              />

              <text
                x={CHART_LEFT - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-zinc-400 text-[10px]"
              >
                {formatAxisCurrency(tick)}
              </text>
            </g>
          );
        })}

        {/* Bars */}

        {data.map((point, index) => {
          const centerX = CHART_LEFT + bucketWidth * index + bucketWidth / 2;

          const roHeight =
            (Math.max(0, point.repairOrderRevenue) / maxValue) * plotHeight;

          const posHeight =
            (Math.max(0, point.posRevenue) / maxValue) * plotHeight;

          const roX = centerX - barWidth - 2;

          const posX = centerX + 2;

          return (
            <g key={`${point.label}-${index}`}>
              <rect
                x={roX}
                y={CHART_TOP + plotHeight - roHeight}
                width={barWidth}
                height={roHeight}
                rx={3}
                className="fill-orange-500"
              >
                <title>
                  {`${point.label} · RO Revenue: ${formatReportCurrency(
                    point.repairOrderRevenue,
                  )}`}
                </title>
              </rect>

              <rect
                x={posX}
                y={CHART_TOP + plotHeight - posHeight}
                width={barWidth}
                height={posHeight}
                rx={3}
                className="fill-sky-500"
              >
                <title>
                  {`${point.label} · POS Revenue: ${formatReportCurrency(
                    point.posRevenue,
                  )}`}
                </title>
              </rect>

              <text
                x={centerX}
                y={CHART_HEIGHT - 11}
                textAnchor="middle"
                className="fill-zinc-500 text-[10px] font-medium"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap justify-center gap-5 text-xs text-zinc-500">
        <Legend className="bg-orange-500" label="RO Revenue" />

        <Legend className="bg-sky-500" label="Net POS Revenue" />
      </div>
    </div>
  );
}

//************************************************************** */

function createValueTicks(maxValue: number): number[] {
  return [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue];
}

//************************************************************** */

function formatAxisCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}m`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  }

  return `$${Math.round(value)}`;
}

//************************************************************** */

function Legend({
  className,
  label,
}: {
  className: string;

  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${className}`} />

      {label}
    </span>
  );
}

//************************************************************** */

function ChartEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-[220px] place-items-center text-center">
      <p className="text-sm text-zinc-400">{children}</p>
    </div>
  );
}

//************************************************************** */
