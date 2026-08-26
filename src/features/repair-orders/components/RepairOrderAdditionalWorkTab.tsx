"use client";

import { CheckCircle2, PackageSearch, Send, XCircle } from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import {
  useApproveAdditionalWorkMutation,
  useDeclineAdditionalWorkMutation,
  useRequestAdditionalWorkApprovalMutation,
  useSendAdditionalWorkToPartsReviewMutation,
  useReopenRepairOrderMutation,
} from "@/store/api/repairOrdersApi";

import type {
  RepairOrder,
  RepairOrderApprovalMethod,
} from "../repair-order.types";

type RepairOrderAdditionalWorkTabProps = {
  organizationId: string;
  repairOrder: RepairOrder;
};

export function RepairOrderAdditionalWorkTab({
  organizationId,
  repairOrder,
}: RepairOrderAdditionalWorkTabProps) {
  const [notes, setNotes] = useState("");

  const [approvalMethod, setApprovalMethod] =
    useState<RepairOrderApprovalMethod>("PHONE");

  const [approvedBy, setApprovedBy] = useState("");

  const [approvedAmount, setApprovedAmount] = useState("");

  const [sendToPartsReview, { isLoading: isSendingToPartsReview }] =
    useSendAdditionalWorkToPartsReviewMutation();

  const [requestApproval, { isLoading: isRequestingApproval }] =
    useRequestAdditionalWorkApprovalMutation();

  const [approveAdditionalWork, { isLoading: isApproving }] =
    useApproveAdditionalWorkMutation();

  const [declineAdditionalWork, { isLoading: isDeclining }] =
    useDeclineAdditionalWorkMutation();

  const [reopenRepairOrder, { isLoading: isReopening }] =
    useReopenRepairOrderMutation();

  const disabled =
    isSendingToPartsReview ||
    isRequestingApproval ||
    isApproving ||
    isDeclining ||
    isReopening;

  async function handlePartsReview() {
    const value = notes.trim();

    if (!value) {
      toast.error("Enter notes for the parts review.");

      return;
    }

    try {
      await sendToPartsReview({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: value,
      }).unwrap();

      toast.success("Additional work sent to parts review.");
    } catch {
      toast.error("MotoDesk could not send additional work to parts review.");
    }
  }

  async function handleRequestApproval() {
    const value = notes.trim();

    if (!value) {
      toast.error("Enter notes for the approval request.");

      return;
    }

    try {
      await requestApproval({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: value,
      }).unwrap();

      toast.success("Additional work approval requested.");
    } catch {
      toast.error("MotoDesk could not request additional approval.");
    }
  }

  async function handleApprove() {
    if (!approvedBy.trim()) {
      toast.error("Enter who approved the additional work.");

      return;
    }

    const amount = approvedAmount.trim() ? Number(approvedAmount) : undefined;

    if (amount !== undefined && !Number.isFinite(amount)) {
      toast.error("Enter a valid approved amount.");

      return;
    }

    try {
      await approveAdditionalWork({
        organizationId,
        repairOrderId: repairOrder.id,
        approvalMethod,
        approvedBy: approvedBy.trim(),
        approvedAmount: amount,
        notes: notes.trim() || undefined,
      }).unwrap();

      toast.success("Additional work approved.");
    } catch {
      toast.error("MotoDesk could not approve the additional work.");
    }
  }

  async function handleDecline() {
    const value = notes.trim();

    if (!value) {
      toast.error("Enter decline notes.");

      return;
    }

    try {
      await declineAdditionalWork({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: value,
      }).unwrap();

      toast.success("Additional work declined.");
    } catch {
      toast.error("MotoDesk could not decline the additional work.");
    }
  }

  async function handleReopen() {
    const value = notes.trim();

    if (!value) {
      toast.error("Enter a reason for reopening the repair order.");

      return;
    }

    try {
      await reopenRepairOrder({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: value,
      }).unwrap();

      toast.success("Repair order reopened for additional work.");
    } catch {
      toast.error("MotoDesk could not reopen the repair order.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-zinc-900">Additional work</h3>

        <p className="mt-1 text-xs text-zinc-500">
          Current status: {formatLabel(repairOrder.status)}
        </p>

        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-semibold text-zinc-700">
            Notes
          </span>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Describe the additional work or customer decision..."
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          />
        </label>
      </section>

      {["WORK_COMPLETE", "QUALITY_CHECK", "READY_FOR_PICKUP"].includes(
        repairOrder.status,
      ) ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-zinc-900">
            Reopen for additional work
          </h3>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            If the customer requests more service before pickup, reopen this
            repair order and return it to active work.
          </p>

          <button
            type="button"
            disabled={disabled}
            onClick={() => void handleReopen()}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reopen for additional work
          </button>
        </section>
      ) : null}

      {repairOrder.status === "IN_PROGRESS" ? (
        <section className="flex flex-wrap gap-2 rounded-xl border border-zinc-200 bg-white p-5">
          <ActionButton
            icon={Send}
            label="Request customer approval"
            disabled={disabled}
            onClick={() => void handleRequestApproval()}
          />

          <ActionButton
            icon={PackageSearch}
            label="Send to parts review"
            disabled={disabled}
            onClick={() => void handlePartsReview()}
          />
        </section>
      ) : null}

      {repairOrder.status === "WAITING_ON_ADDITIONAL_APPROVAL" ? (
        <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-zinc-700">
                Approval method
              </span>

              <select
                value={approvalMethod}
                onChange={(event) =>
                  setApprovalMethod(
                    event.target.value as RepairOrderApprovalMethod,
                  )
                }
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="PHONE">Phone</option>
                <option value="SMS">SMS</option>
                <option value="EMAIL">Email</option>
                <option value="CUSTOMER_PORTAL">Customer portal</option>
                <option value="IN_PERSON">In person</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-zinc-700">
                Approved by
              </span>

              <input
                value={approvedBy}
                onChange={(event) => setApprovedBy(event.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Approved amount
            </span>

            <input
              value={approvedAmount}
              onChange={(event) => setApprovedAmount(event.target.value)}
              type="number"
              min="0"
              step="0.01"
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <ActionButton
              icon={CheckCircle2}
              label="Approve additional work"
              disabled={disabled}
              onClick={() => void handleApprove()}
            />

            <ActionButton
              icon={XCircle}
              label="Decline"
              disabled={disabled}
              onClick={() => void handleDecline()}
            />
          </div>
        </section>
      ) : null}

      {![
        "IN_PROGRESS",
        "WAITING_ON_ADDITIONAL_APPROVAL",
        "WORK_COMPLETE",
        "QUALITY_CHECK",
        "READY_FOR_PICKUP",
      ].includes(repairOrder.status) ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs text-zinc-500">
            Additional-work actions are only available while the RO is in
            progress or awaiting additional approval.
          </p>
        </section>
      ) : null}
    </div>
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

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
