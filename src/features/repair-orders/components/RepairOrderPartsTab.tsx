"use client";

import { CheckCircle2 } from "lucide-react";

import { toast } from "sonner";

import { useCompleteRepairOrderPartsReviewMutation } from "@/store/api/repairOrdersApi";

import type { RepairOrder } from "../repair-order.types";

import { RepairOrderPartLineForm } from "./RepairOrderPartLineForm";

import { RepairOrderPartLineList } from "./RepairOrderPartLineList";

import { useGetRepairOrderPartLinesQuery } from "@/store/api/repairOrdersApi";

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

  const {
    data: partLines = [],
    isLoading: isLoadingPartLines,
    isError: isPartLinesError,
  } = useGetRepairOrderPartLinesQuery({
    organizationId,
    repairOrderId: repairOrder.id,
  });

  return (
    <div className="space-y-5">
      <RepairOrderPartLineForm
        organizationId={organizationId}
        repairOrderId={repairOrder.id}
      />

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              REPAIR ORDER PARTS
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
              Manage required parts from review through installation.
            </p>
          </div>

          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
            {partLines.length}
          </span>
        </div>

        {isLoadingPartLines ? (
          <div className="grid min-h-40 place-items-center p-6 text-sm text-zinc-500">
            Loading parts...
          </div>
        ) : isPartLinesError ? (
          <div className="grid min-h-40 place-items-center p-6 text-sm text-red-600">
            MotoDesk could not load repair-order parts.
          </div>
        ) : partLines.length === 0 ? (
          <div className="grid min-h-40 place-items-center p-6 text-sm text-zinc-500">
            No parts have been added.
          </div>
        ) : (
          <RepairOrderPartLineList
            organizationId={organizationId}
            repairOrderId={repairOrder.id}
            partLines={partLines}
          />
        )}
      </section>

      {repairOrder.status === "PARTS_REVIEW" ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-zinc-900">
            Complete parts review
          </h3>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Complete the review once every required part has been resolved.
            MotoDesk will determine whether the repair order is ready for work
            or must wait on parts.
          </p>

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
      ) : null}
    </div>
  );
}
