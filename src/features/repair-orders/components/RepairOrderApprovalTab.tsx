"use client";

import { CheckCircle2, Send, XCircle } from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import {
  useApproveRepairOrderMutation,
  useDeclineRepairOrderApprovalMutation,
  useRequestRepairOrderApprovalMutation,
} from "@/store/api/repairOrdersApi";

import type {
  RepairOrder,
  RepairOrderApprovalMethod,
} from "../repair-order.types";

type RepairOrderApprovalTabProps = {
  organizationId: string;
  repairOrder: RepairOrder;
};

export function RepairOrderApprovalTab({
  organizationId,
  repairOrder,
}: RepairOrderApprovalTabProps) {
  const [approvalMethod, setApprovalMethod] =
    useState<RepairOrderApprovalMethod>(repairOrder.approvalMethod ?? "PHONE");

  const [approvedBy, setApprovedBy] = useState(repairOrder.approvedBy ?? "");

  const [approvedAmount, setApprovedAmount] = useState(
    repairOrder.approvedAmount ?? "",
  );

  const [notes, setNotes] = useState(repairOrder.approvalNotes ?? "");

  const [requestApproval, { isLoading: isRequesting }] =
    useRequestRepairOrderApprovalMutation();

  const [approveRepairOrder, { isLoading: isApproving }] =
    useApproveRepairOrderMutation();

  const [declineRepairOrder, { isLoading: isDeclining }] =
    useDeclineRepairOrderApprovalMutation();

  const disabled = isRequesting || isApproving || isDeclining;

  async function handleRequest() {
    try {
      await requestApproval({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: notes.trim() || undefined,
      }).unwrap();

      toast.success("Customer approval requested.");
    } catch {
      toast.error("MotoDesk could not request approval.");
    }
  }

  async function handleApprove() {
    if (!approvedBy.trim()) {
      toast.error("Enter who approved the repair order.");

      return;
    }

    const amount = approvedAmount.trim() ? Number(approvedAmount) : undefined;

    if (amount !== undefined && !Number.isFinite(amount)) {
      toast.error("Enter a valid approved amount.");

      return;
    }

    try {
      await approveRepairOrder({
        organizationId,
        repairOrderId: repairOrder.id,
        approvalMethod,
        approvedBy: approvedBy.trim(),
        approvedAmount: amount,
        notes: notes.trim() || undefined,
      }).unwrap();

      toast.success("Repair order approved.");
    } catch {
      toast.error("MotoDesk could not approve the repair order.");
    }
  }

  async function handleDecline() {
    if (!notes.trim()) {
      toast.error("Enter decline notes.");

      return;
    }

    try {
      await declineRepairOrder({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: notes.trim(),
      }).unwrap();

      toast.success("Repair order approval declined.");
    } catch {
      toast.error("MotoDesk could not decline the approval.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">
            Approval status
          </h3>

          <p className="mt-1 text-xs text-zinc-500">
            Current status: {formatLabel(repairOrder.status)}
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
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
              placeholder="Customer or authorized contact"
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Approved amount
            </span>

            <input
              value={approvedAmount}
              onChange={(event) => setApprovedAmount(event.target.value)}
              type="number"
              step="0.01"
              min="0"
              placeholder="Optional"
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Approval notes
            </span>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>
        </div>
      </section>

      <section className="flex flex-wrap gap-2 rounded-xl border border-zinc-200 bg-white p-5">
        {repairOrder.status === "ESTIMATE" ? (
          <ActionButton
            icon={Send}
            label="Request approval"
            disabled={disabled}
            onClick={() => void handleRequest()}
          />
        ) : null}

        {repairOrder.status === "AWAITING_CUSTOMER_APPROVAL" ? (
          <>
            <ActionButton
              icon={CheckCircle2}
              label="Approve"
              disabled={disabled}
              onClick={() => void handleApprove()}
            />

            <ActionButton
              icon={XCircle}
              label="Decline"
              disabled={disabled}
              onClick={() => void handleDecline()}
            />
          </>
        ) : null}

        {!["ESTIMATE", "AWAITING_CUSTOMER_APPROVAL"].includes(
          repairOrder.status,
        ) ? (
          <p className="text-xs text-zinc-400">
            No approval action is required for the current status.
          </p>
        ) : null}
      </section>
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
