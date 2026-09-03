"use client";

import { useState } from "react";

import { Loader2, X } from "lucide-react";

import type { Employee } from "@/features/employees/employee.types";

import type { RepairOrder } from "@/features/repair-orders/repair-order.types";

import {
  useRescheduleRepairOrderMutation,
  useScheduleRepairOrderMutation,
} from "@/store/api/schedulingApi";

import type { ScheduleWorkBlock } from "../scheduling.types";

import {
  getEmployeeDisplayName,
  toScheduleDateParam,
} from "../scheduling.utils";

//************************************************************** */

type ScheduleRepairOrderDialogProps = {
  organizationId: string;

  repairOrder: ScheduleRepairOrderTarget | null;

  workBlock?: ScheduleWorkBlock | null;

  technicians: Employee[];

  selectedDate: Date;

  onClose: () => void;

  onSaved: () => void;
};

type ScheduleRepairOrderTarget = Pick<
  RepairOrder,
  "id" | "roNumber" | "status" | "priority" | "customer" | "vehicle"
>;

//************************************************************** */

export function ScheduleRepairOrderDialog({
  organizationId,
  repairOrder,
  workBlock = null,
  technicians,
  selectedDate,
  onClose,
  onSaved,
}: ScheduleRepairOrderDialogProps) {
  const isReschedule = Boolean(workBlock);

  const defaultStart = workBlock
    ? new Date(workBlock.scheduledDate)
    : selectedDate;

  const defaultEnd = workBlock?.scheduledEnd
    ? new Date(workBlock.scheduledEnd)
    : null;

  const [technicianEmployeeId, setTechnicianEmployeeId] = useState(
    workBlock?.technicianEmployeeId ?? "",
  );

  const [date, setDate] = useState(toScheduleDateParam(defaultStart));

  const [time, setTime] = useState(
    workBlock ? toTimeValue(defaultStart) : "08:00",
  );

  const [duration, setDuration] = useState(
    defaultEnd ? getDurationHours(defaultStart, defaultEnd) : 2,
  );

  const [waitingCustomer, setWaitingCustomer] = useState(
    workBlock?.waitingCustomer ?? false,
  );

  const [notes, setNotes] = useState(workBlock?.notes ?? "");

  const [error, setError] = useState<string | null>(null);

  const [scheduleRepairOrder, { isLoading: scheduling }] =
    useScheduleRepairOrderMutation();

  const [rescheduleRepairOrder, { isLoading: rescheduling }] =
    useRescheduleRepairOrderMutation();

  //************************************************************** */

  if (!repairOrder) {
    return null;
  }

  const currentRepairOrder = repairOrder;

  const saving = scheduling || rescheduling;

  const start = combineDateAndTime(date, time);

  const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

  //************************************************************** */

  async function handleSubmit() {
    setError(null);

    if (!technicianEmployeeId) {
      setError("Select a technician.");

      return;
    }

    if (!Number.isFinite(duration) || duration < 0.5) {
      setError("Duration must be at least 0.5 hours.");

      return;
    }

    try {
      if (isReschedule) {
        await rescheduleRepairOrder({
          organizationId,

          repairOrderId: currentRepairOrder.id,

          data: {
            technicianEmployeeId,

            scheduledDate: start.toISOString(),

            scheduledEnd: end.toISOString(),

            waitingCustomer,

            notes: notes.trim() || undefined,
          },
        }).unwrap();
      } else {
        await scheduleRepairOrder({
          organizationId,

          repairOrderId: currentRepairOrder.id,

          data: {
            technicianEmployeeId,

            scheduledDate: start.toISOString(),

            scheduledEnd: end.toISOString(),

            waitingCustomer,

            notes: notes.trim() || undefined,
          },
        }).unwrap();
      }

      onSaved();
    } catch {
      setError(
        isReschedule
          ? "MotoDesk could not reschedule this repair order."
          : "MotoDesk could not schedule this repair order.",
      );
    }
  }

  //************************************************************** */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-zinc-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              {isReschedule ? "Reschedule" : "Schedule"} RO #
              {repairOrder.roNumber}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {getRepairOrderDescription(repairOrder)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <SummaryItem
              label="Status"
              value={repairOrder.status.toLowerCase().replaceAll("_", " ")}
            />

            <SummaryItem
              label="Priority"
              value={repairOrder.priority.toLowerCase()}
            />
          </div>

          <Field label="Technician">
            <select
              value={technicianEmployeeId}
              onChange={(event) => setTechnicianEmployeeId(event.target.value)}
              className={inputClassName}
            >
              <option value="">Select technician</option>

              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {getEmployeeDisplayName(technician)}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Start Time">
              <select
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className={inputClassName}
              >
                {createTimeOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Duration (hours)">
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={duration}
                onChange={(event) =>
                  setDuration(Math.max(0.5, Number(event.target.value) || 0.5))
                }
                className={inputClassName}
              />
            </Field>

            <Field label="End Time">
              <div className="flex h-10 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-700">
                {formatTime(end)}
              </div>
            </Field>
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3">
            <input
              type="checkbox"
              checked={waitingCustomer}
              onChange={(event) => setWaitingCustomer(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-orange-500"
            />

            <div>
              <p className="text-sm font-medium text-zinc-700">
                Waiting customer
              </p>

              <p className="text-xs text-zinc-400">
                Flag this job for a customer waiting on site.
              </p>
            </div>
          </label>

          <Field label="Schedule Notes">
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Optional schedule notes..."
              className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </Field>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !technicianEmployeeId}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}

            {isReschedule ? "Save Schedule" : "Schedule RO"}
          </button>
        </footer>
      </section>
    </div>
  );
}

//************************************************************** */

function Field({
  label,
  children,
}: {
  label: string;

  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-zinc-600">{label}</span>

      {children}
    </label>
  );
}

//************************************************************** */

function SummaryItem({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] text-zinc-400">{label}</p>

      <p className="mt-0.5 capitalize text-sm font-semibold text-zinc-700">
        {value}
      </p>
    </div>
  );
}

//************************************************************** */

const inputClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */

function combineDateAndTime(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);

  const [hour, minute] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

//************************************************************** */

function createTimeOptions() {
  const options: {
    value: string;

    label: string;
  }[] = [];

  for (let hour = 7; hour < 18; hour += 1) {
    for (const minute of [0, 30]) {
      const date = new Date(2000, 0, 1, hour, minute);

      options.push({
        value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,

        label: formatTime(date),
      });
    }
  }

  return options;
}

//************************************************************** */

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",

    minute: "2-digit",
  }).format(date);
}

//************************************************************** */

function toTimeValue(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

//************************************************************** */

function getDurationHours(start: Date, end: Date): number {
  const value = (end.getTime() - start.getTime()) / 3600000;

  return Math.max(0.5, Math.round(value * 2) / 2);
}

//************************************************************** */

function getRepairOrderDescription(
  repairOrder: ScheduleRepairOrderTarget,
): string {
  const customer =
    repairOrder.customer.companyName ??
    [repairOrder.customer.firstName, repairOrder.customer.lastName]
      .filter(Boolean)
      .join(" ");

  const vehicle = [
    repairOrder.vehicle.year,
    repairOrder.vehicle.make,
    repairOrder.vehicle.model,
  ]
    .filter(Boolean)
    .join(" ");

  return `${customer || "Unknown customer"} · ${vehicle || "No vehicle"}`;
}

//************************************************************** */
