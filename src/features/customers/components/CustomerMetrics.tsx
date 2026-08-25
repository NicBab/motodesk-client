"use client";

import {
  Building2,
  UserRound,
} from "lucide-react";

import {
  useGetCustomersQuery,
} from "@/store/api/customersApi";

//************************************************************** */

type CustomerMetricsProps = {
  organizationId: string | null;
};

//************************************************************** */

export function CustomerMetrics({
  organizationId,
}: CustomerMetricsProps) {
  const {
    data: customers = [],
    isLoading,
  } = useGetCustomersQuery(
    {
      organizationId:
        organizationId ?? "",
      isActive: true,
    },
    {
      skip: !organizationId,
    },
  );

  const activeCount =
    customers.length;

  const individualCount =
    customers.filter(
      (customer) =>
        customer.type ===
        "INDIVIDUAL",
    ).length;

  const businessCount =
    customers.filter(
      (customer) =>
        customer.type ===
        "BUSINESS",
    ).length;

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <MetricCard
        label="Active customers"
        value={
          isLoading
            ? "—"
            : activeCount
        }
        icon={UserRound}
      />

      <MetricCard
        label="Individuals"
        value={
          isLoading
            ? "—"
            : individualCount
        }
        icon={UserRound}
      />

      <MetricCard
        label="Businesses"
        value={
          isLoading
            ? "—"
            : businessCount
        }
        icon={Building2}
      />
    </section>
  );
}

//************************************************************** */

type MetricCardProps = {
  label: string;
  value: number | string;
  icon: typeof UserRound;
};

//************************************************************** */

function MetricCard({
  label,
  value,
  icon: Icon,
}: MetricCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
            {value}
          </p>
        </div>

        <div className="grid h-9 w-9 place-items-center rounded-lg bg-orange-50 text-orange-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </article>
  );
}

//************************************************************** */