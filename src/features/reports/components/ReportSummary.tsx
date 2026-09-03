import {
  BarChart3,
  Clock3,
  DollarSign,
  FileText,
  Package,
  PackageCheck,
  Percent,
  ReceiptText,
  RotateCcw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";

import type { ReportSummary } from "../report.types";

import { formatReportCurrency, formatReportNumber } from "../report.utils";

//************************************************************** */

type ReportsSummaryProps = {
  summary: ReportSummary;
};

//************************************************************** */

export function ReportsSummary({ summary }: ReportsSummaryProps) {
  return (
    <div className="space-y-6">
      <ReportMetricSection title="Financial Summary">
        <ReportMetricCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatReportCurrency(summary.totalRevenue)}
          sub="RO + net POS"
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <ReportMetricCard
          icon={ReceiptText}
          label="RO Revenue"
          value={formatReportCurrency(summary.repairOrderRevenue)}
          sub={`${summary.repairOrderCount} ${
            summary.repairOrderCount === 1 ? "RO" : "ROs"
          }`}
          iconClassName="bg-sky-50 text-sky-600"
        />

        <ReportMetricCard
          icon={ShoppingCart}
          label="POS Revenue (Gross)"
          value={formatReportCurrency(summary.grossPosRevenue)}
          sub={`${summary.posSaleCount} ${
            summary.posSaleCount === 1 ? "sale" : "sales"
          }`}
          iconClassName="bg-violet-50 text-violet-600"
        />

        <ReportMetricCard
          icon={RotateCcw}
          label="Returns"
          value={formatReportCurrency(summary.posReturnTotal)}
          sub={`${summary.posReturnCount} ${
            summary.posReturnCount === 1 ? "refund" : "refunds"
          }`}
          iconClassName="bg-orange-50 text-orange-600"
        />

        <ReportMetricCard
          icon={TrendingDown}
          label="Net POS Revenue"
          value={formatReportCurrency(summary.netPosRevenue)}
          sub={`Return rate: ${formatReportNumber(summary.posReturnRate, 1)}%`}
          iconClassName="bg-blue-50 text-blue-600"
        />

        <ReportMetricCard
          icon={Wrench}
          label="Labor Revenue"
          value={formatReportCurrency(summary.laborRevenue)}
          sub={`${formatReportNumber(summary.billedLaborHours, 1)} hrs billed`}
          iconClassName="bg-blue-50 text-blue-600"
        />

        <ReportMetricCard
          icon={Package}
          label="Parts Revenue"
          value={formatReportCurrency(summary.partsRevenue)}
          iconClassName="bg-violet-50 text-violet-600"
        />

        <ReportMetricCard
          icon={PackageCheck}
          label="Shop Supplies"
          value={formatReportCurrency(summary.shopSuppliesRevenue)}
          sub="Included in RO revenue"
          iconClassName="bg-cyan-50 text-cyan-600"
        />

        <ReportMetricCard
          icon={TrendingDown}
          label="RO Discounts"
          value={formatReportCurrency(summary.discountTotal)}
          iconClassName="bg-rose-50 text-rose-600"
        />

        <ReportMetricCard
          icon={Percent}
          label="Tax Collected"
          value={formatReportCurrency(summary.taxCollected)}
          iconClassName="bg-amber-50 text-amber-600"
        />

        <ReportMetricCard
          icon={TrendingUp}
          label="Avg RO Value"
          value={formatReportCurrency(summary.averageRepairOrderValue)}
          sub={`${summary.repairOrderCount} ${
            summary.repairOrderCount === 1 ? "RO" : "ROs"
          }`}
          iconClassName="bg-rose-50 text-rose-600"
        />

        <ReportMetricCard
          icon={Clock3}
          label="Shop Efficiency"
          value={
            summary.shopEfficiency === null
              ? "—"
              : `${formatReportNumber(summary.shopEfficiency, 0)}%`
          }
          sub={`${formatReportNumber(
            summary.billedLaborHours,
            1,
          )} RO hrs / ${formatReportNumber(
            summary.employeeClockedHours,
            1,
          )} clocked`}
          iconClassName="bg-teal-50 text-teal-600"
        />
      </ReportMetricSection>

      <ReportMetricSection title="Operational Summary">
        <ReportMetricCard
          icon={FileText}
          label="Total ROs"
          value={String(summary.repairOrderCount)}
          sub="Created in selected period"
          iconClassName="bg-zinc-100 text-zinc-700"
        />

        <ReportMetricCard
          icon={DollarSign}
          label="Units Cashiered"
          value={String(summary.cashieredCount)}
          sub="Completed cashier events"
          iconClassName="bg-amber-50 text-amber-600"
        />

        <ReportMetricCard
          icon={PackageCheck}
          label="Units Picked Up"
          value={String(summary.pickedUpCount)}
          sub="Completed pickup events"
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <ReportMetricCard
          icon={Clock3}
          label="Total Labor Hours"
          value={formatReportNumber(summary.billedLaborHours, 1)}
          sub="Billed RO hours"
          iconClassName="bg-blue-50 text-blue-600"
        />

        <ReportMetricCard
          icon={Clock3}
          label="Employee Hours"
          value={`${formatReportNumber(summary.employeeClockedHours, 1)} hrs`}
          sub="Clocked employee hours"
          iconClassName="bg-cyan-50 text-cyan-600"
        />

        <ReportMetricCard
          icon={BarChart3}
          label="Avg Hrs / RO"
          value={formatReportNumber(summary.averageLaborHoursPerRepairOrder, 1)}
          iconClassName="bg-violet-50 text-violet-600"
        />
      </ReportMetricSection>
    </div>
  );
}

//************************************************************** */

function ReportMetricSection({
  title,
  children,
}: {
  title: string;

  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {children}
      </div>
    </section>
  );
}

//************************************************************** */

type ReportMetricCardProps = {
  icon: React.ComponentType<{
    className?: string;
  }>;

  label: string;

  value: string;

  sub?: string;

  iconClassName: string;
};

//************************************************************** */

function ReportMetricCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClassName,
}: ReportMetricCardProps) {
  return (
    <article className="h-[94px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex h-full items-center gap-3 p-4">
        <div
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${iconClassName}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p
            title={value}
            className="truncate text-lg font-bold leading-tight tracking-tight text-zinc-900"
          >
            {value}
          </p>

          <p
            title={label}
            className="truncate text-xs leading-tight text-zinc-500"
          >
            {label}
          </p>

          {sub ? (
            <p
              title={sub}
              className="mt-0.5 truncate text-[10px] leading-tight text-zinc-400"
            >
              {sub}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

//************************************************************** */
