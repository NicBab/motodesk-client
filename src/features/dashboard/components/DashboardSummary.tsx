import {
  AlertTriangle,
  Bike,
  CheckCircle2,
  Wrench,
} from "lucide-react";

import type {
  DashboardSummary as DashboardSummaryData,
} from "../dashboard.types";

//************************************************************** */

type DashboardSummaryProps = {
  summary: DashboardSummaryData;
};

//************************************************************** */

export function DashboardSummary({
  summary,
}: DashboardSummaryProps) {
  const metrics = [
    {
      label:
        "Open Repair Orders",

      value:
        summary.openRepairOrders,

      icon:
        Wrench,
    },

    {
      label:
        "Vehicles in Shop",

      value:
        summary.vehiclesInShop,

      icon:
        Bike,
    },

    {
      label:
        "Low Stock Alerts",

      value:
        summary.lowStockAlerts,

      icon:
        AlertTriangle,
    },

    {
      label:
        "Completed This Month",

      value:
        summary.completedThisMonth,

      icon:
        CheckCircle2,
    },
  ];

  //************************************************************** */

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(
        (metric) => {
          const Icon =
            metric.icon;

          return (
            <article
              key={
                metric.label
              }
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    {
                      metric.label
                    }
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
                    {
                      metric.value
                    }
                  </p>
                </div>

                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </article>
          );
        },
      )}
    </section>
  );
}

//************************************************************** */