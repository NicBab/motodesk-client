"use client";

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  PackageCheck,
  Play,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";

import {
  useApproveAdditionalWorkMutation,
  useApproveRepairOrderMutation,
  useCashierRepairOrderMutation,
  useCloseRepairOrderMutation,
  useCompleteRepairOrderPartsReviewMutation,
  useCompleteRepairOrderPickupMutation,
  useDeclineAdditionalWorkMutation,
  useDeclineRepairOrderApprovalMutation,
  useFailRepairOrderQualityCheckMutation,
  usePassRepairOrderQualityCheckMutation,
  usePauseRepairOrderMutation,
  useReopenRepairOrderMutation,
  useRequestAdditionalWorkApprovalMutation,
  useRequestRepairOrderApprovalMutation,
  useResumeRepairOrderMutation,
  useSendAdditionalWorkToPartsReviewMutation,
  useUpdateRepairOrderStatusMutation,
} from "@/store/api/repairOrdersApi";

import type {
  RepairOrder,
  RepairOrderApprovalMethod,
} from "../repair-order.types";

type RepairOrderActionsTabProps = {
  organizationId: string;
  repairOrder: RepairOrder;
};

const CANCELLABLE_STATUSES: RepairOrder["status"][] = [
  "ESTIMATE",
  "AWAITING_CUSTOMER_APPROVAL",
  "APPROVED",
  "PARTS_REVIEW",
  "WAITING_ON_PARTS",
  "READY_TO_WORK",
  "SCHEDULED",
  "IN_PROGRESS",
  "PAUSED",
  "WAITING_ON_ADDITIONAL_APPROVAL",
];

const REOPENABLE_STATUSES: RepairOrder["status"][] = [
  "WORK_COMPLETE",
  "QUALITY_CHECK",
  "READY_FOR_PICKUP",
];

