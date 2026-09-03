"use client";

import {
  CalendarClock,
  Clock3,
  ExternalLink,
  X,
} from "lucide-react";

import type {
  ScheduleWorkBlock,
} from "../scheduling.types";

import {
  formatScheduleStatus,
  getEmployeeDisplayName,
} from "../scheduling.utils";

//************************************************************** */

type WorkBlockDetailDialogProps = {
  workBlock:
    ScheduleWorkBlock | null;

  onClose:
    () => void;

  onOpenRepairOrder: (
    block:
      ScheduleWorkBlock,
  ) => void;

  onEditSchedule: (
    block:
      ScheduleWorkBlock,
  ) => void;
};

//************************************************************** */

export function WorkBlockDetailDialog({
  workBlock,
  onClose,
  onOpenRepairOrder,
  onEditSchedule,
}: WorkBlockDetailDialogProps) {
  if (
    !workBlock
  ) {
    return null;
  }

  const repairOrder =
    workBlock.repairOrder;

  const duration =
    getDurationHours(
      workBlock,
    );

  const laborDescription =
    workBlock.laborLine
      ?.description ??
    workBlock.laborLine
      ?.operation ??
    null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-zinc-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              RO #
              {
                repairOrder.roNumber
              }
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {
                getCustomerName(
                  workBlock,
                )
              }
              {" · "}
              {
                getVehicleDescription(
                  workBlock,
                )
              }
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 px-5 py-5">
          <div className="flex flex-wrap gap-2">
            <Badge>
              {formatScheduleStatus(
                workBlock.status,
              )}
            </Badge>

            {workBlock.waitingCustomer ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                <Clock3 className="h-3 w-3" />

                Waiting Customer
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailRow
              label="Technician"
              value={
                getEmployeeDisplayName(
                  workBlock.technicianEmployee,
                )
              }
            />

            <DetailRow
              label="Duration"
              value={
                duration ===
                null
                  ? "—"
                  : `${duration.toFixed(1)} hours`
              }
            />

            <DetailRow
              label="Scheduled Start"
              value={
                formatDateTime(
                  workBlock.scheduledDate,
                )
              }
            />

            <DetailRow
              label="Scheduled End"
              value={
                workBlock.scheduledEnd
                  ? formatDateTime(
                      workBlock.scheduledEnd,
                    )
                  : "—"
              }
            />
          </div>

          {laborDescription ? (
            <DetailSection
              label="Labor Operation"
              value={
                laborDescription
              }
            />
          ) : null}

          {workBlock.notes ? (
            <DetailSection
              label="Schedule Notes"
              value={
                workBlock.notes
              }
            />
          ) : null}

          {repairOrder.complaint ? (
            <DetailSection
              label="Customer Complaint"
              value={
                repairOrder.complaint
              }
            />
          ) : null}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={
              onClose
            }
            className="h-10 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() =>
              onEditSchedule(
                workBlock,
              )
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            <CalendarClock className="h-4 w-4" />

            Edit Schedule
          </button>

          <button
            type="button"
            onClick={() =>
              onOpenRepairOrder(
                workBlock,
              )
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <ExternalLink className="h-4 w-4" />

            Open RO
          </button>
        </footer>
      </section>
    </div>
  );
}

//************************************************************** */

function DetailRow({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-zinc-800">
        {value}
      </p>
    </div>
  );
}

//************************************************************** */

function DetailSection({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="border-t border-zinc-100 pt-4">
      <p className="text-xs font-medium text-zinc-400">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
        {value}
      </p>
    </div>
  );
}

//************************************************************** */

function Badge({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
      {
        children
      }
    </span>
  );
}

//************************************************************** */

function getCustomerName(
  block:
    ScheduleWorkBlock,
): string {
  const customer =
    block.repairOrder.customer;

return (
  customer.companyName ??
  (
    [
      customer.firstName,
      customer.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Unknown customer"
  )
);
}

//************************************************************** */

function getVehicleDescription(
  block:
    ScheduleWorkBlock,
): string {
  const vehicle =
    block.repairOrder.vehicle;

  return [
    vehicle.year,
    vehicle.make,
    vehicle.model,
  ]
    .filter(Boolean)
    .join(" ") ||
    "No vehicle";
}

//************************************************************** */

function getDurationHours(
  block:
    ScheduleWorkBlock,
): number | null {
  if (
    !block.scheduledEnd
  ) {
    return null;
  }

  const start =
    new Date(
      block.scheduledDate,
    ).getTime();

  const end =
    new Date(
      block.scheduledEnd,
    ).getTime();

  if (
    end <=
    start
  ) {
    return null;
  }

  return (
    end -
    start
  ) /
    3600000;
}

//************************************************************** */

function formatDateTime(
  value:
    string,
): string {
  return new Intl.DateTimeFormat(
    undefined,
    {
      month:
        "short",

      day:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

//************************************************************** */