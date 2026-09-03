import type {
  ReportLaborPartsBreakdown,
  ReportRevenueTrendPoint,
  ReportStatusDistributionItem,
} from "../report.types";

import { LaborPartsChart } from "./LaborPartsChart";

import { RevenueTrendChart } from "./RevenueTrendChart";

import { StatusDistributionChart } from "./StatusDistributionChart";

//************************************************************** */

type ReportsChartsProps = {
  revenueTrend: ReportRevenueTrendPoint[];

  laborPartsBreakdown: ReportLaborPartsBreakdown;

  statusDistribution: ReportStatusDistributionItem[];
};

//************************************************************** */

export function ReportChart({
  revenueTrend,
  laborPartsBreakdown,
  statusDistribution,
}: ReportsChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <ChartCard title="Revenue Trend" className="lg:col-span-2">
        <RevenueTrendChart data={revenueTrend} />
      </ChartCard>

      <ChartCard title="Labor vs Parts Revenue">
        <LaborPartsChart data={laborPartsBreakdown} />
      </ChartCard>

      <ChartCard title="RO Status Distribution" className="lg:col-span-3">
        <StatusDistributionChart data={statusDistribution} />
      </ChartCard>
    </div>
  );
}

//************************************************************** */

function ChartCard({
  title,
  className = "",
  children,
}: {
  title: string;

  className?: string;

  children: React.ReactNode;
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm ${className}`}
    >
      <header className="border-b border-zinc-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-800">{title}</h2>
      </header>

      <div className="p-5">{children}</div>
    </section>
  );
}

//************************************************************** */
