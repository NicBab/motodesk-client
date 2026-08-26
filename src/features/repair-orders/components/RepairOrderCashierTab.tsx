"use client";

import { CheckCircle2, CreditCard, PackageCheck } from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import {
  useCashierRepairOrderMutation,
  useCloseRepairOrderMutation,
  useCompleteRepairOrderPickupMutation,
} from "@/store/api/repairOrdersApi";

import type { RepairOrder } from "../repair-order.types";

type RepairOrderCashierTabProps = {
  organizationId: string;
  repairOrder: RepairOrder;
};

export function RepairOrderCashierTab({
  organizationId,
  repairOrder,
}: RepairOrderCashierTabProps) {
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

  const [pickupNotes, setPickupNotes] = useState(repairOrder.pickupNotes ?? "");

  const [closeNotes, setCloseNotes] = useState("");

  const [cashierRepairOrder, { isLoading: isCashiering }] =
    useCashierRepairOrderMutation();

  const [completePickup, { isLoading: isCompletingPickup }] =
    useCompleteRepairOrderPickupMutation();

  const [closeRepairOrder, { isLoading: isClosing }] =
    useCloseRepairOrderMutation();

  const disabled = isCashiering || isCompletingPickup || isClosing;

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
        notes: pickupNotes.trim() || undefined,
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
        notes: closeNotes.trim() || undefined,
      }).unwrap();

      toast.success("Repair order closed.");
    } catch {
      toast.error("MotoDesk could not close the repair order.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="RO Status" value={formatLabel(repairOrder.status)} />

        <InfoCard
          label="Cashier"
          value={formatLabel(repairOrder.cashierStatus)}
        />

        <InfoCard
          label="Pickup"
          value={formatLabel(repairOrder.pickupStatus)}
        />

        <InfoCard
          label="Remaining Balance"
          value={formatCurrency(repairOrder.remainingBalance)}
        />
      </section>

      {repairOrder.status === "READY_FOR_PICKUP" ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-600">
              <CreditCard className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Cashier repair order
              </h3>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Record payment details and complete cashiering before vehicle
                pickup.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-zinc-700">
                Payment reference
              </span>

              <input
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder="Receipt, transaction, or reference number"
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
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
                step="0.01"
                min="0"
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </label>
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
            <input
              type="checkbox"
              checked={paymentRemote}
              onChange={(event) => setPaymentRemote(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300"
            />

            <span className="text-sm text-zinc-700">
              Payment completed remotely
            </span>
          </label>

          <button
            type="button"
            disabled={disabled}
            onClick={() => void handleCashier()}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CreditCard className="h-4 w-4" />

            {isCashiering ? "Cashiering..." : "Complete cashier"}
          </button>
        </section>
      ) : null}

      {repairOrder.status === "CASHIERED" ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <PackageCheck className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Vehicle pickup
              </h3>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Record who received the vehicle and complete the pickup.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-zinc-700">
                Pickup recipient
              </span>

              <input
                value={pickupRecipient}
                onChange={(event) => setPickupRecipient(event.target.value)}
                placeholder="Customer or authorized recipient"
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-zinc-700">
                Pickup notes
              </span>

              <textarea
                value={pickupNotes}
                onChange={(event) => setPickupNotes(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </label>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() => void handlePickup()}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PackageCheck className="h-4 w-4" />

            {isCompletingPickup ? "Completing..." : "Complete pickup"}
          </button>
        </section>
      ) : null}

      {repairOrder.status === "PICKED_UP" ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Close repair order
              </h3>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Vehicle pickup is complete. Close the RO to finish the
                lifecycle.
              </p>
            </div>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Close notes
            </span>

            <textarea
              value={closeNotes}
              onChange={(event) => setCloseNotes(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <button
            type="button"
            disabled={disabled}
            onClick={() => void handleClose()}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />

            {isClosing ? "Closing..." : "Close repair order"}
          </button>
        </section>
      ) : null}

      {!["READY_FOR_PICKUP", "CASHIERED", "PICKED_UP"].includes(
        repairOrder.status,
      ) ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs text-zinc-500">
            Cashier and pickup actions are not available for the current
            repair-order status.
          </p>
        </section>
      ) : null}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-zinc-900">{value}</p>
    </article>
  );
}

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
