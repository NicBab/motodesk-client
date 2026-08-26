"use client";

import { Building2, Search, UserRound, X } from "lucide-react";

import { useState } from "react";

import type { ReactNode } from "react";

import {
  useGetCustomerQuery,
  useGetCustomersQuery,
} from "@/store/api/customersApi";

import { useGetVehiclesQuery } from "@/store/api/vehiclesApi";

import type { Customer } from "@/features/customers/customer.types";

import { getCustomerDisplayName } from "@/features/customers/customer.utils";

import { formatVehicleName } from "@/features/vehicles/vehicle.utils";

type RepairOrderCustomerVehicleSelectProps = {
  organizationId: string;

  selectedCustomerId: string;
  selectedVehicleId: string;

  onCustomerChange: (customerId: string) => void;

  onVehicleChange: (vehicleId: string) => void;
};

export function RepairOrderCustomerVehicleSelect({
  organizationId,
  selectedCustomerId,
  selectedVehicleId,
  onCustomerChange,
  onVehicleChange,
}: RepairOrderCustomerVehicleSelectProps) {
  const [search, setSearch] = useState("");

  const [resultsOpen, setResultsOpen] = useState(false);

  const normalizedSearch = search.trim();

  const shouldSearch = normalizedSearch.length >= 2;

  const {
    data: customers = [],
    isFetching: isSearching,
    isError: isSearchError,
  } = useGetCustomersQuery(
    {
      organizationId,
      search: normalizedSearch,
      isActive: true,
    },
    {
      skip: !shouldSearch,
    },
  );

  const { data: selectedCustomer, isLoading: isLoadingSelectedCustomer } =
    useGetCustomerQuery(
      {
        organizationId,
        customerId: selectedCustomerId,
      },
      {
        skip: !selectedCustomerId,
      },
    );

  const {
    data: vehicles = [],
    isLoading: isLoadingVehicles,
    isError: isVehicleError,
  } = useGetVehiclesQuery(
    {
      organizationId,
      customerId: selectedCustomerId,
      isActive: true,
    },
    {
      skip: !selectedCustomerId,
    },
  );

  function handleSearchChange(value: string) {
    setSearch(value);

    setResultsOpen(value.trim().length >= 2);
  }

  function handleCustomerSelect(customer: Customer) {
    onCustomerChange(customer.id);

    onVehicleChange("");

    setSearch("");
    setResultsOpen(false);
  }

  function handleCustomerClear() {
    onCustomerChange("");
    onVehicleChange("");

    setSearch("");
    setResultsOpen(false);
  }

  return (
    <div className="space-y-5">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-700">Customer</span>

          <span className="text-[10px] font-medium text-zinc-400">
            Required
          </span>
        </div>

        {selectedCustomerId ? (
          <div className="flex h-11 items-center justify-between rounded-lg border border-zinc-300 bg-white px-3">
            <div className="flex min-w-0 items-center gap-2">
              {selectedCustomer?.type === "BUSINESS" ? (
                <Building2 className="h-4 w-4 shrink-0 text-zinc-400" />
              ) : (
                <UserRound className="h-4 w-4 shrink-0 text-zinc-400" />
              )}

              <span className="truncate text-sm font-medium text-zinc-900">
                {isLoadingSelectedCustomer
                  ? "Loading customer..."
                  : selectedCustomer
                    ? getCustomerDisplayName(selectedCustomer)
                    : "Selected customer"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCustomerClear}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Change customer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-[22px] h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => {
                if (normalizedSearch.length >= 2) {
                  setResultsOpen(true);
                }
              }}
              placeholder="Search customer by name, company, email or phone..."
              autoComplete="off"
              className="h-11 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />

            {resultsOpen && shouldSearch ? (
              <div className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">
                {isSearching ? (
                  <ResultMessage>Searching customers...</ResultMessage>
                ) : isSearchError ? (
                  <ResultMessage error>
                    MotoDesk could not search customers.
                  </ResultMessage>
                ) : customers.length === 0 ? (
                  <ResultMessage>No matching customers.</ResultMessage>
                ) : (
                  customers.slice(0, 10).map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();

                        handleCustomerSelect(customer);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-zinc-50"
                    >
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-500">
                        {customer.type === "BUSINESS" ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <UserRound className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {getCustomerDisplayName(customer)}
                        </p>

                        <div className="mt-0.5 flex flex-wrap gap-x-3 text-[11px] text-zinc-400">
                          {customer.email ? (
                            <span>{customer.email}</span>
                          ) : null}

                          {customer.phone ? (
                            <span>{customer.phone}</span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
        )}

        {!selectedCustomerId ? (
          <p className="mt-2 text-xs text-zinc-500">
            Type at least 2 characters to search active customers.
          </p>
        ) : null}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-700">Vehicle</span>

          <span className="text-[10px] font-medium text-zinc-400">
            Required
          </span>
        </div>

        <select
          value={selectedVehicleId}
          onChange={(event) => onVehicleChange(event.target.value)}
          disabled={!selectedCustomerId || isLoadingVehicles || isVehicleError}
          className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
        >
          <option value="">
            {!selectedCustomerId
              ? "Select a customer first"
              : isLoadingVehicles
                ? "Loading vehicles..."
                : "Select vehicle"}
          </option>

          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {formatVehicleOption(
                vehicle.year,
                vehicle.make,
                vehicle.model,
                vehicle.trim,
                vehicle.vin,
              )}
            </option>
          ))}
        </select>

        {isVehicleError ? (
          <p className="mt-2 text-xs text-red-600">
            MotoDesk could not load this customer&apos;s vehicles.
          </p>
        ) : null}

        {selectedCustomerId &&
        !isLoadingVehicles &&
        !isVehicleError &&
        vehicles.length === 0 ? (
          <p className="mt-2 text-xs text-amber-600">
            This customer has no active vehicles assigned. Add or assign a
            vehicle before creating the repair order.
          </p>
        ) : null}
      </section>
    </div>
  );
}

function ResultMessage({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`px-3 py-4 text-center text-xs ${
        error ? "text-red-600" : "text-zinc-500"
      }`}
    >
      {children}
    </div>
  );
}

function formatVehicleOption(
  year: number | null,
  make: string,
  model: string,
  trim: string | null,
  vin: string | null,
): string {
  const name = formatVehicleName(year, make, model, trim);

  if (!vin) {
    return name;
  }

  return `${name} — VIN ${vin}`;
}
