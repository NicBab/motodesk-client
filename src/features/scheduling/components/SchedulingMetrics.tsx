import { AlertCircle, CalendarDays, Gauge, Wrench } from "lucide-react";

//************************************************************** */

type SchedulingMetricsProps = {
  appointments: number;

  scheduledRepairOrders: number;

  unscheduledRepairOrders: number;

  shopCapacity: number;
};

//************************************************************** */

export function SchedulingMetrics({
  appointments,
  scheduledRepairOrders,
  unscheduledRepairOrders,
  shopCapacity,
}: SchedulingMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <MetricCard
        icon={<CalendarDays className="h-5 w-5" />}
        label="Appointments Today"
        value={appointments}
        iconClassName="bg-blue-50 text-blue-600"
      />

      <MetricCard
        icon={<Wrench className="h-5 w-5" />}
        label="Scheduled ROs"
        value={scheduledRepairOrders}
        iconClassName="bg-emerald-50 text-emerald-600"
      />

      <MetricCard
        icon={<AlertCircle className="h-5 w-5" />}
        label="Unscheduled"
        value={unscheduledRepairOrders}
        iconClassName="bg-amber-50 text-amber-600"
      />

      <MetricCard
        icon={<Gauge className="h-5 w-5" />}
        label="Shop Capacity"
        value={`${shopCapacity}%`}
        iconClassName={
          shopCapacity >= 100
            ? "bg-red-50 text-red-600"
            : shopCapacity >= 85
              ? "bg-orange-50 text-orange-600"
              : "bg-violet-50 text-violet-600"
        }
      />
    </div>
  );
}

//************************************************************** */

function MetricCard({
  icon,
  label,
  value,
  iconClassName,
}: {
  icon: React.ReactNode;

  label: string;

  value: string | number;

  iconClassName: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${iconClassName}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-zinc-500">{label}</p>

          <p className="mt-0.5 text-xl font-bold tracking-tight text-zinc-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

//************************************************************** */
