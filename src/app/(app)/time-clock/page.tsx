"use client";

import { Clock, LogIn, LogOut } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import { useGetEmployeesQuery } from "@/store/api/employeesApi";

import {
  useClockEmployeeInMutation,
  useClockEmployeeOutMutation,
  useGetCurrentlyClockedInQuery,
} from "@/store/api/timeClockApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

//************************************************************** */

export default function TimeClockPage() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [pin, setPin] = useState("");

  const [now, setNow] = useState(() => new Date());

  //************************************************************** */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  //************************************************************** */

  const { data: employees = [], isLoading: employeesLoading } =
    useGetEmployeesQuery(
      {
        organizationId: organizationId ?? "",

        status: "ACTIVE",
      },
      {
        skip: !organizationId,
      },
    );

  const { data: currentEntries = [], isLoading: currentLoading } =
    useGetCurrentlyClockedInQuery(
      {
        organizationId: organizationId ?? "",
      },
      {
        skip: !organizationId,
      },
    );

  const [clockEmployeeIn, { isLoading: isClockingIn }] =
    useClockEmployeeInMutation();

  const [clockEmployeeOut, { isLoading: isClockingOut }] =
    useClockEmployeeOutMutation();

  //************************************************************** */

  const processing = isClockingIn || isClockingOut;

  const selectedEmployee = useMemo(
    () =>
      employees.find((employee) => employee.id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId],
  );

  const activeEntry = useMemo(
    () =>
      currentEntries.find((entry) => entry.employeeId === selectedEmployeeId) ??
      null,
    [currentEntries, selectedEmployeeId],
  );

  //************************************************************** */

  function handleEmployeeChange(employeeId: string) {
    setSelectedEmployeeId(employeeId);

    setPin("");
  }

  //************************************************************** */

  async function handleClockIn() {
    if (!organizationId || !selectedEmployee) {
      toast.error("Select an employee.");

      return;
    }

    if (!selectedEmployee.hasPin) {
      toast.error("No Time Clock PIN is configured for this employee.");

      return;
    }

    if (!pin) {
      toast.error("Enter your Time Clock PIN.");

      return;
    }

    try {
      const entry = await clockEmployeeIn({
        organizationId,

        employeeId: selectedEmployee.id,

        pin,
      }).unwrap();

      toast.success(`Clocked in at ${formatTime(entry.clockInAt)}.`);

      clearKiosk();
    } catch {
      toast.error(
        "MotoDesk could not clock the employee in. Check the PIN and try again.",
      );
    }
  }

  //************************************************************** */

  async function handleClockOut() {
    if (!organizationId || !selectedEmployee) {
      toast.error("Select an employee.");

      return;
    }

    if (!pin) {
      toast.error("Enter your Time Clock PIN.");

      return;
    }

    try {
      const entry = await clockEmployeeOut({
        organizationId,

        employeeId: selectedEmployee.id,

        pin,
      }).unwrap();

      toast.success(
        `Clocked out. Shift duration: ${formatWorkedTime(
          entry.workedMinutes ?? 0,
        )}.`,
      );

      clearKiosk();
    } catch {
      toast.error(
        "MotoDesk could not clock the employee out. Check the PIN and try again.",
      );
    }
  }

  //************************************************************** */

  function clearKiosk() {
    setPin("");

    setSelectedEmployeeId("");
  }

  //************************************************************** */

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-50 text-orange-500">
          <Clock className="h-8 w-8" />
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">
          Time Clock
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          {formatCurrentDateTime(now)}
        </p>
      </header>

      <section className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-zinc-700">
            Employee
          </span>

          <select
            value={selectedEmployeeId}
            disabled={employeesLoading || processing}
            onChange={(event) => handleEmployeeChange(event.target.value)}
            className={inputClassName}
          >
            <option value="">Select employee...</option>

            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-zinc-700">
            PIN
          </span>

          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            value={pin}
            disabled={!selectedEmployeeId || processing}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
            placeholder="Enter PIN"
            className={`${inputClassName} text-center text-lg font-semibold tracking-[0.35em]`}
          />
        </label>

        {selectedEmployee ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center">
            {!selectedEmployee.hasPin ? (
              <p className="text-sm font-semibold text-amber-700">
                No Time Clock PIN configured
              </p>
            ) : activeEntry ? (
              <>
                <p className="text-sm font-semibold text-emerald-700">
                  ● Clocked In
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Since {formatTime(activeEntry.clockInAt)}
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-500">Not currently clocked in</p>
            )}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={
              !selectedEmployee || !pin || processing || Boolean(activeEntry)
            }
            onClick={() => void handleClockIn()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <LogIn className="h-4 w-4" />

            {isClockingIn ? "Clocking In..." : "Clock In"}
          </button>

          <button
            type="button"
            disabled={!selectedEmployee || !pin || processing || !activeEntry}
            onClick={() => void handleClockOut()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
          >
            <LogOut className="h-4 w-4" />

            {isClockingOut ? "Clocking Out..." : "Clock Out"}
          </button>
        </div>
      </section>

      {!currentLoading && currentEntries.length > 0 ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Currently Clocked In
            </h2>

            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
              {currentEntries.length}
            </span>
          </div>

          <div className="mt-3 divide-y divide-zinc-100">
            {currentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {entry.employeeName}
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    {formatRole(entry.employee.role)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-semibold text-emerald-700">
                    Clocked In
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    Since {formatTime(entry.clockInAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-center text-xs leading-relaxed text-zinc-400">
        Your PIN authenticates only the clock action. The current MotoDesk user
        remains signed in.
      </p>
    </div>
  );
}

//************************************************************** */

function formatCurrentDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",

    month: "long",

    day: "numeric",

    hour: "numeric",

    minute: "2-digit",
  }).format(value);
}

//************************************************************** */

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",

    minute: "2-digit",
  }).format(date);
}

//************************************************************** */

function formatWorkedTime(workedMinutes: number): string {
  const hours = Math.floor(workedMinutes / 60);

  const minutes = workedMinutes % 60;

  return `${hours}h ${minutes}m`;
}

//************************************************************** */

function formatRole(role: string): string {
  return role
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

const inputClassName =
  "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-zinc-100 disabled:text-zinc-500";

//************************************************************** */
