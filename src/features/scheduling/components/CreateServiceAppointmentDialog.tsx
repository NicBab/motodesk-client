"use client";

import { useMemo, useState } from "react";

import { Loader2, X } from "lucide-react";

import type { Customer } from "@/features/customers/customer.types";

import type { Employee } from "@/features/employees/employee.types";

import type { Vehicle } from "@/features/vehicles/vehicle.types";

import { useGetCustomersQuery } from "@/store/api/customersApi";

import { useGetEmployeesQuery } from "@/store/api/employeesApi";

import { useCreateServiceAppointmentMutation } from "@/store/api/schedulingApi";

import { useGetVehiclesQuery } from "@/store/api/vehiclesApi";

import type {
  ServiceAppointmentContactMethod,
  ServiceAppointmentType,
} from "../scheduling.types";

import {
  formatServiceAppointmentType,
  toScheduleDateParam,
} from "../scheduling.utils";

//************************************************************** */

type CreateServiceAppointmentDialogProps = {
  organizationId: string;

  selectedDate: Date;

  onClose: () => void;

  onCreated: () => void;
};

//************************************************************** */

const appointmentTypes: ServiceAppointmentType[] = [
  "DROP_OFF",
  "WAITING_CUSTOMER",
  "PICKUP_AND_DELIVERY",
  "MOBILE_SERVICE",
  "INTERNAL_WORK",
  "WALK_IN",
  "PRE_DELIVERY_INSPECTION",
  "WARRANTY",
  "RECALL",
];

const contactMethods: ServiceAppointmentContactMethod[] = [
  "PHONE",
  "SMS",
  "EMAIL",
  "IN_PERSON",
];

//************************************************************** */

export function CreateServiceAppointmentDialog({
  organizationId,
  selectedDate,
  onClose,
  onCreated,
}: CreateServiceAppointmentDialogProps) {
  const [customerSearch, setCustomerSearch] = useState("");

  const [customerId, setCustomerId] = useState("");

  const [vehicleId, setVehicleId] = useState("");

  const [appointmentType, setAppointmentType] =
    useState<ServiceAppointmentType>("DROP_OFF");

  const [requestedService, setRequestedService] = useState("");

  const [customerComplaint, setCustomerComplaint] = useState("");

  const [date, setDate] = useState(toScheduleDateParam(selectedDate));

  const [time, setTime] = useState("08:00");

  const [durationMinutes, setDurationMinutes] = useState(60);

  const [preferredTechnicianEmployeeId, setPreferredTechnicianEmployeeId] =
    useState("");

  const [serviceAdvisorEmployeeId, setServiceAdvisorEmployeeId] = useState("");

  const [waitingCustomer, setWaitingCustomer] = useState(false);

  const [transportationNeeded, setTransportationNeeded] = useState(false);

  const [contactMethod, setContactMethod] = useState<
    ServiceAppointmentContactMethod | ""
  >("");

  const [internalNotes, setInternalNotes] = useState("");

  const [error, setError] = useState<string | null>(null);

  //************************************************************** */

  const { data: customers = [] } = useGetCustomersQuery({
    organizationId,

    search: customerSearch || undefined,

    isActive: true,
  });

  const { data: vehicles = [] } = useGetVehiclesQuery(
    {
      organizationId,

      customerId: customerId || undefined,

      isActive: true,
    },
    {
      skip: !customerId,
    },
  );

  const { data: employees = [] } = useGetEmployeesQuery({
    organizationId,

    status: "ACTIVE",
  });

  const technicians = useMemo(
    () => employees.filter((employee) => employee.role === "TECHNICIAN"),
    [employees],
  );

  const advisors = useMemo(
    () =>
      employees.filter(
        (employee) =>
          employee.role === "SERVICE_ADVISOR" ||
          employee.role === "SHOP_MANAGER",
      ),
    [employees],
  );

  const [createAppointment, { isLoading: saving }] =
    useCreateServiceAppointmentMutation();

  //************************************************************** */

  const walkIn = appointmentType === "WALK_IN";

  const start = combineDateAndTime(date, time);

  const end = new Date(start.getTime() + durationMinutes * 60000);

  //************************************************************** */

  function handleCustomerChange(value: string) {
    setCustomerId(value);

    setVehicleId("");
  }

  //************************************************************** */

  async function handleSubmit() {
    setError(null);

    if (!requestedService.trim()) {
      setError("Requested service is required.");

      return;
    }

    if (!walkIn && !customerId) {
      setError("Select a customer or choose Walk In.");

      return;
    }

    try {
      await createAppointment({
        organizationId,

        data: {
          customerId: customerId || undefined,

          vehicleId: vehicleId || undefined,

          appointmentType,

          requestedService: requestedService.trim(),

          customerComplaint: customerComplaint.trim() || undefined,

          scheduledStart: start.toISOString(),

          scheduledEnd: end.toISOString(),

          estimatedDurationMinutes: durationMinutes,

          preferredTechnicianEmployeeId:
            preferredTechnicianEmployeeId || undefined,

          serviceAdvisorEmployeeId: serviceAdvisorEmployeeId || undefined,

          waitingCustomer,

          transportationNeeded,

          contactMethod: contactMethod || undefined,

          internalNotes: internalNotes.trim() || undefined,
        },
      }).unwrap();

      onCreated();
    } catch {
      setError("MotoDesk could not create this appointment.");
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
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-zinc-100 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              New Service Appointment
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Reserve service intake time without requiring a repair order.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 px-5 py-5">
          <Field label="Appointment Type">
            <select
              value={appointmentType}
              onChange={(event) => {
                const value = event.target.value as ServiceAppointmentType;

                setAppointmentType(value);

                if (value === "WALK_IN") {
                  setCustomerId("");

                  setVehicleId("");
                }

                if (value === "WAITING_CUSTOMER") {
                  setWaitingCustomer(true);
                }
              }}
              className={inputClassName}
            >
              {appointmentTypes.map((option) => (
                <option key={option} value={option}>
                  {formatServiceAppointmentType(option)}
                </option>
              ))}
            </select>
          </Field>

          {!walkIn ? (
            <>
              <Field label="Customer Search">
                <input
                  type="search"
                  value={customerSearch}
                  onChange={(event) => setCustomerSearch(event.target.value)}
                  placeholder="Search customer name, phone, or email..."
                  className={inputClassName}
                />
              </Field>

              <Field label="Customer">
                <select
                  value={customerId}
                  onChange={(event) => handleCustomerChange(event.target.value)}
                  className={inputClassName}
                >
                  <option value="">Select customer</option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {getCustomerName(customer)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Vehicle">
                <select
                  value={vehicleId}
                  onChange={(event) => setVehicleId(event.target.value)}
                  disabled={!customerId}
                  className={inputClassName}
                >
                  <option value="">Select vehicle</option>

                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {getVehicleName(vehicle)}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Walk-in appointments can be created without a customer or vehicle.
              A customer and vehicle will be required before converting the
              appointment into an RO.
            </div>
          )}

          <Field label="Requested Service">
            <textarea
              value={requestedService}
              onChange={(event) => setRequestedService(event.target.value)}
              rows={2}
              placeholder="What service is being requested?"
              className={textareaClassName}
            />
          </Field>

          <Field label="Customer Complaint">
            <textarea
              value={customerComplaint}
              onChange={(event) => setCustomerComplaint(event.target.value)}
              rows={2}
              placeholder="Customer-reported concern..."
              className={textareaClassName}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
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

            <Field label="Duration">
              <select
                value={durationMinutes}
                onChange={(event) =>
                  setDurationMinutes(Number(event.target.value))
                }
                className={inputClassName}
              >
                <option value={30}>30 minutes</option>

                <option value={60}>1 hour</option>

                <option value={90}>1.5 hours</option>

                <option value={120}>2 hours</option>

                <option value={180}>3 hours</option>

                <option value={240}>4 hours</option>
              </select>
            </Field>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            Scheduled end:{" "}
            <span className="font-semibold text-zinc-800">
              {formatTime(end)}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Service Advisor">
              <select
                value={serviceAdvisorEmployeeId}
                onChange={(event) =>
                  setServiceAdvisorEmployeeId(event.target.value)
                }
                className={inputClassName}
              >
                <option value="">No advisor assigned</option>

                {advisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>
                    {getEmployeeName(advisor)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Preferred Technician">
              <select
                value={preferredTechnicianEmployeeId}
                onChange={(event) =>
                  setPreferredTechnicianEmployeeId(event.target.value)
                }
                className={inputClassName}
              >
                <option value="">No preference</option>

                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {getEmployeeName(technician)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <CheckOption
              checked={waitingCustomer}
              label="Waiting customer"
              description="Customer plans to wait at the shop."
              onChange={setWaitingCustomer}
            />

            <CheckOption
              checked={transportationNeeded}
              label="Transportation needed"
              description="Customer needs alternate transportation."
              onChange={setTransportationNeeded}
            />
          </div>

          <Field label="Preferred Contact Method">
            <select
              value={contactMethod}
              onChange={(event) =>
                setContactMethod(
                  event.target.value as ServiceAppointmentContactMethod | "",
                )
              }
              className={inputClassName}
            >
              <option value="">Not specified</option>

              {contactMethods.map((method) => (
                <option key={method} value={method}>
                  {formatServiceAppointmentType(method)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Internal Notes">
            <textarea
              value={internalNotes}
              onChange={(event) => setInternalNotes(event.target.value)}
              rows={3}
              placeholder="Internal scheduling notes..."
              className={textareaClassName}
            />
          </Field>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-zinc-100 bg-white px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create Appointment
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

function CheckOption({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean;

  label: string;

  description: string;

  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex gap-3 rounded-lg border border-zinc-200 p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-orange-500"
      />

      <span>
        <span className="block text-sm font-medium text-zinc-700">{label}</span>

        <span className="block text-xs text-zinc-400">{description}</span>
      </span>
    </label>
  );
}

//************************************************************** */

const inputClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-zinc-100 disabled:text-zinc-400";

const textareaClassName =
  "w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */

function getCustomerName(customer: Customer): string {
  return (
    customer.companyName ??
    ([customer.firstName, customer.lastName].filter(Boolean).join(" ").trim() ||
      "Unnamed customer")
  );
}

//************************************************************** */

function getVehicleName(vehicle: Vehicle): string {
  return (
    [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
      .filter(Boolean)
      .join(" ")
      .trim() || "Unnamed vehicle"
  );
}

//************************************************************** */

function getEmployeeName(employee: Employee): string {
  return (
    [employee.firstName, employee.lastName].filter(Boolean).join(" ").trim() ||
    "Unnamed employee"
  );
}

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
