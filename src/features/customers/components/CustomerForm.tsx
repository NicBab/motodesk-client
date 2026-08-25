//************************************************************** */

"use client";

import { type FormEvent, useState } from "react";

import type {
  Customer,
  CustomerType,
  CreateCustomerInput,
  UpdateCustomerData,
} from "../customer.types";

//************************************************************** */

export type CustomerFormValues = Omit<CreateCustomerInput, "organizationId">;

//************************************************************** */

type CustomerFormProps = {
  customer?: Customer;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: CustomerFormValues | UpdateCustomerData) => Promise<void>;
  onCancel: () => void;
};

//************************************************************** */

const inputClasses =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */

const textareaClasses =
  "min-h-28 w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */

export function CustomerForm({
  customer,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const [customerType, setCustomerType] = useState<CustomerType>(
    customer?.type ?? "INDIVIDUAL",
  );

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    const firstName = readOptional(formData, "firstName");

    const lastName = readOptional(formData, "lastName");

    const companyName = readOptional(formData, "companyName");

    if (customerType === "INDIVIDUAL" && !firstName && !lastName) {
      setError("Enter at least a first or last name.");

      return;
    }

    if (customerType === "BUSINESS" && !companyName) {
      setError("Enter a company name.");

      return;
    }

    const values: CustomerFormValues = {
      type: customerType,

      firstName,
      lastName,
      companyName,

      email: readOptional(formData, "email"),

      phone: readOptional(formData, "phone"),

      alternatePhone: readOptional(formData, "alternatePhone"),

      addressLine1: readOptional(formData, "addressLine1"),

      addressLine2: readOptional(formData, "addressLine2"),

      city: readOptional(formData, "city"),

      state: readOptional(formData, "state"),

      postalCode: readOptional(formData, "postalCode"),

      country: readOptional(formData, "country"),

      notes: readOptional(formData, "notes"),
    };

    await onSubmit(values);
  }

  //************************************************************** */

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
          <h3 className="text-sm font-semibold text-zinc-900">Customer type</h3>

          <p className="mt-1 text-xs text-zinc-500">
            Choose whether this customer is an individual or business.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCustomerType("INDIVIDUAL")}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              customerType === "INDIVIDUAL"
                ? "border-orange-500 bg-orange-50"
                : "border-zinc-200 bg-white hover:bg-zinc-50"
            }`}
          >
            <span className="block text-sm font-semibold text-zinc-900">
              Individual
            </span>

            <span className="mt-1 block text-xs text-zinc-500">
              Personal customer
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCustomerType("BUSINESS")}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              customerType === "BUSINESS"
                ? "border-orange-500 bg-orange-50"
                : "border-zinc-200 bg-white hover:bg-zinc-50"
            }`}
          >
            <span className="block text-sm font-semibold text-zinc-900">
              Business
            </span>

            <span className="mt-1 block text-xs text-zinc-500">
              Commercial account
            </span>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900">
          Customer information
        </h3>

        {customerType === "INDIVIDUAL" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="First name"
              name="firstName"
              defaultValue={customer?.firstName ?? ""}
            />

            <Field
              label="Last name"
              name="lastName"
              defaultValue={customer?.lastName ?? ""}
            />
          </div>
        ) : (
          <Field
            label="Company name"
            name="companyName"
            defaultValue={customer?.companyName ?? ""}
            required
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Email"
            name="email"
            type="email"
            defaultValue={customer?.email ?? ""}
          />

          <Field
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={customer?.phone ?? ""}
          />
        </div>

        <Field
          label="Alternate phone"
          name="alternatePhone"
          type="tel"
          defaultValue={customer?.alternatePhone ?? ""}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900">Address</h3>

        <Field
          label="Address line 1"
          name="addressLine1"
          defaultValue={customer?.addressLine1 ?? ""}
        />

        <Field
          label="Address line 2"
          name="addressLine2"
          defaultValue={customer?.addressLine2 ?? ""}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" name="city" defaultValue={customer?.city ?? ""} />

          <Field
            label="State"
            name="state"
            defaultValue={customer?.state ?? ""}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Postal code"
            name="postalCode"
            defaultValue={customer?.postalCode ?? ""}
          />

          <Field
            label="Country"
            name="country"
            defaultValue={customer?.country ?? ""}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900">Notes</h3>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-zinc-700">
            Internal notes
          </span>

          <textarea
            name="notes"
            defaultValue={customer?.notes ?? ""}
            maxLength={5000}
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
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

//************************************************************** */

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
};

//************************************************************** */

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-700">
        {label}

        {!required ? (
          <span className="text-[10px] font-medium text-zinc-400">
            Optional
          </span>
        ) : null}
      </span>

      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className={inputClasses}
      />
    </label>
  );
}

//************************************************************** */

function readOptional(formData: FormData, name: string): string | undefined {
  const value = String(formData.get(name) ?? "").trim();

  return value || undefined;
}

//************************************************************** */
