"use client";

import { useState } from "react";

import { X } from "lucide-react";

import type { ServiceAppointment } from "../scheduling.types";

//************************************************************** */

type CancelServiceAppointmentDialogProps = {
  appointment: ServiceAppointment | null;

  busy: boolean;

  onClose: () => void;

  onConfirm: (reason: string) => void;
};

//************************************************************** */

export function CancelServiceAppointmentDialog({
  appointment,
  busy,
  onClose,
  onConfirm,
}: CancelServiceAppointmentDialogProps) {
  const [reason, setReason] = useState("");

  if (!appointment) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-zinc-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              Cancel Appointment #{appointment.appointmentNumber}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {appointment.customerName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="px-5 py-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-zinc-600">
              Cancellation Reason
            </span>

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              placeholder="Optional reason..."
              className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
            />
          </label>
        </div>

        <footer className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Keep Appointment
          </button>

          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            disabled={busy}
            className="h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            Cancel Appointment
          </button>
        </footer>
      </section>
    </div>
  );
}

//************************************************************** */
