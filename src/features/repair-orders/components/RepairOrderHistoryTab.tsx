"use client";

import { History } from "lucide-react";

import type {
  RepairOrder,
  RepairOrderStatusHistoryEntry,
} from "../repair-order.types";

type RepairOrderHistoryTabProps = {
  repairOrder: RepairOrder;
};

export function RepairOrderHistoryTab({
  repairOrder,
}: RepairOrderHistoryTabProps) {
  const history = [...(repairOrder.statusHistory ?? [])].reverse();

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <History className="h-4 w-4 text-zinc-500" />
          Status history
        </h3>

        <p className="mt-1 text-xs text-zinc-500">
          Complete lifecycle timeline for this repair order.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="grid min-h-40 place-items-center px-5 py-8 text-sm text-zinc-500">
          No status history recorded.
        </div>
      ) : (
        <div className="px-5 py-5">
          {history.map((entry, index) => (
            <HistoryEntry
              key={entry.id}
              entry={entry}
              latest={index === 0}
              last={index === history.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function HistoryEntry({
  entry,
  latest,
  last,
}: {
  entry: RepairOrderStatusHistoryEntry;
  latest: boolean;
  last: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      <div className="flex w-4 shrink-0 flex-col items-center">
        <div
          className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
            latest ? "bg-orange-500" : "bg-zinc-300"
          }`}
        />

        {!last ? (
          <div className="mt-1 min-h-16 w-px flex-1 bg-zinc-200" />
        ) : null}
      </div>

      <div className={last ? "min-w-0 flex-1" : "min-w-0 flex-1 pb-6"}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900">
            {formatLabel(entry.status)}
          </span>

          {entry.automatic ? (
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
              Auto
            </span>
          ) : null}
        </div>

        <p className="mt-1 text-xs text-zinc-400">
          {formatDateTime(entry.changedAt)}
        </p>

        {entry.previousStatus ? (
          <p className="mt-1 text-xs text-zinc-500">
            Previous: {formatLabel(entry.previousStatus)}
          </p>
        ) : null}

        {entry.changedByMembership ? (
          <p className="mt-1 text-xs text-zinc-500">
            By: {getMembershipName(entry)}
          </p>
        ) : null}

        {entry.notes ? (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-zinc-600">
            {entry.notes}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function getMembershipName(entry: RepairOrderStatusHistoryEntry): string {
  const membership = entry.changedByMembership;

  if (!membership) {
    return "System";
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

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
