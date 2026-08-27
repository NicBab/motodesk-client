"use client";

import { useState } from "react";

import type { Vendor } from "../vendor.types";

export type VendorFormValues = {
  name: string;

  accountNumber: string;

  contactName: string;
  contactEmail: string;
  contactPhone: string;

  email: string;
  phone: string;
  website: string;

  addressLine1: string;
  addressLine2: string;

  city: string;
  state: string;
  postalCode: string;
  country: string;

  notes: string;
};

type VendorFormProps = {
  vendor?: Vendor | null;

  disabled?: boolean;

  onSubmit: (values: VendorFormValues) => void;
};

export function VendorForm({
  vendor,
  disabled = false,
  onSubmit,
}: VendorFormProps) {
  const [name, setName] = useState(vendor?.name ?? "");

  const [accountNumber, setAccountNumber] = useState(
    vendor?.accountNumber ?? "",
  );

  const [contactName, setContactName] = useState(vendor?.contactName ?? "");

  const [contactEmail, setContactEmail] = useState(vendor?.contactEmail ?? "");

  const [contactPhone, setContactPhone] = useState(vendor?.contactPhone ?? "");

  const [email, setEmail] = useState(vendor?.email ?? "");

  const [phone, setPhone] = useState(vendor?.phone ?? "");

  const [website, setWebsite] = useState(vendor?.website ?? "");

  const [addressLine1, setAddressLine1] = useState(vendor?.addressLine1 ?? "");

  const [addressLine2, setAddressLine2] = useState(vendor?.addressLine2 ?? "");

  const [city, setCity] = useState(vendor?.city ?? "");

  const [state, setState] = useState(vendor?.state ?? "");

  const [postalCode, setPostalCode] = useState(vendor?.postalCode ?? "");

  const [country, setCountry] = useState(vendor?.country ?? "");

  const [notes, setNotes] = useState(vendor?.notes ?? "");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      name,
      accountNumber,
      contactName,
      contactEmail,
      contactPhone,
      email,
      phone,
      website,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      notes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vendor name" required>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Account number">
          <input
            value={accountNumber}
            onChange={(event) => setAccountNumber(event.target.value)}
            className={inputClassName}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Contact name">
          <input
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Contact phone">
          <input
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Contact email">
          <input
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            className={inputClassName}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Main phone">
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Main email">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Website / portal">
          <input
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://..."
            className={inputClassName}
          />
        </Field>
      </div>

      <Field label="Address line 1">
        <input
          value={addressLine1}
          onChange={(event) => setAddressLine1(event.target.value)}
          className={inputClassName}
        />
      </Field>

      <Field label="Address line 2">
        <input
          value={addressLine2}
          onChange={(event) => setAddressLine2(event.target.value)}
          className={inputClassName}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="City">
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="State">
          <input
            value={state}
            onChange={(event) => setState(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Postal code">
          <input
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Country">
          <input
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className={inputClassName}
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 caret-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500"
        />
      </Field>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {disabled ? "Saving..." : vendor ? "Save changes" : "Add vendor"}
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
