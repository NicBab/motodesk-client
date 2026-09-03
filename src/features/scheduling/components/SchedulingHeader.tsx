import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { formatSchedulingDate, toScheduleDateParam } from "../scheduling.utils";

//************************************************************** */

type SchedulingHeaderProps = {
  selectedDate: Date;

  onPreviousDay: () => void;

  onToday: () => void;

  onNextDay: () => void;

  onDateChange: (date: Date) => void;

  onCreateAppointment: () => void;
};

//************************************************************** */

export function SchedulingHeader({
  selectedDate,
  onPreviousDay,
  onToday,
  onNextDay,
  onDateChange,
  onCreateAppointment,
}: SchedulingHeaderProps) {
  //************************************************************** */

  function handleDateChange(value: string) {
    if (!value) {
      return;
    }

    const [year, month, day] = value.split("-").map(Number);

    onDateChange(new Date(year, month - 1, day));
  }

  //************************************************************** */

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Scheduling
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage appointments, dispatch technicians, and track shop capacity.
        </p>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPreviousDay}
            aria-label="Previous day"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onToday}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
          >
            Today
          </button>

          <button
            type="button"
            onClick={onNextDay}
            aria-label="Next day"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <label className="relative block md:w-52">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <input
            type="date"
            value={toScheduleDateParam(selectedDate)}
            onChange={(event) => handleDateChange(event.target.value)}
            aria-label="Scheduling date"
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm font-medium text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          />
        </label>

        <p className="text-sm font-medium text-zinc-600 md:ml-2">
          {formatSchedulingDate(selectedDate)}
        </p>

        <button
          type="button"
          onClick={onCreateAppointment}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 md:ml-auto"
        >
          <Plus className="h-4 w-4" />
          New Appointment
        </button>
      </div>
    </div>
  );
}

//************************************************************** */
