import {
  AlertTriangle,
  PackageSearch,
  ReceiptText,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import type {
  DashboardPartsDemandSummary,
  DashboardSalesSummary,
} from "../dashboard.types";

//************************************************************** */

type DashboardSalesProps = {
  sales: DashboardSalesSummary;

  partsDemand: DashboardPartsDemandSummary;
};

//************************************************************** */

export function DashboardSales({ sales, partsDemand }: DashboardSalesProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <header className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            Sales This Month
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Month-to-date sales performance
          </p>
        </header>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3">
          <Metric
            label="Gross Sales"
            value={formatCurrency(sales.grossSales)}
            icon={ShoppingCart}
          />

          <Metric
            label="Returns"
            value={formatCurrency(sales.returnsTotal)}
            icon={RotateCcw}
          />

          <Metric
            label="Net Sales"
            value={formatCurrency(sales.netSales)}
            icon={TrendingUp}
          />

          <Metric
            label="Average Sale"
            value={formatCurrency(sales.averageSale)}
            icon={ReceiptText}
          />

          <Metric
            label="Sales"
            value={formatNumber(sales.saleCount)}
            icon={ShoppingCart}
          />

          <Metric
            label="Return Rate"
            value={`${formatNumber(sales.returnRate, 1)}%`}
            icon={RotateCcw}
          />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <header className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-900">Parts Demand</h2>

          <p className="mt-1 text-xs text-zinc-500">
            Purchasing attention required
          </p>
        </header>

        <div className="divide-y divide-zinc-200">
          <DemandRow
            label="To Be Ordered"
            description="RO part lines awaiting purchase"
            value={partsDemand.toBeOrdered}
            icon={PackageSearch}
          />

          <DemandRow
            label="Backordered"
            description="RO part lines currently backordered"
            value={partsDemand.backordered}
            icon={AlertTriangle}
          />
        </div>
      </section>
    </div>
  );
}

//************************************************************** */

type MetricProps = {
  label: string;

  value: string;

  icon: typeof ShoppingCart;
};

//************************************************************** */

function Metric({ label, value, icon: Icon }: MetricProps) {
  return (
    <div className="border-b border-zinc-200 p-5 last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(3n)]:border-r-0 xl:[&:nth-last-child(-n+3)]:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-500">{label}</p>

          <p className="mt-2 truncate text-xl font-bold tracking-tight text-zinc-900">
            {value}
          </p>
        </div>

        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

//************************************************************** */

type DemandRowProps = {
  label: string;

  description: string;

  value: number;

  icon: typeof PackageSearch;
};

//************************************************************** */

function DemandRow({ label, description, value, icon: Icon }: DemandRowProps) {
  return (
    <div className="flex items-center gap-4 p-5">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-600">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-900">{label}</p>

        <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
      </div>

      <span className="text-2xl font-bold tracking-tight text-zinc-900">
        {value}
      </span>
    </div>
  );
}

//************************************************************** */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

//************************************************************** */

function formatNumber(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

//************************************************************** */
