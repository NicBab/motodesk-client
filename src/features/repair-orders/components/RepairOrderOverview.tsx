"use client";

import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  Send,
  XCircle,
} from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import type { RepairOrder } from "../repair-order.types";

import {
  useCompleteRepairOrderPartsReviewMutation,
  useFailRepairOrderQualityCheckMutation,
  usePassRepairOrderQualityCheckMutation,
  useRequestRepairOrderApprovalMutation,
  useUpdateRepairOrderStatusMutation,
  usePauseRepairOrderMutation,
  useResumeRepairOrderMutation,
} from "@/store/api/repairOrdersApi";

type RepairOrderOverviewProps = {
  organizationId: string;
  repairOrder: RepairOrder;
};

export function RepairOrderOverview({
  organizationId,
  repairOrder,
}: RepairOrderOverviewProps) {
  const [qualityCheckNotes, setQualityCheckNotes] = useState("");

  const [pauseNotes, setPauseNotes] = useState("");

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateRepairOrderStatusMutation();

  const [requestApproval, { isLoading: isRequestingApproval }] =
    useRequestRepairOrderApprovalMutation();

  const [completePartsReview, { isLoading: isCompletingPartsReview }] =
    useCompleteRepairOrderPartsReviewMutation();

  const [passQualityCheck, { isLoading: isPassingQualityCheck }] =
    usePassRepairOrderQualityCheckMutation();

  const [failQualityCheck, { isLoading: isFailingQualityCheck }] =
    useFailRepairOrderQualityCheckMutation();

  const [pauseRepairOrder, { isLoading: isPausing }] =
    usePauseRepairOrderMutation();

  const [resumeRepairOrder, { isLoading: isResuming }] =
    useResumeRepairOrderMutation();

  const actionDisabled =
    isUpdatingStatus ||
    isRequestingApproval ||
    isCompletingPartsReview ||
    isPassingQualityCheck ||
    isFailingQualityCheck ||
    isPausing ||
    isResuming;

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

  async function handlePassQualityCheck() {
    try {
      await passQualityCheck({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: qualityCheckNotes.trim() || undefined,
      }).unwrap();

      setQualityCheckNotes("");

      toast.success("Quality check passed.");
    } catch {
      toast.error("MotoDesk could not pass the quality check.");
    }
  }

  async function handleFailQualityCheck() {
    const notes = qualityCheckNotes.trim();

    if (!notes) {
      toast.error("Enter quality-check failure notes.");

      return;
    }

    try {
      await failQualityCheck({
        organizationId,
        repairOrderId: repairOrder.id,
        notes,
      }).unwrap();

      setQualityCheckNotes("");

      toast.success(
        "Quality check failed. Repair order returned to In Progress.",
      );
    } catch {
      toast.error("MotoDesk could not fail the quality check.");
    }
  }

  async function handlePause() {
    const notes = pauseNotes.trim();

    if (!notes) {
      toast.error("Enter a reason for pausing work.");

      return;
    }

    try {
      await pauseRepairOrder({
        organizationId,
        repairOrderId: repairOrder.id,
        notes,
      }).unwrap();

      setPauseNotes("");

      toast.success("Repair order paused.");
    } catch {
      toast.error("MotoDesk could not pause the repair order.");
    }
  }

  async function handleResume() {
    try {
      await resumeRepairOrder({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: pauseNotes.trim() || undefined,
      }).unwrap();

      setPauseNotes("");

      toast.success("Repair order resumed.");
    } catch {
      toast.error("MotoDesk could not resume the repair order.");
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
        qualityCheckNotes={qualityCheckNotes}
        onQualityCheckNotesChange={setQualityCheckNotes}
        onRequestApproval={handleRequestApproval}
        onCompletePartsReview={handleCompletePartsReview}
        onStatusChange={handleStatusChange}
        onPassQualityCheck={handlePassQualityCheck}
        onFailQualityCheck={handleFailQualityCheck}

        pauseNotes={pauseNotes}
        onPauseNotesChange={setPauseNotes}
        onPause={handlePause}
        onResume={handleResume}
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

  qualityCheckNotes: string;

  onQualityCheckNotesChange: (value: string) => void;

  onRequestApproval: () => Promise<void>;

  onCompletePartsReview: () => Promise<void>;

  onStatusChange: (
    status: RepairOrder["status"],
    successMessage: string,
  ) => Promise<void>;

  onPassQualityCheck: () => Promise<void>;

  onFailQualityCheck: () => Promise<void>;
  pauseNotes: string;

  onPauseNotesChange: (value: string) => void;

  onPause: () => Promise<void>;

  onResume: () => Promise<void>;
};

function LifecycleActions({
  repairOrder,
  disabled,
  qualityCheckNotes,
  onQualityCheckNotesChange,
  onRequestApproval,
  onCompletePartsReview,
  onStatusChange,
  onPassQualityCheck,
  onFailQualityCheck,

  onPauseNotesChange,
  pauseNotes,
    onPause,
  onResume,
}: LifecycleActionsProps) {
  const status = repairOrder.status;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">
          Lifecycle actions
        </h3>

        <p className="mt-1 text-xs text-zinc-500">
          Available actions are based on the current repair-order status.
        </p>
      </div>

      {/* {status === "QUALITY_CHECK" ? (
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Quality check notes
            </span>

            <textarea
              value={qualityCheckNotes}
              onChange={(event) =>
                onQualityCheckNotesChange(event.target.value)
              }
              rows={3}
              placeholder="Optional for pass. Required for failure."
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          

          <div className="flex flex-wrap gap-2">
            <ActionButton
              icon={CheckCircle2}
              label="Pass QC"
              disabled={disabled}
              onClick={() => void onPassQualityCheck()}
            />

            <ActionButton
              icon={XCircle}
              label="Fail QC"
              disabled={disabled}
              onClick={() => void onFailQualityCheck()}
            />
          </div>
        </div>
      ) : (
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
              No direct Overview actions are available for this status.
            </p>
          ) : null}
        </div>
      )} */}

      {status === "QUALITY_CHECK" ? (
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Quality check notes
            </span>

            <textarea
              value={qualityCheckNotes}
              onChange={(event) =>
                onQualityCheckNotesChange(event.target.value)
              }
              rows={3}
              placeholder="Optional for pass. Required for failure."
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <ActionButton
              icon={CheckCircle2}
              label="Pass QC"
              disabled={disabled}
              onClick={() => void onPassQualityCheck()}
            />

            <ActionButton
              icon={XCircle}
              label="Fail QC"
              disabled={disabled}
              onClick={() => void onFailQualityCheck()}
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {["IN_PROGRESS", "PAUSED"].includes(status) ? (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-zinc-700">
                Pause / resume notes
              </span>

              <textarea
                value={pauseNotes}
                onChange={(event) => onPauseNotesChange(event.target.value)}
                rows={3}
                placeholder={
                  status === "IN_PROGRESS"
                    ? "Reason for pausing..."
                    : "Optional resume notes..."
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </label>
          ) : null}

          <div className="flex flex-wrap gap-2">
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
              <>
                <ActionButton
                  icon={Clock3}
                  label="Pause work"
                  disabled={disabled}
                  onClick={() => void onPause()}
                />

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
              </>
            ) : null}

            {status === "PAUSED" ? (
              <ActionButton
                icon={Clock3}
                label="Resume work"
                disabled={disabled}
                onClick={() => void onResume()}
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
          </div>
        </div>
      )}
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
