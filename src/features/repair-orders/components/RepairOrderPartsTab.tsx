"use client";

import {
  CheckCircle2,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  useCompleteRepairOrderPartsReviewMutation,
  useGetRepairOrderPartLinesQuery,
} from "@/store/api/repairOrdersApi";

import type {
  RepairOrder,
} from "../repair-order.types";

import {
  RepairOrderPartLineForm,
} from "./RepairOrderPartLineForm";

import {
  RepairOrderPartLineList,
} from "./RepairOrderPartLineList";

type RepairOrderPartsTabProps = {
  organizationId: string;
  repairOrder: RepairOrder;
};

export function RepairOrderPartsTab({
  organizationId,
  repairOrder,
}: RepairOrderPartsTabProps) {
  const {
    data: partLines = [],
    isLoading:
      isLoadingPartLines,
    isError:
      isPartLinesError,
  } =
    useGetRepairOrderPartLinesQuery({
      organizationId,
      repairOrderId:
        repairOrder.id,
    });

  const [
    completePartsReview,
    {
      isLoading:
        isCompletingPartsReview,
    },
  ] =
    useCompleteRepairOrderPartsReviewMutation();

  async function handleCompletePartsReview() {
    try {
      await completePartsReview({
        organizationId,
        repairOrderId:
          repairOrder.id,
      }).unwrap();

      toast.success(
        "Parts review completed.",
      );
    } catch {
      toast.error(
        "MotoDesk could not complete parts review.",
      );
    }
  }

  return (
    <div className="space-y-5">
      <RepairOrderPartLineForm
        organizationId={
          organizationId
        }
        repairOrderId={
          repairOrder.id
        }
      />

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Repair order parts
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
              {partLines.length} part
              {partLines.length === 1
                ? ""
                : "s"}
            </p>
          </div>
        </div>

        {isLoadingPartLines ? (
          <Message>
            Loading parts...
          </Message>
        ) : isPartLinesError ? (
          <Message error>
            MotoDesk could not load repair-order parts.
          </Message>
        ) : partLines.length ===
          0 ? (
          <Message>
            No parts have been added.
          </Message>
        ) : (
          <RepairOrderPartLineList
            organizationId={
              organizationId
            }
            repairOrderId={
              repairOrder.id
            }
            partLines={
              partLines
            }
          />
        )}
      </section>

      {repairOrder.status ===
      "PARTS_REVIEW" ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-zinc-900">
            Complete parts review
          </h3>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
            Complete review once all
            required parts have been
            resolved. MotoDesk will
            determine whether this RO can
            proceed or must wait for
            parts.
          </p>

          <button
            type="button"
            disabled={
              isCompletingPartsReview
            }
            onClick={() =>
              void handleCompletePartsReview()
            }
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />

            {isCompletingPartsReview
              ? "Completing..."
              : "Complete parts review"}
          </button>
        </section>
      ) : null}
    </div>
  );
}

function Message({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`grid min-h-40 place-items-center p-6 text-sm ${
        error
          ? "text-red-600"
          : "text-zinc-500"
      }`}
    >
      {children}
    </div>
  );
}