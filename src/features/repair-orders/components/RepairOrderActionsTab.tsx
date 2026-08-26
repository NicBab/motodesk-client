"use client";

import { CheckCircle2, Clock3, Play, XCircle } from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import {
  usePauseRepairOrderMutation,
  useResumeRepairOrderMutation,
  useUpdateRepairOrderStatusMutation,
} from "@/store/api/repairOrdersApi";

import type { RepairOrder } from "../repair-order.types";

type RepairOrderActionsTabProps = {
  organizationId: string;
  repairOrder: RepairOrder;
};

export function RepairOrderActionsTab({
  organizationId,
  repairOrder,
}: RepairOrderActionsTabProps) {
  const [notes, setNotes] = useState("");

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateRepairOrderStatusMutation();

  const [pauseRepairOrder, { isLoading: isPausing }] =
    usePauseRepairOrderMutation();

  const [resumeRepairOrder, { isLoading: isResuming }] =
    useResumeRepairOrderMutation();

  const disabled = isUpdatingStatus || isPausing || isResuming;

  async function handleStart() {
    try {
      await updateStatus({
        organizationId,
        repairOrderId: repairOrder.id,
        status: "IN_PROGRESS",
      }).unwrap();

      toast.success("Repair order started.");
    } catch {
      toast.error("MotoDesk could not start the repair order.");
    }
  }

  async function handlePause() {
    const value = notes.trim();

    if (!value) {
      toast.error("Enter a reason for pausing work.");

      return;
    }

    try {
      await pauseRepairOrder({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: value,
      }).unwrap();

      setNotes("");

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
        notes: notes.trim() || undefined,
      }).unwrap();

      setNotes("");

      toast.success("Repair order resumed.");
    } catch {
      toast.error("MotoDesk could not resume the repair order.");
    }
  }

  async function handleComplete() {
    try {
      await updateStatus({
        organizationId,
        repairOrderId: repairOrder.id,
        status: "WORK_COMPLETE",
      }).unwrap();

      toast.success("Repair order marked work complete.");
    } catch {
      toast.error("MotoDesk could not complete the repair order.");
    }
  }

  async function handleCancel() {
    const value = notes.trim();

    if (!value) {
      toast.error("Enter a reason for cancelling the repair order.");

      return;
    }

    try {
      await updateStatus({
        organizationId,
        repairOrderId: repairOrder.id,
        status: "CANCELLED",
        notes: value,
      }).unwrap();

      setNotes("");

      toast.success("Repair order cancelled.");
    } catch {
      toast.error("MotoDesk could not cancel the repair order.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-zinc-900">
          Repair order actions
        </h3>

        <p className="mt-1 text-xs text-zinc-500">
          Current status: {formatLabel(repairOrder.status)}
        </p>

        {["IN_PROGRESS", "PAUSED"].includes(repairOrder.status) ? (
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Action notes
            </span>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Reason or notes..."
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {["READY_TO_WORK", "SCHEDULED"].includes(repairOrder.status) ? (
            <ActionButton
              icon={Play}
              label="Start work"
              disabled={disabled}
              onClick={() => void handleStart()}
            />
          ) : null}

          {repairOrder.status === "IN_PROGRESS" ? (
            <>
              <ActionButton
                icon={Clock3}
                label="Pause work"
                disabled={disabled}
                onClick={() => void handlePause()}
              />

              <ActionButton
                icon={CheckCircle2}
                label="Complete work"
                disabled={disabled}
                onClick={() => void handleComplete()}
              />

              <ActionButton
                icon={XCircle}
                label="Cancel RO"
                disabled={disabled}
                onClick={() => void handleCancel()}
              />
            </>
          ) : null}

          {repairOrder.status === "PAUSED" ? (
            <>
              <ActionButton
                icon={Play}
                label="Resume work"
                disabled={disabled}
                onClick={() => void handleResume()}
              />

              <ActionButton
                icon={XCircle}
                label="Cancel RO"
                disabled={disabled}
                onClick={() => void handleCancel()}
              />
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}

type ActionButtonProps = {
  icon: typeof Play;
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

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
