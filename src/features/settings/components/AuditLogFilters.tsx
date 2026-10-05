"use client";

import type { FormEvent } from "react";

import { Search, SlidersHorizontal } from "lucide-react";

import type {
  AuditLogFilterOptions,
} from "@/features/settings/audit-log.types";

//************************************************************** */

export type AuditLogFilterValues = {
  search: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  startDate: string;
  endDate: string;
};

//************************************************************** */

export const EMPTY_AUDIT_FILTERS: AuditLogFilterValues = {
  search: "",
  actorUserId: "",
  action: "",
  resourceType: "",
  startDate: "",
  endDate: "",
};

//************************************************************** */

const inputClasses =
  "h-10 w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-zinc-50 disabled:text-zinc-400";

//************************************************************** */

export function AuditLogFilters({
  values,
  options,
  isLoadingOptions,
  isOptionsError,
  error,
  onChange,
  onApply,
  onReset,
  onRetryOptions,
}: {
  values: AuditLogFilterValues;
  options: AuditLogFilterOptions | undefined;
  isLoadingOptions: boolean;
  isOptionsError: boolean;
  error: string | null;

  onChange: (values: AuditLogFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
  onRetryOptions: () => void;
}) {
  function update(
    field: keyof AuditLogFilterValues,
    value: string,
  ) {
    onChange({
      ...values,
      [field]: value,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-zinc-500" />

        <h2 className="text-sm font-semibold text-zinc-900">
          Filter Events
        </h2>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-medium text-zinc-700">
          Search
        </span>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />

          <input
            type="search"
            value={values.search}
            onChange={(event) => update("search", event.target.value)}
            maxLength={200}
            placeholder="Search actor, action, resource, event ID, or IP address"
            className={`${inputClasses} pl-9`}
          />
        </div>
      </label>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-xs font-medium text-zinc-700">
            Actor
          </span>

          <select
            value={values.actorUserId}
            onChange={(event) => update("actorUserId", event.target.value)}
            disabled={!options}
            className={inputClasses}
          >
            <option value="">All actors</option>

            {options?.actors.map((actor) => {
              const name = [
                actor.firstName,
                actor.lastName,
              ].filter(Boolean).join(" ");

              return (
                <option key={actor.id} value={actor.id}>
                  {name
                    ? `${name}${actor.email ? ` (${actor.email})` : ""}`
                    : actor.email ?? `Unavailable user (${actor.id})`}
                </option>
              );
            })}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium text-zinc-700">
            Action / Event
          </span>

          <select
            value={values.action}
            onChange={(event) => update("action", event.target.value)}
            disabled={!options}
            className={inputClasses}
          >
            <option value="">All actions</option>

            {options?.actions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium text-zinc-700">
            Resource Type
          </span>

          <select
            value={values.resourceType}
            onChange={(event) => update("resourceType", event.target.value)}
            disabled={!options}
            className={inputClasses}
          >
            <option value="">All resource types</option>

            {options?.resourceTypes.map((resourceType) => (
              <option key={resourceType} value={resourceType}>
                {resourceType}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium text-zinc-700">
            From Date
          </span>

          <input
            type="date"
            value={values.startDate}
            max={values.endDate || undefined}
            onChange={(event) => update("startDate", event.target.value)}
            className={inputClasses}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium text-zinc-700">
            Through Date
          </span>

          <input
            type="date"
            value={values.endDate}
            min={values.startDate || undefined}
            onChange={(event) => update("endDate", event.target.value)}
            className={inputClasses}
          />
        </label>
      </div>

      <p className="text-xs leading-5 text-zinc-500">
        Dates include the entire selected day in this device&apos;s timezone.
        Search excludes event metadata.
      </p>

      {isLoadingOptions ? (
        <p role="status" className="text-xs text-zinc-500">
          Loading filter choices…
        </p>
      ) : null}

      {isOptionsError ? (
        <div role="alert" className="text-xs text-amber-700">
          Filter choices could not be loaded. Search and dates remain available.{" "}
          <button
            type="button"
            onClick={onRetryOptions}
            className="font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Apply Filters
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

//************************************************************** */