"use client";

import { useState } from "react";

import type { Part } from "../part.types";

export type PartFormValues = {
  partNumber: string;
  oemPartNumber: string;
  description: string;
  brand: string;
  category: string;
  reorderPoint: string;
  costPrice: string;
  sellPrice: string;
  location: string;
  qtyOnHand: string;
};

type PartFormProps = {
  part?: Part | null;
  disabled?: boolean;

  onSubmit: (values: PartFormValues) => void;
};

export function PartForm({ part, disabled = false, onSubmit }: PartFormProps) {
  const [partNumber, setPartNumber] = useState(part?.partNumber ?? "");

  const [oemPartNumber, setOemPartNumber] = useState(part?.oemPartNumber ?? "");

  const [description, setDescription] = useState(part?.description ?? "");

  const [brand, setBrand] = useState(part?.brand ?? "");

  const [category, setCategory] = useState(part?.category ?? "");

  const [reorderPoint, setReorderPoint] = useState(part?.reorderPoint ?? "0");

  const [costPrice, setCostPrice] = useState(part?.costPrice ?? "0");

  const [sellPrice, setSellPrice] = useState(part?.sellPrice ?? "0");

  const [location, setLocation] = useState(part?.location ?? "");

  const [qtyOnHand, setQtyOnHand] = useState(part?.qtyOnHand ?? "0");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      partNumber,
      oemPartNumber,
      description,
      brand,
      category,
      reorderPoint,
      costPrice,
      sellPrice,
      location,
      qtyOnHand,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Part number" required>
          <input
            value={partNumber}
            onChange={(event) => setPartNumber(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="OEM part number">
          <input
            value={oemPartNumber}
            onChange={(event) => setOemPartNumber(event.target.value)}
            className={inputClassName}
          />
        </Field>
      </div>

      <Field label="Description" required>
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={inputClassName}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Brand">
          <input
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Category">
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={inputClassName}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Cost">
          <input
            type="number"
            min="0"
            step="0.01"
            value={costPrice}
            onChange={(event) => setCostPrice(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Sell price">
          <input
            type="number"
            min="0"
            step="0.01"
            value={sellPrice}
            onChange={(event) => setSellPrice(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Reorder point">
          <input
            type="number"
            min="0"
            step="0.01"
            value={reorderPoint}
            onChange={(event) => setReorderPoint(event.target.value)}
            className={inputClassName}
          />
        </Field>
      </div>

      <Field label="Bin / location">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Example: A-12"
          className={inputClassName}
        />
      </Field>

      {!part ? (
        <Field label="Initial quantity on hand">
          <input
            type="number"
            min="0"
            step="0.01"
            value={qtyOnHand}
            onChange={(event) => setQtyOnHand(event.target.value)}
            className={inputClassName}
          />

          <p className="mt-1 text-xs text-zinc-400">
            After creation, stock changes are recorded through inventory
            adjustments.
          </p>
        </Field>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {disabled ? "Saving..." : part ? "Save changes" : "Add part"}
        </button>
      </div>
    </form>
  );
}

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
      <span className="mb-2 block text-xs font-semibold text-zinc-700">
        {label}

        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>

      {children}
    </label>
  );
}

const inputClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 caret-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500";
