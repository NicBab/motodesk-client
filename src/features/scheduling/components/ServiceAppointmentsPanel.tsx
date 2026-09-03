"use client";

import {
  Check,
  ClipboardCheck,
  ExternalLink,
  Search,
  Wrench,
  XCircle,
} from "lucide-react";

import type {
  ServiceAppointment,
  ServiceAppointmentStatus,
} from "../scheduling.types";

import {
  formatScheduleStatus,
  formatSchedulingTime,
  formatServiceAppointmentType,
} from "../scheduling.utils";

//************************************************************** */

type ServiceAppointmentsPanelProps = {
  appointments: ServiceAppointment[];

  search: string;

  status: ServiceAppointmentStatus | "";

  busyAppointmentId: string | null;

  onSearchChange: (value: string) => void;

  onStatusChange: (value: ServiceAppointmentStatus | "") => void;

  onConfirm: (appointment: ServiceAppointment) => void;

  onCheckIn: (appointment: ServiceAppointment) => void;

  onCancel: (appointment: ServiceAppointment) => void;

  onConvert: (appointment: ServiceAppointment) => void;

  onOpenRepairOrder: (appointment: ServiceAppointment) => void;
};

//************************************************************** */

const statusOptions: ServiceAppointmentStatus[] = [
  "REQUESTED",
  "TENTATIVE",
  "CONFIRMED",
  "CHECKED_IN",
  "CONVERTED_TO_RO",
  "IN_SERVICE",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "RESCHEDULED",
];

//************************************************************** */

export function ServiceAppointmentsPanel({
  appointments,
  search,
  status,
  busyAppointmentId,
  onSearchChange,
  onStatusChange,
  onConfirm,
  onCheckIn,
  onCancel,
  onConvert,
  onOpenRepairOrder,
}: ServiceAppointmentsPanelProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center">
        <label className="relative block sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search appointments..."
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          />
        </label>

        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as ServiceAppointmentStatus | "")
          }
          className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
        >
          <option value="">All statuses</option>

          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {formatScheduleStatus(option)}
            </option>
          ))}
        </select>
      </header>

      {appointments.length === 0 ? (
        <div className="grid min-h-72 place-items-center p-8 text-center">
          <div>
            <p className="text-sm font-semibold text-zinc-700">
              No appointments found.
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Adjust the search or status filter, or create a new appointment.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {appointments.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              busy={busyAppointmentId === appointment.id}
              onConfirm={onConfirm}
              onCheckIn={onCheckIn}
              onCancel={onCancel}
              onConvert={onConvert}
              onOpenRepairOrder={onOpenRepairOrder}
            />
          ))}
        </div>
      )}
    </section>
  );
}

//************************************************************** */

function AppointmentRow({
  appointment,
  busy,
  onConfirm,
  onCheckIn,
  onCancel,
  onConvert,
  onOpenRepairOrder,
}: {
  appointment: ServiceAppointment;

  busy: boolean;

  onConfirm: (appointment: ServiceAppointment) => void;

  onCheckIn: (appointment: ServiceAppointment) => void;

  onCancel: (appointment: ServiceAppointment) => void;

  onConvert: (appointment: ServiceAppointment) => void;

  onOpenRepairOrder: (appointment: ServiceAppointment) => void;
}) {
  const vehicle = appointment.vehicle
    ? [
        appointment.vehicle.year,
        appointment.vehicle.make,
        appointment.vehicle.model,
      ]
        .filter(Boolean)
        .join(" ")
    : "No vehicle";

  return (
    <article className="space-y-3 p-4 transition hover:bg-zinc-50/70 lg:flex lg:items-center lg:gap-4 lg:space-y-0">
      <div className="min-w-0 lg:w-28 lg:shrink-0">
        <p className="text-sm font-bold text-zinc-900">
          #{appointment.appointmentNumber}
        </p>

        <p className="text-xs text-zinc-400">
          {formatSchedulingTime(appointment.scheduledStart)}
          {" – "}
          {formatSchedulingTime(appointment.scheduledEnd)}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-zinc-900">
            {appointment.customerName}
          </p>

          <StatusBadge status={appointment.status} />

          {appointment.waitingCustomer ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Waiting
            </span>
          ) : null}
        </div>

        <p className="mt-1 truncate text-xs text-zinc-500">
          {vehicle}
          {" · "}
          {formatServiceAppointmentType(appointment.appointmentType)}
        </p>

        <p className="mt-1 line-clamp-1 text-xs text-zinc-400">
          {appointment.requestedService}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 lg:max-w-[430px] lg:justify-end">
        {appointment.status === "REQUESTED" ? (
          <ActionButton
            label="Confirm"
            icon={<Check className="h-3.5 w-3.5" />}
            busy={busy}
            onClick={() => onConfirm(appointment)}
          />
        ) : null}

        {appointment.status === "CONFIRMED" ? (
          <ActionButton
            label="Check In"
            icon={<ClipboardCheck className="h-3.5 w-3.5" />}
            busy={busy}
            onClick={() => onCheckIn(appointment)}
          />
        ) : null}

        {(appointment.status === "CONFIRMED" ||
          appointment.status === "CHECKED_IN") &&
        !appointment.repairOrderId ? (
          <ActionButton
            label="Convert to RO"
            icon={<Wrench className="h-3.5 w-3.5" />}
            busy={busy}
            onClick={() => onConvert(appointment)}
            primary
          />
        ) : null}

        {appointment.repairOrderId ? (
          <ActionButton
            label={
              appointment.repairOrder
                ? `RO #${appointment.repairOrder.roNumber}`
                : "Open RO"
            }
            icon={<ExternalLink className="h-3.5 w-3.5" />}
            busy={busy}
            onClick={() => onOpenRepairOrder(appointment)}
          />
        ) : null}

        {!["CANCELLED", "CONVERTED_TO_RO", "COMPLETED"].includes(
          appointment.status,
        ) ? (
          <ActionButton
            label="Cancel"
            icon={<XCircle className="h-3.5 w-3.5" />}
            busy={busy}
            onClick={() => onCancel(appointment)}
            danger
          />
        ) : null}
      </div>
    </article>
  );
}

//************************************************************** */

function ActionButton({
  label,
  icon,
  busy,
  onClick,
  primary = false,
  danger = false,
}: {
  label: string;

  icon: React.ReactNode;

  busy: boolean;

  onClick: () => void;

  primary?: boolean;

  danger?: boolean;
}) {
  const style = primary
    ? "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
    : danger
      ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50";

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${style}`}
    >
      {icon}

      {label}
    </button>
  );
}

//************************************************************** */

function StatusBadge({ status }: { status: ServiceAppointmentStatus }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusClassName(
        status,
      )}`}
    >
      {formatScheduleStatus(status)}
    </span>
  );
}

//************************************************************** */

function getStatusClassName(status: ServiceAppointmentStatus): string {
  switch (status) {
    case "REQUESTED":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "TENTATIVE":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "CONFIRMED":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "CHECKED_IN":
    case "IN_SERVICE":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";

    case "CONVERTED_TO_RO":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "CANCELLED":
    case "NO_SHOW":
      return "border-red-200 bg-red-50 text-red-700";

    case "RESCHEDULED":
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-600";
  }
}

//************************************************************** */
