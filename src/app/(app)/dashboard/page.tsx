//************************************************************** */

"use client";

import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";

import { DashboardInventory } from "@/features/dashboard/components/DashboardInventory";

import { DashboardRecentActivity } from "@/features/dashboard/components/DashboardRecentActivity";

import { DashboardSales } from "@/features/dashboard/components/DashboardSales";

import { DashboardSummary } from "@/features/dashboard/components/DashboardSummary";

import { DashboardWorkflow } from "@/features/dashboard/components/DashboardWorkflow";

import { useGetDashboardOverviewQuery } from "@/store/api/dashboardApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

//************************************************************** */

export default function DashboardPage() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  //************************************************************** */

  const { data, error, isLoading, isFetching, refetch } =
    useGetDashboardOverviewQuery(
      {
        organizationId: organizationId ?? "",
      },
      {
        skip: !organizationId,
      },
    );

  //************************************************************** */

  if (!organizationId) {
    return (
      <DashboardMessage
        title="No organization selected"
        description="Select an organization to view its dashboard."
      />
    );
  }

  //************************************************************** */

  if (isLoading && !data) {
    return <DashboardLoading />;
  }

  //************************************************************** */

  if (error && !data) {
    return (
      <DashboardMessage
        title="Unable to load dashboard"
        description="MotoDesk could not load the dashboard data."
        action={
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        }
      />
    );
  }

  //************************************************************** */

  if (!data) {
    return null;
  }

  //************************************************************** */

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Live operational overview
          </p>
        </div>

        <button
          type="button"
          disabled={isFetching}
          onClick={() => {
            void refetch();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
          />

          {isFetching ? "Refreshing" : "Refresh"}
        </button>
      </header>

      <DashboardSummary summary={data.summary} />

      <DashboardWorkflow workflow={data.workflow} />

      <DashboardSales sales={data.salesMtd} partsDemand={data.partsDemand} />

      <DashboardInventory
        lowStockParts={data.lowStockParts}
        expectedDeliveries={data.expectedDeliveries}
      />

      <DashboardRecentActivity activity={data.recentActivity} />
    </div>
  );
}

//************************************************************** */

function DashboardLoading() {
  return (
    <div className="grid min-h-[420px] place-items-center">
      <div className="text-center">
        <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-orange-600" />

        <p className="mt-3 text-sm font-medium text-zinc-700">
          Loading dashboard
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          Retrieving current operational data...
        </p>
      </div>
    </div>
  );
}

//************************************************************** */

type DashboardMessageProps = {
  title: string;

  description: string;

  action?: React.ReactNode;
};

//************************************************************** */

function DashboardMessage({
  title,
  description,
  action,
}: DashboardMessageProps) {
  return (
    <div className="grid min-h-[420px] place-items-center">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-zinc-100 text-zinc-500">
          <AlertCircle className="h-5 w-5" />
        </div>

        <h1 className="mt-4 text-base font-semibold text-zinc-900">{title}</h1>

        <p className="mt-1 text-sm text-zinc-500">{description}</p>

        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}

//************************************************************** */
