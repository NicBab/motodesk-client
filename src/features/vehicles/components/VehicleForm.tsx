//************************************************************** */

"use client";

import {
  type FormEvent,
  useState,
} from "react";

import type {
  CreateVehicleInput,
  UpdateVehicleData,
  Vehicle,
  VehicleClassification,
  VehicleInventoryStatus,
  VehicleType,
} from "../vehicle.types";

import {
  VehicleCustomerSelect,
} from "./VehicleCustomerSelect";

//************************************************************** */

export type VehicleFormValues = Omit<
  CreateVehicleInput,
  "organizationId"
>;

//************************************************************** */

type VehicleFormProps = {
  organizationId: string;
  vehicle?: Vehicle;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (
    values:
      | VehicleFormValues
      | UpdateVehicleData,
  ) => Promise<void>;
  onCancel: () => void;
};

//************************************************************** */

const inputClasses =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

const selectClasses =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

const textareaClasses =
  "min-h-28 w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */

export function VehicleForm({
  organizationId,
  vehicle,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: VehicleFormProps) {
  const [error, setError] =
    useState<string | null>(null);
//************************************************************** */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    const formData =
      new FormData(event.currentTarget);

    const make = readRequired(
      formData,
      "make",
    );

    const model = readRequired(
      formData,
      "model",
    );

    if (!make || !model) {
      setError(
        "Make and model are required.",
      );

      return;
    }

    const values: VehicleFormValues = {
      customerId: readOptional(
        formData,
        "customerId",
      ),

      year: readOptionalNumber(
        formData,
        "year",
      ),

      make,
      model,

      trim: readOptional(
        formData,
        "trim",
      ),

      vin: readOptional(
        formData,
        "vin",
      ),

      mileage: readOptionalNumber(
        formData,
        "mileage",
      ),

      color: readOptional(
        formData,
        "color",
      ),

      licensePlate: readOptional(
        formData,
        "licensePlate",
      ),

      type:
        readOptional(
          formData,
          "type",
        ) as VehicleType | undefined,

      classification:
        readOptional(
          formData,
          "classification",
        ) as
          | VehicleClassification
          | undefined,

      inventoryStatus:
        readOptional(
          formData,
          "inventoryStatus",
        ) as
          | VehicleInventoryStatus
          | undefined,

      stockNumber: readOptional(
        formData,
        "stockNumber",
      ),

      listPrice: readOptionalNumber(
        formData,
        "listPrice",
      ),

      unitCost: readOptionalNumber(
        formData,
        "unitCost",
      ),

      salesperson: readOptional(
        formData,
        "salesperson",
      ),

      notes: readOptional(
        formData,
        "notes",
      ),
    };

    await onSubmit(values);
  }

  //************************************************************** */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900">
          Vehicle identity
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Year"
            name="year"
            type="number"
            defaultValue={
              vehicle?.year?.toString() ??
              ""
            }
          />

          <Field
            label="Make"
            name="make"
            defaultValue={
              vehicle?.make ?? ""
            }
            required
          />

          <Field
            label="Model"
            name="model"
            defaultValue={
              vehicle?.model ?? ""
            }
            required
          />
        </div>

        <Field
          label="Trim"
          name="trim"
          defaultValue={
            vehicle?.trim ?? ""
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="VIN"
            name="vin"
            defaultValue={
              vehicle?.vin ?? ""
            }
          />

          <Field
            label="Mileage"
            name="mileage"
            type="number"
            defaultValue={
              vehicle?.mileage?.toString() ??
              ""
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Color"
            name="color"
            defaultValue={
              vehicle?.color ?? ""
            }
          />

          <Field
            label="License plate"
            name="licensePlate"
            defaultValue={
              vehicle?.licensePlate ??
              ""
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900">
          Classification
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Vehicle type"
            name="type"
            defaultValue={
              vehicle?.type ?? ""
            }
            options={[
              ["", "Select type"],
              [
                "MOTORCYCLE",
                "Motorcycle",
              ],
              ["ATV", "ATV"],
              ["UTV", "UTV"],
              ["SCOOTER", "Scooter"],
              ["PWC", "PWC"],
              [
                "SNOWMOBILE",
                "Snowmobile",
              ],
            ]}
          />

          <SelectField
            label="Classification"
            name="classification"
            defaultValue={
              vehicle?.classification ??
              "SERVICE"
            }
            options={[
              ["NEW", "New"],
              ["USED", "Used"],
              ["SERVICE", "Service"],
            ]}
          />

          <SelectField
            label="Inventory status"
            name="inventoryStatus"
            defaultValue={
              vehicle?.inventoryStatus ??
              "UNAVAILABLE"
            }
            options={[
              [
                "AVAILABLE",
                "Available",
              ],
              [
                "RESERVED",
                "Reserved",
              ],
              [
                "PENDING_SALE",
                "Pending sale",
              ],
              ["SOLD", "Sold"],
              [
                "WHOLESALE",
                "Wholesale",
              ],
              [
                "UNAVAILABLE",
                "Unavailable",
              ],
            ]}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900">
          Customer assignment
        </h3>

        <VehicleCustomerSelect
          organizationId={
            organizationId
          }
          defaultValue={
            vehicle?.customerId
          }
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900">
          Inventory and sales
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Stock number"
            name="stockNumber"
            defaultValue={
              vehicle?.stockNumber ?? ""
            }
          />

          <Field
            label="Salesperson"
            name="salesperson"
            defaultValue={
              vehicle?.salesperson ?? ""
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="List price"
            name="listPrice"
            type="number"
            step="0.01"
            defaultValue={
              vehicle?.listPrice ?? ""
            }
          />

          <Field
            label="Unit cost"
            name="unitCost"
            type="number"
            step="0.01"
            defaultValue={
              vehicle?.unitCost ?? ""
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900">
          Notes
        </h3>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-zinc-700">
            Internal notes
          </span>

          <textarea
            name="notes"
            defaultValue={
              vehicle?.notes ?? ""
            }
            maxLength={5000}
            className={
              textareaClasses
            }
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
          {isSubmitting
            ? "Saving..."
            : submitLabel}
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
  step?: string;
  required?: boolean;
  defaultValue?: string;
};

//************************************************************** */

function Field({
  label,
  name,
  type = "text",
  step,
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
        step={step}
        required={required}
        defaultValue={defaultValue}
        className={inputClasses}
      />
    </label>
  );
}

//************************************************************** */

type SelectFieldProps = {
  label: string;
  name: string;
  defaultValue: string;
  options: ReadonlyArray<
    readonly [string, string]
  >;
};

//************************************************************** */

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-zinc-700">
        {label}
      </span>

      <select
        name={name}
        defaultValue={defaultValue}
        className={selectClasses}
      >
        {options.map(
          ([value, label]) => (
            <option
              key={value}
              value={value}
            >
              {label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}

//************************************************************** */

function readRequired(
  formData: FormData,
  name: string,
): string {
  return String(
    formData.get(name) ?? "",
  ).trim();
}

//************************************************************** */

function readOptional(
  formData: FormData,
  name: string,
): string | undefined {
  const value = readRequired(
    formData,
    name,
  );

  return value || undefined;
}

//************************************************************** */

function readOptionalNumber(
  formData: FormData,
  name: string,
): number | undefined {
  const value = readOptional(
    formData,
    name,
  );

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : undefined;
}

//************************************************************** */
