"use client";

import { Eye, EyeOff, X } from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "@/store/api/employeesApi";

import type { Employee, EmployeeRole } from "../employee.types";

//************************************************************** */

type Props = {
  organizationId: string;

  employee?: Employee | null;

  open: boolean;

  onClose: () => void;
};

//************************************************************** */

const roles: Array<{
  value: EmployeeRole;

  label: string;
}> = [
  {
    value: "TECHNICIAN",

    label: "Technician",
  },
  {
    value: "SERVICE_ADVISOR",

    label: "Service Advisor",
  },
  {
    value: "SHOP_MANAGER",

    label: "Shop Manager",
  },
  {
    value: "CASHIER",

    label: "Cashier",
  },
  {
    value: "PARTS_SPECIALIST",

    label: "Parts Specialist",
  },
];

//************************************************************** */

export function EmployeeDialog({
  organizationId,
  employee = null,
  open,
  onClose,
}: Props) {
  const editing = Boolean(employee);

  const [firstName, setFirstName] = useState(employee?.firstName ?? "");

  const [lastName, setLastName] = useState(employee?.lastName ?? "");

  const [role, setRole] = useState<EmployeeRole>(
    employee?.role ?? "TECHNICIAN",
  );

  const [phone, setPhone] = useState(employee?.phone ?? "");

  const [email, setEmail] = useState(employee?.email ?? "");

  const [hourlyRate, setHourlyRate] = useState(employee?.hourlyRate ?? "0");

  const [laborRate, setLaborRate] = useState(employee?.laborRate ?? "0");

  const [hireDate, setHireDate] = useState(
    employee?.hireDate ? toDateInputValue(employee.hireDate) : "",
  );

  const [pin, setPin] = useState("");

  const [showPin, setShowPin] = useState(false);

  const [isSchedulable, setIsSchedulable] = useState(
    employee?.isSchedulable ?? true,
  );

  const [dailyStartTime, setDailyStartTime] = useState(
    employee?.dailyStartTime ?? "08:00",
  );

  const [dailyEndTime, setDailyEndTime] = useState(
    employee?.dailyEndTime ?? "17:00",
  );

  const [maxDailyHours, setMaxDailyHours] = useState(
    employee?.maxDailyHours ?? "8",
  );

  const [skills, setSkills] = useState(employee?.skills ?? "");

  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();

  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  const saving = isCreating || isUpdating;

  //************************************************************** */

  if (!open) {
    return null;
  }

  //************************************************************** */

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required.");

      return;
    }

    if (pin && !/^\d{4,8}$/.test(pin)) {
      toast.error("Time Clock PIN must contain 4 to 8 digits.");

      return;
    }

    const hourly = Number(hourlyRate);

    const labor = Number(laborRate);

    const maxHours = Number(maxDailyHours);

    if (!Number.isFinite(hourly) || hourly < 0) {
      toast.error("Hourly rate must be zero or greater.");

      return;
    }

    if (!Number.isFinite(labor) || labor < 0) {
      toast.error("Labor rate must be zero or greater.");

      return;
    }

    if (!Number.isFinite(maxHours) || maxHours <= 0 || maxHours > 24) {
      toast.error("Max daily hours must be between 0 and 24.");

      return;
    }

    //************************************************************** */

    try {
      if (editing && employee) {
        await updateEmployee({
          organizationId,

          employeeId: employee.id,

          data: {
            firstName: firstName.trim(),

            lastName: lastName.trim(),

            role,

            phone: phone.trim(),

            email: email.trim(),

            hourlyRate: hourly,

            laborRate: labor,

            ...(hireDate
              ? {
                  hireDate,
                }
              : {
                  hireDate: null,
                }),

            ...(pin
              ? {
                  pin,
                }
              : {}),

            isSchedulable,

            dailyStartTime,

            dailyEndTime,

            maxDailyHours: maxHours,

            skills: skills.trim(),
          },
        }).unwrap();

        toast.success("Employee updated.");
      } else {
        await createEmployee({
          organizationId,

          data: {
            firstName: firstName.trim(),

            lastName: lastName.trim(),

            role,

            ...(phone.trim()
              ? {
                  phone: phone.trim(),
                }
              : {}),

            ...(email.trim()
              ? {
                  email: email.trim(),
                }
              : {}),

            hourlyRate: hourly,

            laborRate: labor,

            ...(hireDate
              ? {
                  hireDate,
                }
              : {}),

            ...(pin
              ? {
                  pin,
                }
              : {}),

            isSchedulable,

            dailyStartTime,

            dailyEndTime,

            maxDailyHours: maxHours,

            ...(skills.trim()
              ? {
                  skills: skills.trim(),
                }
              : {}),
          },
        }).unwrap();

        toast.success("Employee added.");
      }

      onClose();
    } catch {
      toast.error(
        editing
          ? "MotoDesk could not update the employee."
          : "MotoDesk could not create the employee.",
      );
    }
  }

  //************************************************************** */

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              {editing ? "Edit Employee" : "Add Employee"}
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Employee details, labor settings, scheduling, and time-clock
              access.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-6 p-6">
          <section>
            <SectionTitle>Employee Details</SectionTitle>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="First Name" required>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className={inputClassName}
                />
              </Field>

              <Field label="Last Name" required>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className={inputClassName}
                />
              </Field>

              <Field label="Role" required>
                <select
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as EmployeeRole)
                  }
                  className={inputClassName}
                >
                  {roles.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Hire Date">
                <input
                  type="date"
                  value={hireDate}
                  onChange={(event) => setHireDate(event.target.value)}
                  className={inputClassName}
                />
              </Field>

              <Field label="Phone">
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClassName}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClassName}
                />
              </Field>
            </div>
          </section>

          <section>
            <SectionTitle>Compensation</SectionTitle>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Hourly Rate">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(event) => setHourlyRate(event.target.value)}
                  className={inputClassName}
                />
              </Field>

              <Field label="Labor Rate">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={laborRate}
                  onChange={(event) => setLaborRate(event.target.value)}
                  className={inputClassName}
                />
              </Field>
            </div>
          </section>

          <section>
            <SectionTitle>Scheduling</SectionTitle>

            <div className="mt-3 space-y-4">
              <label className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Available for scheduling
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    Allow this employee to be assigned in the scheduling module.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isSchedulable}
                  onChange={(event) => setIsSchedulable(event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Daily Start">
                  <input
                    type="time"
                    value={dailyStartTime}
                    onChange={(event) => setDailyStartTime(event.target.value)}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Daily End">
                  <input
                    type="time"
                    value={dailyEndTime}
                    onChange={(event) => setDailyEndTime(event.target.value)}
                    className={inputClassName}
                  />
                </Field>

                <Field label="Max Daily Hours">
                  <input
                    type="number"
                    min="0.25"
                    max="24"
                    step="0.25"
                    value={maxDailyHours}
                    onChange={(event) => setMaxDailyHours(event.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>Time Clock</SectionTitle>

            <div className="mt-3">
              <Field label="Time Clock PIN">
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={8}
                    value={pin}
                    onChange={(event) =>
                      setPin(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder={
                      editing && employee?.hasPin
                        ? "Enter a new PIN to replace the current PIN"
                        : "4–8 digit PIN"
                    }
                    className={`${inputClassName} pr-10`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPin((current) => !current)}
                    className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    {showPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {employee?.hasPin ? (
                  <p className="mt-1 text-xs font-medium text-emerald-600">
                    Time Clock PIN configured
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-zinc-500">
                    Optional now, but required for PIN-based Time Clock access.
                  </p>
                )}
              </Field>
            </div>
          </section>

          <section>
            <SectionTitle>Skills</SectionTitle>

            <div className="mt-3">
              <textarea
                rows={3}
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                placeholder="Diagnostics, electrical, engine repair..."
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </section>
        </div>

        <footer className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-6 py-4">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="h-10 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? "Saving..." : editing ? "Save Changes" : "Add Employee"}
          </button>
        </footer>
      </div>
    </div>
  );
}

//************************************************************** */

function Field({
  label,
  required = false,
  children,
}: {
  label: string;

  required?: boolean;

  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-zinc-700">
        {label}

        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>

      {children}
    </label>
  );
}

//************************************************************** */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
      {children}
    </h3>
  );
}

//************************************************************** */

function toDateInputValue(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

//************************************************************** */

const inputClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */
