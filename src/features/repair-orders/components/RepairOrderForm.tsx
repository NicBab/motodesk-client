"use client";

import { type FormEvent, useState } from "react";

import type {
  CreateRepairOrderInput,
  RepairOrderPriority,
} from "../repair-order.types";

import { RepairOrderCustomerVehicleSelect } from "./RepairOrderCustomerVehicleSelect";

export type RepairOrderFormValues = Omit<
  CreateRepairOrderInput,
  "organizationId"
>;

type RepairOrderFormProps = {
  organizationId: string;
  submitLabel: string;
  isSubmitting: boolean;

  onSubmit: (values: RepairOrderFormValues) => Promise<void>;

  onCancel: () => void;
};

const inputClasses =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

const selectClasses =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

const textareaClasses =
  "min-h-28 w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

export function RepairOrderForm({
  organizationId,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: RepairOrderFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError("Select a customer.");

      return;
    }

    if (!selectedVehicleId) {
      setError("Select a vehicle.");

      return;
    }

    const formData = new FormData(event.currentTarget);

    const values: RepairOrderFormValues = {
      customerId: selectedCustomerId,

      vehicleId: selectedVehicleId,

      priority: readPriority(formData, "priority"),

      scheduledDate: readOptional(formData, "scheduledDate"),

      promisedDate: readOptional(formData, "promisedDate"),

      complaint: readOptional(formData, "complaint"),

      notes: readOptional(formData, "notes"),
    };

    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">
            Customer and vehicle
          </h3>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Select the customer first, then choose one of their active vehicles.
          </p>
        </div>

        <RepairOrderCustomerVehicleSelect
          organizationId={organizationId}
          selectedCustomerId={selectedCustomerId}
          selectedVehicleId={selectedVehicleId}
          onCustomerChange={setSelectedCustomerId}
          onVehicleChange={setSelectedVehicleId}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900">Intake</h3>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-zinc-700">
            Priority
          </span>

          <select
            name="priority"
            defaultValue="STANDARD"
            className={selectClasses}
          >
            <option value="STANDARD">Standard</option>

            <option value="RUSH">Rush</option>

            <option value="EMERGENCY">Emergency</option>

            <option value="HOLD">Hold</option>
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Scheduled date"
            name="scheduledDate"
            type="datetime-local"
          />

          <Field
            label="Promised date"
            name="promisedDate"
            type="datetime-local"
          />
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-zinc-700">
            Customer complaint
          </span>

          <textarea
            name="complaint"
            maxLength={5000}
            placeholder="Describe the customer's concern or requested service..."
            className={textareaClasses}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-zinc-700">
            Internal notes
          </span>

          <textarea
            name="notes"
            maxLength={5000}
            placeholder="Internal service advisor notes..."
            className={textareaClasses}
          />
        </label>
      </section>

      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-10 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
};

function Field({ label, name, type = "text" }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-700">
        {label}

        <span className="text-[10px] font-medium text-zinc-400">Optional</span>
      </span>

      <input name={name} type={type} className={inputClasses} />
    </label>
  );
}

function readOptional(formData: FormData, name: string): string | undefined {
  const value = String(formData.get(name) ?? "").trim();

  return value || undefined;
}

function readPriority(formData: FormData, name: string): RepairOrderPriority {
  const value = String(formData.get(name) ?? "STANDARD");

  if (value === "RUSH" || value === "EMERGENCY" || value === "HOLD") {
    return value;
  }

  return "STANDARD";
}
