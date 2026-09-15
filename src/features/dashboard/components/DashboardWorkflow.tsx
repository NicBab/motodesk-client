import { CheckCircle2, Clock3, PackageSearch, Wrench } from "lucide-react";

import type { DashboardWorkflowSummary } from "../dashboard.types";

//************************************************************** */

type DashboardWorkflowProps = {
  workflow: DashboardWorkflowSummary;
};

//************************************************************** */

export function DashboardWorkflow({ workflow }: DashboardWorkflowProps) {
  const stages = [
    {
      label: "Awaiting Approval",

      value: workflow.awaitingApproval,

      icon: Clock3,
    },

    {
      label: "Waiting on Parts",

      value: workflow.waitingOnParts,

      icon: PackageSearch,
    },

    {
      label: "Ready to Work",

      value: workflow.readyToWork,

      icon: Wrench,
    },

    {
      label: "Ready for Pickup",

      value: workflow.readyForPickup,

      icon: CheckCircle2,
    },
  ];

  //************************************************************** */

  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Repair Order Workflow
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Current repair orders by workflow stage
          </p>
        </div>
      </div>

      <div className="grid divide-y divide-zinc-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {stages.map((stage) => {
          const Icon = stage.icon;

          return (
            <div key={stage.label} className="p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-600">
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-2xl font-bold tracking-tight text-zinc-900">
                    {stage.value}
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-zinc-500">
                    {stage.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

//************************************************************** */
