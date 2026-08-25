import {
  AlertTriangle,
  Bike,
  CheckCircle2,
  Clock3,
  Package,
  Wrench,
} from "lucide-react";

//************************************************************** */

const metrics = [
  {
    label: "Open Repair Orders",
    value: "0",
    icon: Wrench,
  },
  {
    label: "Units in Shop",
    value: "0",
    icon: Bike,
  },
  {
    label: "Low Stock Alerts",
    value: "0",
    icon: AlertTriangle,
  },
  {
    label: "Completed This Month",
    value: "0",
    icon: Clock3,
  },
];

//************************************************************** */

const workflowMetrics = [
  {
    label: "Awaiting Approval",
    value: "0",
  },
  {
    label: "Waiting on Parts",
    value: "0",
  },
  {
    label: "Ready to Work",
    value: "0",
  },
  {
    label: "Ready for Pickup",
    value: "0",
  },
];

//************************************************************** */

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Welcome back. Here&apos;s what&apos;s
          happening in the shop.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    {metric.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
                    {metric.value}
                  </p>
                </div>

                <div className="grid h-10 w-10 place-items-center rounded-lg bg-orange-50 text-orange-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-zinc-500" />

          <h2 className="text-sm font-semibold text-zinc-900">
            Service workflow
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {workflowMetrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <p className="text-xs font-medium text-zinc-500">
                {metric.label}
              </p>

              <p className="mt-2 text-2xl font-bold text-zinc-900">
                {metric.value}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">
              Recent Activity
            </h2>
          </div>

          <div className="grid min-h-56 place-items-center p-8 text-center">
            <div>
              <Wrench className="mx-auto h-7 w-7 text-zinc-300" />

              <p className="mt-3 text-sm font-medium text-zinc-600">
                No recent shop activity
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                Repair orders and other activity
                will appear here.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white">
            <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-4">
              <AlertTriangle className="h-4 w-4 text-red-500" />

              <h2 className="text-sm font-semibold text-zinc-900">
                Low Stock
              </h2>
            </div>

            <div className="p-6 text-center">
              <Package className="mx-auto h-6 w-6 text-zinc-300" />

              <p className="mt-2 text-xs text-zinc-400">
                All stock levels are healthy.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white">
            <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-4">
              <Package className="h-4 w-4 text-zinc-500" />

              <h2 className="text-sm font-semibold text-zinc-900">
                Expected Deliveries
              </h2>
            </div>

            <div className="p-6 text-center">
              <p className="text-xs text-zinc-400">
                No pending deliveries.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

//************************************************************** */