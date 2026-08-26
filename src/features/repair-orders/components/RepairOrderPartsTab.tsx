"use client";

import { CheckCircle2, PackageCheck } from "lucide-react";

import { toast } from "sonner";

import { useCompleteRepairOrderPartsReviewMutation } from "@/store/api/repairOrdersApi";

import type { RepairOrder } from "../repair-order.types";

type RepairOrderPartsTabProps = {
  organizationId: string;
  repairOrder: RepairOrder;
};

export function RepairOrderPartsTab({
  organizationId,
  repairOrder,
}: RepairOrderPartsTabProps) {
  const [completePartsReview, { isLoading }] =
    useCompleteRepairOrderPartsReviewMutation();

  async function handleCompletePartsReview() {
    try {
      await completePartsReview({
        organizationId,
        repairOrderId: repairOrder.id,
      }).unwrap();

      toast.success("Parts review completed.");
    } catch {
      toast.error("MotoDesk could not complete the parts review.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-600">
            <PackageCheck className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Parts review
            </h3>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Review the parts required for this repair order before work can
              proceed.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <InfoCard
            label="Current status"
            value={formatLabel(repairOrder.status)}
          />

          <InfoCard label="Vehicle" value={getVehicleName(repairOrder)} />
        </div>
      </section>

      {repairOrder.status === "PARTS_REVIEW" ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Complete review
            </h3>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              When all required parts have been reviewed, complete the
              parts-review stage. The server will determine the correct next
              repair-order status.
            </p>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => void handleCompletePartsReview()}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />

            {isLoading ? "Completing..." : "Complete parts review"}
          </button>
        </section>
      ) : (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs text-zinc-500">
            Parts review is not currently actionable for this repair-order
            status.
          </p>
        </section>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-zinc-900">{value}</p>
    </article>
  );
}

function getVehicleName(repairOrder: RepairOrder): string {
  return [
    repairOrder.vehicle.year,
    repairOrder.vehicle.make,
    repairOrder.vehicle.model,
    repairOrder.vehicle.trim,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
