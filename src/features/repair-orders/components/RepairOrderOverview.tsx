"use client";

import { CheckCircle2, Clock3, PackageCheck, Send } from "lucide-react";

import { toast } from "sonner";

import type { RepairOrder } from "../repair-order.types";

import {
  useCompleteRepairOrderPartsReviewMutation,
  useRequestRepairOrderApprovalMutation,
  useUpdateRepairOrderStatusMutation,
} from "@/store/api/repairOrdersApi";

type RepairOrderOverviewProps = {
  organizationId: string;
  repairOrder: RepairOrder;
};

export function RepairOrderOverview({
  organizationId,
  repairOrder,
}: RepairOrderOverviewProps) {
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateRepairOrderStatusMutation();

  const [requestApproval, { isLoading: isRequestingApproval }] =
    useRequestRepairOrderApprovalMutation();

  const [completePartsReview, { isLoading: isCompletingPartsReview }] =
    useCompleteRepairOrderPartsReviewMutation();

  const actionDisabled =
    isUpdatingStatus || isRequestingApproval || isCompletingPartsReview;

  async function handleRequestApproval() {
    try {
      await requestApproval({
        organizationId,
        repairOrderId: repairOrder.id,
      }).unwrap();

      toast.success("Customer approval requested.");
    } catch {
      toast.error("MotoDesk could not request customer approval.");
    }
  }

  async function handleCompletePartsReview() {
    try {
      await completePartsReview({
        organizationId,
        repairOrderId: repairOrder.id,
      }).unwrap();

      toast.success("Parts review completed.");
    } catch {
      toast.error("MotoDesk could not complete parts review.");
    }
  }

  async function handleStatusChange(
    status: RepairOrder["status"],
    successMessage: string,
  ) {
    try {
      await updateStatus({
        organizationId,
        repairOrderId: repairOrder.id,
        status,
      }).unwrap();

      toast.success(successMessage);
    } catch {
      toast.error("MotoDesk could not update the repair order status.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard label="Status" value={formatLabel(repairOrder.status)} />

        <OverviewCard
          label="Priority"
          value={formatLabel(repairOrder.priority)}
        />

        <OverviewCard label="Customer" value={getCustomerName(repairOrder)} />

        <OverviewCard label="Vehicle" value={getVehicleName(repairOrder)} />
      </section>

      <LifecycleActions
        repairOrder={repairOrder}
        disabled={actionDisabled}
        onRequestApproval={handleRequestApproval}
        onCompletePartsReview={handleCompletePartsReview}
        onStatusChange={handleStatusChange}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <InfoCard
          title="Customer complaint"
          value={repairOrder.complaint || "No customer complaint recorded."}
        />

        <InfoCard
          title="Internal notes"
          value={repairOrder.notes || "No internal notes recorded."}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          label="Scheduled"
          value={
            repairOrder.scheduledDate
              ? formatDate(repairOrder.scheduledDate)
              : "—"
          }
        />

        <OverviewCard
          label="Promised"
          value={
            repairOrder.promisedDate
              ? formatDate(repairOrder.promisedDate)
              : "—"
          }
        />

        <OverviewCard
          label="Remaining Balance"
          value={formatCurrency(repairOrder.remainingBalance)}
        />

        <OverviewCard
          label="Pickup"
          value={formatLabel(repairOrder.pickupStatus)}
        />
      </section>
    </div>
  );
}

type LifecycleActionsProps = {
  repairOrder: RepairOrder;
  disabled: boolean;

  onRequestApproval: () => Promise<void>;

  onCompletePartsReview: () => Promise<void>;

  onStatusChange: (
    status: RepairOrder["status"],
    successMessage: string,
  ) => Promise<void>;
};

function LifecycleActions({
  repairOrder,
  disabled,
  onRequestApproval,
  onCompletePartsReview,
  onStatusChange,
}: LifecycleActionsProps) {
  const status = repairOrder.status;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-zinc-900">
          Lifecycle actions
        </h3>

        <p className="text-xs text-zinc-500">
          Available actions are based on the current repair-order status.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {status === "ESTIMATE" ? (
          <ActionButton
            icon={Send}
            label="Request approval"
            disabled={disabled}
            onClick={() => void onRequestApproval()}
          />
        ) : null}

        {status === "APPROVED" ? (
          <ActionButton
            icon={PackageCheck}
            label="Complete parts review"
            disabled={disabled}
            onClick={() => void onCompletePartsReview()}
          />
        ) : null}

        {status === "READY_TO_WORK" ? (
          <ActionButton
            icon={Clock3}
            label="Start work"
            disabled={disabled}
            onClick={() =>
              void onStatusChange(
                "IN_PROGRESS",
                "Repair order moved to In Progress.",
              )
            }
          />
        ) : null}

        {status === "IN_PROGRESS" ? (
          <ActionButton
            icon={CheckCircle2}
            label="Mark work complete"
            disabled={disabled}
            onClick={() =>
              void onStatusChange(
                "WORK_COMPLETE",
                "Repair order marked Work Complete.",
              )
            }
          />
        ) : null}

        {status === "WORK_COMPLETE" ? (
          <ActionButton
            icon={CheckCircle2}
            label="Begin quality check"
            disabled={disabled}
            onClick={() =>
              void onStatusChange("QUALITY_CHECK", "Quality check started.")
            }
          />
        ) : null}

        {![
          "ESTIMATE",
          "APPROVED",
          "READY_TO_WORK",
          "IN_PROGRESS",
          "WORK_COMPLETE",
        ].includes(status) ? (
          <p className="text-xs text-zinc-400">
            No direct Overview actions are available for this status. Use the
            appropriate lifecycle tab for the next operation.
          </p>
        ) : null}
      </div>
    </section>
  );
}

type ActionButtonProps = {
  icon: typeof Send;
  label: string;
  disabled: boolean;
  onClick: () => void;
};

function ActionButton({
  icon: Icon,
  label,
  disabled,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="h-4 w-4" />

      {label}
    </button>
  );
}

function OverviewCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-zinc-900">{value}</p>
    </article>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-zinc-600">{value}</p>
    </article>
  );
}

function getCustomerName(repairOrder: RepairOrder): string {
  if (repairOrder.customer.companyName) {
    return repairOrder.customer.companyName;
  }

  return (
    [repairOrder.customer.firstName, repairOrder.customer.lastName]
      .filter(Boolean)
      .join(" ") || "Unnamed customer"
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: string): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
