"use client";

import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  Receipt,
  UserRound,
} from "lucide-react";

import type { ReactNode } from "react";

import type { RepairOrder, RepairOrderMembership } from "../repair-order.types";

type RepairOrderStatusTabProps = {
  repairOrder: RepairOrder;
};

export function RepairOrderStatusTab({
  repairOrder,
}: RepairOrderStatusTabProps) {
  const history = repairOrder.statusHistory ?? [];

  const latest = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-zinc-900">Current status</h3>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <StatusBadge status={repairOrder.status} />

          {latest ? (
            <span className="text-xs text-zinc-500">
              Since {formatDateTime(latest.changedAt)}
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
          <StatusRow
            icon={<Clock3 className="h-4 w-4" />}
            label="Priority"
            value={formatLabel(repairOrder.priority)}
          />

          <StatusRow
            icon={<UserRound className="h-4 w-4" />}
            label="Service advisor"
            value={getMembershipName(repairOrder.serviceAdvisor)}
          />

          <StatusRow
            icon={<UserRound className="h-4 w-4" />}
            label="Technician"
            value={getMembershipName(repairOrder.primaryTechnician)}
          />

          <StatusRow
            icon={<Clock3 className="h-4 w-4" />}
            label="Promised date"
            value={
              repairOrder.promisedDate
                ? formatDate(repairOrder.promisedDate)
                : "—"
            }
          />

          <StatusRow
            icon={<Clock3 className="h-4 w-4" />}
            label="Scheduled date"
            value={
              repairOrder.scheduledDate
                ? formatDate(repairOrder.scheduledDate)
                : "—"
            }
          />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <Receipt className="h-4 w-4 text-zinc-500" />
          Cashier status
        </h3>

        <div className="mt-3 grid gap-x-6 sm:grid-cols-2">
          <StatusRow
            label="Cashier status"
            value={formatLabel(repairOrder.cashierStatus)}
          />

          <StatusRow
            label="Cashiered date"
            value={
              repairOrder.cashieredDate
                ? formatDateTime(repairOrder.cashieredDate)
                : "—"
            }
          />

          <StatusRow
            label="Payment reference"
            value={repairOrder.paymentReference || "—"}
          />

          <StatusRow
            label="Remaining balance"
            value={formatCurrency(repairOrder.remainingBalance)}
          />

          <StatusRow
            label="Remote payment"
            value={repairOrder.paymentRemote ? "Yes" : "No"}
          />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <PackageCheck className="h-4 w-4 text-zinc-500" />
          Pickup status
        </h3>

        <div className="mt-3 grid gap-x-6 sm:grid-cols-2">
          <StatusRow
            label="Pickup status"
            value={formatLabel(repairOrder.pickupStatus)}
          />

          <StatusRow
            label="Pickup date"
            value={
              repairOrder.pickupDate
                ? formatDateTime(repairOrder.pickupDate)
                : "—"
            }
          />

          <StatusRow
            label="Recipient"
            value={repairOrder.pickupRecipient || "—"}
          />

          <StatusRow
            label="Pickup notes"
            value={repairOrder.pickupNotes || "—"}
          />
        </div>
      </section>

      {repairOrder.approvalMethod ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <CheckCircle2 className="h-4 w-4 text-zinc-500" />
            Customer approval
          </h3>

          <div className="mt-3 grid gap-x-6 sm:grid-cols-2">
            <StatusRow
              label="Approval method"
              value={formatLabel(repairOrder.approvalMethod)}
            />

            <StatusRow
              label="Approved by"
              value={repairOrder.approvedBy || "—"}
            />

            <StatusRow
              label="Approval date"
              value={
                repairOrder.approvalDate
                  ? formatDateTime(repairOrder.approvalDate)
                  : "—"
              }
            />

            <StatusRow
              label="Approved amount"
              value={
                repairOrder.approvedAmount
                  ? formatCurrency(repairOrder.approvedAmount)
                  : "—"
              }
            />
          </div>

          {repairOrder.approvalNotes ? (
            <div className="mt-4 border-t border-zinc-200 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Approval notes
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
                {repairOrder.approvalNotes}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-zinc-100 py-3 last:border-b-0">
      {icon ? (
        <span className="mt-0.5 shrink-0 text-zinc-400">{icon}</span>
      ) : null}

      <span className="min-w-32 text-sm text-zinc-500">{label}</span>

      <span className="ml-auto text-right text-sm font-medium text-zinc-900">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
      {formatLabel(status)}
    </span>
  );
}

function getMembershipName(
  membership: RepairOrderMembership | null | undefined,
): string {
  if (!membership) {
    return "—";
  }

  const name = [membership.user.firstName, membership.user.lastName]
    .filter(Boolean)
    .join(" ");

  return name || membership.user.email;
}

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(value: string): string {
  const amount = Number(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