export function RepairOrderActionsTab({
  organizationId,
  repairOrder,
}: RepairOrderActionsTabProps) {
  const [notes, setNotes] = useState("");

  const [approvalMethod, setApprovalMethod] =
    useState<RepairOrderApprovalMethod>(repairOrder.approvalMethod ?? "PHONE");

  const [approvedBy, setApprovedBy] = useState(repairOrder.approvedBy ?? "");

  const [approvedAmount, setApprovedAmount] = useState(
    repairOrder.approvedAmount ?? "",
  );

  const [paymentReference, setPaymentReference] = useState(
    repairOrder.paymentReference ?? "",
  );

  const [paymentRemote, setPaymentRemote] = useState(repairOrder.paymentRemote);

  const [remainingBalance, setRemainingBalance] = useState(
    repairOrder.remainingBalance ?? "0",
  );

  const [pickupRecipient, setPickupRecipient] = useState(
    repairOrder.pickupRecipient ?? "",
  );

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateRepairOrderStatusMutation();

  const [requestApproval, { isLoading: isRequestingApproval }] =
    useRequestRepairOrderApprovalMutation();

  const [approveRepairOrder, { isLoading: isApproving }] =
    useApproveRepairOrderMutation();

  const [declineRepairOrder, { isLoading: isDeclining }] =
    useDeclineRepairOrderApprovalMutation();

  const [completePartsReview, { isLoading: isCompletingPartsReview }] =
    useCompleteRepairOrderPartsReviewMutation();

  const [pauseRepairOrder, { isLoading: isPausing }] =
    usePauseRepairOrderMutation();

  const [resumeRepairOrder, { isLoading: isResuming }] =
    useResumeRepairOrderMutation();

  const [requestAdditionalApproval, { isLoading: isRequestingAdditional }] =
    useRequestAdditionalWorkApprovalMutation();

  const [approveAdditionalWork, { isLoading: isApprovingAdditional }] =
    useApproveAdditionalWorkMutation();

  const [declineAdditionalWork, { isLoading: isDecliningAdditional }] =
    useDeclineAdditionalWorkMutation();

  const [sendAdditionalToParts, { isLoading: isSendingAdditionalToParts }] =
    useSendAdditionalWorkToPartsReviewMutation();

  const [reopenRepairOrder, { isLoading: isReopening }] =
    useReopenRepairOrderMutation();

  const [passQualityCheck, { isLoading: isPassingQc }] =
    usePassRepairOrderQualityCheckMutation();

  const [failQualityCheck, { isLoading: isFailingQc }] =
    useFailRepairOrderQualityCheckMutation();

  const [cashierRepairOrder, { isLoading: isCashiering }] =
    useCashierRepairOrderMutation();

  const [completePickup, { isLoading: isCompletingPickup }] =
    useCompleteRepairOrderPickupMutation();

  const [closeRepairOrder, { isLoading: isClosing }] =
    useCloseRepairOrderMutation();

  const disabled =
    isUpdatingStatus ||
    isRequestingApproval ||
    isApproving ||
    isDeclining ||
    isCompletingPartsReview ||
    isPausing ||
    isResuming ||
    isRequestingAdditional ||
    isApprovingAdditional ||
    isDecliningAdditional ||
    isSendingAdditionalToParts ||
    isReopening ||
    isPassingQc ||
    isFailingQc ||
    isCashiering ||
    isCompletingPickup ||
    isClosing;

  async function handleStatus(status: RepairOrder["status"], success: string) {
    try {
      await updateStatus({
        organizationId,
        repairOrderId: repairOrder.id,
        status,
      }).unwrap();

      toast.success(success);
    } catch {
      toast.error("MotoDesk could not update the repair order.");
    }
  }

  async function handleRequestApproval() {
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

  async function handleDeclineApproval() {
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
      toast.error("MotoDesk could not decline approval.");
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

  async function handlePause() {
    if (!notes.trim()) {
      toast.error("Enter a reason for pausing work.");
      return;
    }

    try {
      await pauseRepairOrder({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: notes.trim(),
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

  async function handleRequestAdditionalApproval() {
    if (!notes.trim()) {
      toast.error("Enter notes for the additional work.");
      return;
    }

    try {
      await requestAdditionalApproval({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: notes.trim(),
      }).unwrap();

      toast.success("Additional work approval requested.");
    } catch {
      toast.error("MotoDesk could not request additional approval.");
    }
  }

  async function handleAdditionalPartsReview() {
    if (!notes.trim()) {
      toast.error("Enter notes for the additional work.");
      return;
    }

    try {
      await sendAdditionalToParts({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: notes.trim(),
      }).unwrap();

      toast.success("Additional work sent to parts review.");
    } catch {
      toast.error("MotoDesk could not send additional work to parts review.");
    }
  }

  async function handleApproveAdditional() {
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
      toast.error("MotoDesk could not approve additional work.");
    }
  }

  async function handleDeclineAdditional() {
    if (!notes.trim()) {
      toast.error("Enter decline notes.");
      return;
    }

    try {
      await declineAdditionalWork({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: notes.trim(),
      }).unwrap();

      toast.success("Additional work declined.");
    } catch {
      toast.error("MotoDesk could not decline additional work.");
    }
  }

  async function handleReopen() {
    if (!notes.trim()) {
      toast.error("Enter a reason for reopening the repair order.");
      return;
    }

    try {
      await reopenRepairOrder({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: notes.trim(),
      }).unwrap();

      toast.success("Repair order reopened.");
    } catch {
      toast.error("MotoDesk could not reopen the repair order.");
    }
  }

  async function handlePassQc() {
    try {
      await passQualityCheck({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: notes.trim() || undefined,
      }).unwrap();

      toast.success("Quality check passed.");
    } catch {
      toast.error("MotoDesk could not pass quality check.");
    }
  }

  async function handleFailQc() {
    if (!notes.trim()) {
      toast.error("Enter QC failure notes.");
      return;
    }

    try {
      await failQualityCheck({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: notes.trim(),
      }).unwrap();

      toast.success("Quality check failed.");
    } catch {
      toast.error("MotoDesk could not fail quality check.");
    }
  }

  async function handleCashier() {
    const balance = Number(remainingBalance);

    if (!Number.isFinite(balance)) {
      toast.error("Enter a valid remaining balance.");
      return;
    }

    try {
      await cashierRepairOrder({
        organizationId,
        repairOrderId: repairOrder.id,
        paymentReference: paymentReference.trim() || undefined,
        paymentRemote,
        remainingBalance: balance,
      }).unwrap();

      toast.success("Repair order cashiered.");
    } catch {
      toast.error("MotoDesk could not cashier the repair order.");
    }
  }

  async function handlePickup() {
    try {
      await completePickup({
        organizationId,
        repairOrderId: repairOrder.id,
        pickupRecipient: pickupRecipient.trim() || undefined,
        notes: notes.trim() || undefined,
      }).unwrap();

      toast.success("Vehicle pickup completed.");
    } catch {
      toast.error("MotoDesk could not complete pickup.");
    }
  }

  async function handleClose() {
    try {
      await closeRepairOrder({
        organizationId,
        repairOrderId: repairOrder.id,
        notes: notes.trim() || undefined,
      }).unwrap();

      toast.success("Repair order closed.");
    } catch {
      toast.error("MotoDesk could not close the repair order.");
    }
  }

  async function handleCancel() {
    if (!notes.trim()) {
      toast.error("Enter a reason for cancelling the repair order.");
      return;
    }

    try {
      await updateStatus({
        organizationId,
        repairOrderId: repairOrder.id,
        status: "CANCELLED",
        notes: notes.trim(),
      }).unwrap();

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

        <ActionFields
          repairOrder={repairOrder}
          notes={notes}
          setNotes={setNotes}
          approvalMethod={approvalMethod}
          setApprovalMethod={setApprovalMethod}
          approvedBy={approvedBy}
          setApprovedBy={setApprovedBy}
          approvedAmount={approvedAmount}
          setApprovedAmount={setApprovedAmount}
          paymentReference={paymentReference}
          setPaymentReference={setPaymentReference}
          paymentRemote={paymentRemote}
          setPaymentRemote={setPaymentRemote}
          remainingBalance={remainingBalance}
          setRemainingBalance={setRemainingBalance}
          pickupRecipient={pickupRecipient}
          setPickupRecipient={setPickupRecipient}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {repairOrder.status === "ESTIMATE" ? (
            <ActionButton
              icon={Send}
              label="Request approval"
              disabled={disabled}
              onClick={() => void handleRequestApproval()}
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
                onClick={() => void handleDeclineApproval()}
              />
            </>
          ) : null}

          {repairOrder.status === "PARTS_REVIEW" ? (
            <ActionButton
              icon={PackageCheck}
              label="Complete parts review"
              disabled={disabled}
              onClick={() => void handleCompletePartsReview()}
            />
          ) : null}

          {["READY_TO_WORK", "SCHEDULED"].includes(repairOrder.status) ? (
            <ActionButton
              icon={Play}
              label="Start work"
              disabled={disabled}
              onClick={() =>
                void handleStatus("IN_PROGRESS", "Repair order started.")
              }
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
                icon={Send}
                label="Request additional approval"
                disabled={disabled}
                onClick={() => void handleRequestAdditionalApproval()}
              />

              <ActionButton
                icon={PackageCheck}
                label="Additional parts review"
                disabled={disabled}
                onClick={() => void handleAdditionalPartsReview()}
              />

              <ActionButton
                icon={CheckCircle2}
                label="Complete work"
                disabled={disabled}
                onClick={() =>
                  void handleStatus(
                    "WORK_COMPLETE",
                    "Repair order marked work complete.",
                  )
                }
              />
            </>
          ) : null}

          {repairOrder.status === "PAUSED" ? (
            <ActionButton
              icon={Play}
              label="Resume work"
              disabled={disabled}
              onClick={() => void handleResume()}
            />
          ) : null}

          {repairOrder.status === "WAITING_ON_ADDITIONAL_APPROVAL" ? (
            <>
              <ActionButton
                icon={CheckCircle2}
                label="Approve additional work"
                disabled={disabled}
                onClick={() => void handleApproveAdditional()}
              />

              <ActionButton
                icon={XCircle}
                label="Decline additional work"
                disabled={disabled}
                onClick={() => void handleDeclineAdditional()}
              />
            </>
          ) : null}

          {repairOrder.status === "WORK_COMPLETE" ? (
            <>
              <ActionButton
                icon={CheckCircle2}
                label="Begin quality check"
                disabled={disabled}
                onClick={() =>
                  void handleStatus("QUALITY_CHECK", "Quality check started.")
                }
              />

              <ActionButton
                icon={RotateCcw}
                label="Reopen for additional work"
                disabled={disabled}
                onClick={() => void handleReopen()}
              />
            </>
          ) : null}

          {repairOrder.status === "QUALITY_CHECK" ? (
            <>
              <ActionButton
                icon={CheckCircle2}
                label="Pass QC"
                disabled={disabled}
                onClick={() => void handlePassQc()}
              />

              <ActionButton
                icon={XCircle}
                label="Fail QC"
                disabled={disabled}
                onClick={() => void handleFailQc()}
              />

              <ActionButton
                icon={RotateCcw}
                label="Reopen for additional work"
                disabled={disabled}
                onClick={() => void handleReopen()}
              />
            </>
          ) : null}

          {repairOrder.status === "READY_FOR_PICKUP" ? (
            <>
              <ActionButton
                icon={CreditCard}
                label="Complete cashier"
                disabled={disabled}
                onClick={() => void handleCashier()}
              />

              <ActionButton
                icon={RotateCcw}
                label="Reopen for additional work"
                disabled={disabled}
                onClick={() => void handleReopen()}
              />
            </>
          ) : null}

          {repairOrder.status === "CASHIERED" ? (
            <ActionButton
              icon={PackageCheck}
              label="Complete pickup"
              disabled={disabled}
              onClick={() => void handlePickup()}
            />
          ) : null}

          {repairOrder.status === "PICKED_UP" ? (
            <ActionButton
              icon={CheckCircle2}
              label="Close repair order"
              disabled={disabled}
              onClick={() => void handleClose()}
            />
          ) : null}

          {CANCELLABLE_STATUSES.includes(repairOrder.status) ? (
            <ActionButton
              icon={XCircle}
              label="Cancel RO"
              disabled={disabled}
              onClick={() => void handleCancel()}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}

type ActionFieldsProps = {
  repairOrder: RepairOrder;
  notes: string;
  setNotes: (value: string) => void;
  approvalMethod: RepairOrderApprovalMethod;
  setApprovalMethod: (value: RepairOrderApprovalMethod) => void;
  approvedBy: string;
  setApprovedBy: (value: string) => void;
  approvedAmount: string;
  setApprovedAmount: (value: string) => void;
  paymentReference: string;
  setPaymentReference: (value: string) => void;
  paymentRemote: boolean;
  setPaymentRemote: (value: boolean) => void;
  remainingBalance: string;
  setRemainingBalance: (value: string) => void;
  pickupRecipient: string;
  setPickupRecipient: (value: string) => void;
};

function ActionFields({
  repairOrder,
  notes,
  setNotes,
  approvalMethod,
  setApprovalMethod,
  approvedBy,
  setApprovedBy,
  approvedAmount,
  setApprovedAmount,
  paymentReference,
  setPaymentReference,
  paymentRemote,
  setPaymentRemote,
  remainingBalance,
  setRemainingBalance,
  pickupRecipient,
  setPickupRecipient,
}: ActionFieldsProps) {
  const approvalFields = [
    "AWAITING_CUSTOMER_APPROVAL",
    "WAITING_ON_ADDITIONAL_APPROVAL",
  ].includes(repairOrder.status);

  return (
    <div className="mt-4 space-y-4">
      {approvalFields ? (
        <>
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
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
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
                className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm"
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
              className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm"
            />
          </label>
        </>
      ) : null}

      {repairOrder.status === "READY_FOR_PICKUP" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-zinc-700">
                Payment reference
              </span>

              <input
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-zinc-700">
                Remaining balance
              </span>

              <input
                value={remainingBalance}
                onChange={(event) => setRemainingBalance(event.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm"
              />
            </label>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={paymentRemote}
              onChange={(event) => setPaymentRemote(event.target.checked)}
            />

            <span className="text-sm text-zinc-700">
              Payment completed remotely
            </span>
          </label>
        </>
      ) : null}

      {repairOrder.status === "CASHIERED" ? (
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-zinc-700">
            Pickup recipient
          </span>

          <input
            value={pickupRecipient}
            onChange={(event) => setPickupRecipient(event.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm"
          />
        </label>
      ) : null}

      {!["READY_TO_WORK", "SCHEDULED"].includes(repairOrder.status) ? (
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-zinc-700">
            Action notes
          </span>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Reason or notes..."
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900"
          />
        </label>
      ) : null}
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
