"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  FileClock,
  Plus,
  RotateCcw,
  Users,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import type { Employee } from "@/features/employees/employee.types";

import type {
  EmployeeTimeEntry,
  TimeClockReportRange,
} from "../time-clock.types";

import {
  useCorrectTimeEntryMutation,
  useCreateManualTimeEntryMutation,
  useGetTimeClockReportQuery,
} from "@/store/api/timeClockApi";

//************************************************************** */

type Props = {
  organizationId: string;

  employees: Employee[];
};

//************************************************************** */

const ranges: Array<{
  value: TimeClockReportRange;

  label: string;
}> = [
  {
    value: "DAILY",

    label: "Daily",
  },

  {
    value: "WEEKLY",

    label: "Weekly",
  },

  {
    value: "MONTHLY",

    label: "Monthly",
  },

  {
    value: "ANNUAL",

    label: "Annual",
  },

  {
    value: "CUSTOM",

    label: "Custom",
  },
];

//************************************************************** */

export function TimeAttendanceTab({ organizationId, employees }: Props) {
  const [range, setRange] = useState<TimeClockReportRange>("WEEKLY");

  const [employeeId, setEmployeeId] = useState("");

  const [includeInactive, setIncludeInactive] = useState(false);

  const [anchorDate, setAnchorDate] = useState(todayInput());

  const [customStart, setCustomStart] = useState(todayInput());

  const [customEnd, setCustomEnd] = useState(todayInput());

  const [manualOpen, setManualOpen] = useState(false);

  const [editingEntry, setEditingEntry] = useState<EmployeeTimeEntry | null>(
    null,
  );

  const [auditEntry, setAuditEntry] = useState<EmployeeTimeEntry | null>(null);

  //************************************************************** */

  const {
    data: report,
    isLoading,
    isFetching,
    isError,
  } = useGetTimeClockReportQuery({
    organizationId,

    range,

    ...(employeeId
      ? {
          employeeId,
        }
      : {}),

    includeInactive,

    ...(range === "CUSTOM"
      ? {
          startDate: customStart,

          endDate: customEnd,
        }
      : {
          anchorDate,
        }),
  });

  //************************************************************** */

  const visibleEmployees = useMemo(
    () =>
      includeInactive
        ? employees
        : employees.filter((employee) => employee.status === "ACTIVE"),
    [employees, includeInactive],
  );

  //************************************************************** */

  function moveRange(direction: -1 | 1) {
    if (range === "CUSTOM") {
      return;
    }

    const date = new Date(`${anchorDate}T12:00:00`);

    if (range === "DAILY") {
      date.setDate(date.getDate() + direction);
    }

    if (range === "WEEKLY") {
      date.setDate(date.getDate() + direction * 7);
    }

    if (range === "MONTHLY") {
      date.setMonth(date.getMonth() + direction);
    }

    if (range === "ANNUAL") {
      date.setFullYear(date.getFullYear() + direction);
    }

    setAnchorDate(toDateInput(date));
  }

  //************************************************************** */

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {ranges.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRange(option.value)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                range === option.value
                  ? "bg-orange-500 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto]">
          <select
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            className={inputClassName}
          >
            <option value="">All Employees</option>

            {visibleEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>

          {range === "CUSTOM" ? (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(event) => setCustomStart(event.target.value)}
                className={inputClassName}
              />

              <input
                type="date"
                value={customEnd}
                onChange={(event) => setCustomEnd(event.target.value)}
                className={inputClassName}
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => moveRange(-1)}
                className={navigationButtonClassName}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <input
                type="date"
                value={anchorDate}
                onChange={(event) => setAnchorDate(event.target.value)}
                className={`${inputClassName} flex-1`}
              />

              <button
                type="button"
                onClick={() => moveRange(1)}
                className={navigationButtonClassName}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setManualOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Add Time Entry
          </button>
        </div>

        <label className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(event) => setIncludeInactive(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Include inactive employees
        </label>
      </section>

      {isLoading ? (
        <PanelMessage>Loading time and attendance...</PanelMessage>
      ) : isError || !report ? (
        <PanelMessage>
          MotoDesk could not load time and attendance.
        </PanelMessage>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                {formatDateRange(report.startDate, report.endDate)}
              </p>

              <p className="mt-0.5 text-xs text-zinc-500">
                {formatLabel(report.range)} attendance
              </p>
            </div>

            {isFetching ? (
              <span className="text-xs text-zinc-400">Updating...</span>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={Clock3}
              label="Worked Hours"
              value={`${report.summary.workedHours.toFixed(2)} hrs`}
            />

            <Metric
              icon={Users}
              label="Employees"
              value={String(report.summary.employeeCount)}
            />

            <Metric
              icon={FileClock}
              label="Time Entries"
              value={String(report.summary.entryCount)}
            />

            <Metric
              icon={RotateCcw}
              label="Corrections"
              value={String(report.summary.correctedEntries)}
            />
          </div>

          <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-4 py-3">
              <h3 className="text-sm font-bold text-zinc-900">
                Employee Summary
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <Heading>Employee</Heading>

                    <Heading>Role</Heading>

                    <Heading align="right">Entries</Heading>

                    <Heading align="right">Worked</Heading>

                    <Heading align="right">Hourly Rate</Heading>
                  </tr>
                </thead>

                <tbody>
                  {report.employeeSummary.map((item) => (
                    <tr
                      key={item.employeeId}
                      className="border-b border-zinc-100 last:border-b-0"
                    >
                      <Cell strong>
                        {item.firstName} {item.lastName}
                      </Cell>

                      <Cell>{formatLabel(item.role)}</Cell>

                      <Cell align="right">{item.entryCount}</Cell>

                      <Cell align="right">
                        <span className="font-semibold text-zinc-900">
                          {formatMinutes(item.workedMinutes)}
                        </span>
                      </Cell>

                      <Cell align="right">
                        {formatCurrency(Number(item.hourlyRate))}
                      </Cell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-4 py-3">
              <h3 className="text-sm font-bold text-zinc-900">Time Entries</h3>
            </div>

            {report.entries.length === 0 ? (
              <PanelMessage>No time entries in this period.</PanelMessage>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <Heading>Employee</Heading>

                      <Heading>Date</Heading>

                      <Heading>Clock In</Heading>

                      <Heading>Clock Out</Heading>

                      <Heading align="right">Break</Heading>

                      <Heading align="right">Worked</Heading>

                      <Heading>Source</Heading>

                      <Heading>Audit</Heading>

                      <Heading align="right">Action</Heading>
                    </tr>
                  </thead>

                  <tbody>
                    {report.entries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-zinc-100 last:border-b-0"
                      >
                        <Cell strong>{entry.employeeName}</Cell>

                        <Cell>{formatDate(entry.clockInAt)}</Cell>

                        <Cell>{formatTime(entry.clockInAt)}</Cell>

                        <Cell>
                          {entry.clockOutAt
                            ? formatTime(entry.clockOutAt)
                            : "Active"}
                        </Cell>

                        <Cell align="right">
                          {formatMinutes(entry.breakMinutes)}
                        </Cell>

                        <Cell align="right">
                          <span className="font-semibold text-zinc-900">
                            {entry.workedMinutes !== null
                              ? formatMinutes(entry.workedMinutes)
                              : "Active"}
                          </span>
                        </Cell>

                        <Cell>{formatLabel(entry.source)}</Cell>

                        <Cell>
                          {entry.corrections.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setAuditEntry(entry)}
                              className="text-xs font-semibold text-orange-600 hover:underline"
                            >
                              {entry.corrections.length} change
                              {entry.corrections.length === 1 ? "" : "s"}
                            </button>
                          ) : (
                            <span className="text-xs text-zinc-400">—</span>
                          )}
                        </Cell>

                        <Cell align="right">
                          <button
                            type="button"
                            onClick={() => setEditingEntry(entry)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Correct
                          </button>
                        </Cell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {manualOpen ? (
        <ManualEntryDialog
          organizationId={organizationId}
          employees={visibleEmployees}
          defaultEmployeeId={employeeId}
          onClose={() => setManualOpen(false)}
        />
      ) : null}

      {editingEntry ? (
        <CorrectionDialog
          organizationId={organizationId}
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
        />
      ) : null}

      {auditEntry ? (
        <AuditDialog entry={auditEntry} onClose={() => setAuditEntry(null)} />
      ) : null}
    </div>
  );
}

//************************************************************** */

function ManualEntryDialog({
  organizationId,
  employees,
  defaultEmployeeId,
  onClose,
}: {
  organizationId: string;

  employees: Employee[];

  defaultEmployeeId: string;

  onClose: () => void;
}) {
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId);

  const [clockInAt, setClockInAt] = useState("");

  const [clockOutAt, setClockOutAt] = useState("");

  const [breakMinutes, setBreakMinutes] = useState("0");

  const [notes, setNotes] = useState("");

  const [reason, setReason] = useState("");

  const [createManualEntry, { isLoading }] = useCreateManualTimeEntryMutation();

  //************************************************************** */

  async function handleSave() {
    if (!employeeId || !clockInAt || !clockOutAt) {
      toast.error("Employee, clock-in, and clock-out are required.");

      return;
    }

    if (!reason.trim()) {
      toast.error("A reason is required.");

      return;
    }

    try {
      await createManualEntry({
        organizationId,

        employeeId,

        clockInAt: new Date(clockInAt).toISOString(),

        clockOutAt: new Date(clockOutAt).toISOString(),

        breakMinutes: Number(breakMinutes) || 0,

        ...(notes.trim()
          ? {
              notes: notes.trim(),
            }
          : {}),

        reason: reason.trim(),
      }).unwrap();

      toast.success("Time entry added.");

      onClose();
    } catch {
      toast.error("MotoDesk could not add the time entry.");
    }
  }

  //************************************************************** */

  return (
    <DialogShell title="Add Time Entry" busy={isLoading} onClose={onClose}>
      <Field label="Employee">
        <select
          value={employeeId}
          onChange={(event) => setEmployeeId(event.target.value)}
          className={inputClassName}
        >
          <option value="">Select employee...</option>

          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.firstName} {employee.lastName}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Clock In">
          <input
            type="datetime-local"
            value={clockInAt}
            onChange={(event) => setClockInAt(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Clock Out">
          <input
            type="datetime-local"
            value={clockOutAt}
            onChange={(event) => setClockOutAt(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Break Minutes">
          <input
            type="number"
            min="0"
            value={breakMinutes}
            onChange={(event) => setBreakMinutes(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Notes">
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={inputClassName}
          />
        </Field>
      </div>

      <Field label="Reason">
        <textarea
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className={textareaClassName}
        />
      </Field>

      <DialogFooter
        busy={isLoading}
        saveLabel="Add Entry"
        onCancel={onClose}
        onSave={() => void handleSave()}
      />
    </DialogShell>
  );
}

//************************************************************** */

function CorrectionDialog({
  organizationId,
  entry,
  onClose,
}: {
  organizationId: string;

  entry: EmployeeTimeEntry;

  onClose: () => void;
}) {
  const [clockInAt, setClockInAt] = useState(toLocalInput(entry.clockInAt));

  const [clockOutAt, setClockOutAt] = useState(
    entry.clockOutAt ? toLocalInput(entry.clockOutAt) : "",
  );

  const [breakMinutes, setBreakMinutes] = useState(String(entry.breakMinutes));

  const [notes, setNotes] = useState(entry.notes ?? "");

  const [reason, setReason] = useState("");

  const [correctEntry, { isLoading }] = useCorrectTimeEntryMutation();

  //************************************************************** */

  async function handleSave() {
    if (!reason.trim()) {
      toast.error("A correction reason is required.");

      return;
    }

    try {
      await correctEntry({
        organizationId,

        timeEntryId: entry.id,

        employeeId: entry.employeeId,

        clockInAt: new Date(clockInAt).toISOString(),

        clockOutAt: clockOutAt ? new Date(clockOutAt).toISOString() : null,

        breakMinutes: Number(breakMinutes) || 0,

        notes: notes.trim() || null,

        reason: reason.trim(),
      }).unwrap();

      toast.success("Time entry corrected.");

      onClose();
    } catch {
      toast.error("MotoDesk could not correct the time entry.");
    }
  }

  //************************************************************** */

  return (
    <DialogShell title="Correct Time Entry" busy={isLoading} onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Clock In">
          <input
            type="datetime-local"
            value={clockInAt}
            onChange={(event) => setClockInAt(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Clock Out">
          <input
            type="datetime-local"
            value={clockOutAt}
            onChange={(event) => setClockOutAt(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Break Minutes">
          <input
            type="number"
            min="0"
            value={breakMinutes}
            onChange={(event) => setBreakMinutes(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Notes">
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={inputClassName}
          />
        </Field>
      </div>

      <Field label="Correction Reason">
        <textarea
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className={textareaClassName}
        />
      </Field>

      <DialogFooter
        busy={isLoading}
        saveLabel="Save Correction"
        onCancel={onClose}
        onSave={() => void handleSave()}
      />
    </DialogShell>
  );
}

//************************************************************** */

function AuditDialog({
  entry,
  onClose,
}: {
  entry: EmployeeTimeEntry;

  onClose: () => void;
}) {
  return (
    <DialogShell title="Correction History" busy={false} onClose={onClose}>
      <div>
        <p className="text-sm font-semibold text-zinc-900">
          {entry.employeeName}
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          {formatDate(entry.clockInAt)}
        </p>
      </div>

      {entry.corrections.length === 0 ? (
        <PanelMessage>No corrections recorded.</PanelMessage>
      ) : (
        <div className="space-y-3">
          {entry.corrections.map((correction) => (
            <div
              key={correction.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-bold text-zinc-900">
                  {formatLabel(correction.field)}
                </p>

                <p className="text-xs text-zinc-400">
                  {formatDateTime(correction.changedAt)}
                </p>
              </div>

              {correction.field !== "MANUAL_ENTRY" ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <AuditValue
                    label="Original"
                    value={correction.originalValue}
                  />

                  <AuditValue label="Updated" value={correction.updatedValue} />
                </div>
              ) : null}

              <p className="mt-3 text-xs text-zinc-600">
                <span className="font-bold">Reason:</span> {correction.reason}
              </p>

              {correction.managerName ? (
                <p className="mt-1 text-xs text-zinc-500">
                  Changed by {correction.managerName}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </DialogShell>
  );
}

//************************************************************** */

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;

  label: string;

  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon className="h-4 w-4" />

        <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
      </div>

      <p className="mt-2 text-xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}

//************************************************************** */

function AuditValue({
  label,
  value,
}: {
  label: string;

  value: string | null;
}) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
        {label}
      </p>

      <p className="mt-1 wrap-break-word text-xs text-zinc-700">{value ?? "—"}</p>
    </div>
  );
}

//************************************************************** */

function DialogShell({
  title,
  busy,
  onClose,
  children,
}: {
  title: string;

  busy: boolean;

  onClose: () => void;

  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-orange-500" />

            <h2 className="font-bold text-zinc-900">{title}</h2>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 p-6">{children}</div>
      </div>
    </div>
  );
}

//************************************************************** */

function DialogFooter({
  busy,
  saveLabel,
  onCancel,
  onSave,
}: {
  busy: boolean;

  saveLabel: string;

  onCancel: () => void;

  onSave: () => void;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4">
      <button
        type="button"
        disabled={busy}
        onClick={onCancel}
        className="h-10 rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700"
      >
        Cancel
      </button>

      <button
        type="button"
        disabled={busy}
        onClick={onSave}
        className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {busy ? "Saving..." : saveLabel}
      </button>
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
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-zinc-700">
        {label}
      </span>

      {children}
    </label>
  );
}

//************************************************************** */

function PanelMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-40 place-items-center p-6 text-center text-sm text-zinc-500">
      {children}
    </div>
  );
}

//************************************************************** */

function Heading({
  children,
  align = "left",
}: {
  children: React.ReactNode;

  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

//************************************************************** */

function Cell({
  children,
  align = "left",
  strong = false,
}: {
  children: React.ReactNode;

  align?: "left" | "right";

  strong?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 text-sm text-zinc-700 ${
        align === "right" ? "text-right" : "text-left"
      } ${strong ? "font-semibold text-zinc-900" : ""}`}
    >
      {children}
    </td>
  );
}

//************************************************************** */

function todayInput(): string {
  return toDateInput(new Date());
}

//************************************************************** */

function toDateInput(date: Date): string {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

//************************************************************** */

function toLocalInput(value: string): string {
  const date = new Date(value);

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 16);
}

//************************************************************** */

function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

//************************************************************** */

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

//************************************************************** */

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",

    minute: "2-digit",
  }).format(new Date(value));
}

//************************************************************** */

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",

    timeStyle: "short",
  }).format(new Date(value));
}

//************************************************************** */

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);

  const remainder = minutes % 60;

  return `${hours}h ${remainder}m`;
}

//************************************************************** */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",

    currency: "USD",
  }).format(value);
}

//************************************************************** */

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

const inputClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

const textareaClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

const navigationButtonClassName =
  "grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50";

//************************************************************** */
