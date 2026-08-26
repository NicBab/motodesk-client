//************************************************************** */

"use client";

import {
  Building2,
  Search,
  UserRound,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useGetCustomersQuery,
} from "@/store/api/customersApi";

import type {
  Customer,
} from "@/features/customers/customer.types";

import {
  getCustomerDisplayName,
} from "@/features/customers/customer.utils";

//************************************************************** */

type VehicleCustomerSelectProps = {
  organizationId: string;
  defaultValue?: string | null;
};

//************************************************************** */

export function VehicleCustomerSelect({
  organizationId,
  defaultValue,
}: VehicleCustomerSelectProps) {
  const [search, setSearch] =
    useState("");

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState<Customer | null>(
    null,
  );

  const [
    selectionCleared,
    setSelectionCleared,
  ] = useState(false);

  const [
    dropdownOpen,
    setDropdownOpen,
  ] = useState(false);

  const normalizedSearch =
    search.trim();

  const shouldSearch =
    normalizedSearch.length >= 2;

  const {
    data: customers = [],
    isFetching,
    isError,
  } = useGetCustomersQuery(
    {
      organizationId,
      search:
        shouldSearch
          ? normalizedSearch
          : undefined,
      isActive: true,
    },
    {
      skip: !shouldSearch,
    },
  );

  const {
    data: defaultCustomers = [],
  } = useGetCustomersQuery(
    {
      organizationId,
      isActive: true,
    },
    {
      skip: !defaultValue,
    },
  );

  const defaultCustomer =
    useMemo(
      () =>
        defaultCustomers.find(
          (customer) =>
            customer.id ===
            defaultValue,
        ) ?? null,
      [
        defaultCustomers,
        defaultValue,
      ],
    );

  const currentCustomer =
    selectedCustomer ??
    (!selectionCleared
      ? defaultCustomer
      : null);

  const results =
    useMemo(
      () =>
        customers.slice(0, 10),
      [customers],
    );

  function selectCustomer(
    customer: Customer,
  ) {
    setSelectedCustomer(
      customer,
    );

    setSelectionCleared(false);
    setSearch("");
    setDropdownOpen(false);
  }

  function clearCustomer() {
    setSelectedCustomer(null);
    setSelectionCleared(true);
    setSearch("");
    setDropdownOpen(false);
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-700">
          Customer

          <span className="text-[10px] font-medium text-zinc-400">
            Optional
          </span>
        </span>

        <input
          type="hidden"
          name="customerId"
          value={
            currentCustomer?.id ?? ""
          }
        />

        {currentCustomer ? (
          <div className="flex h-11 items-center justify-between rounded-lg border border-zinc-300 bg-white px-3">
            <div className="flex min-w-0 items-center gap-2">
              {currentCustomer.type ===
              "BUSINESS" ? (
                <Building2 className="h-4 w-4 shrink-0 text-zinc-400" />
              ) : (
                <UserRound className="h-4 w-4 shrink-0 text-zinc-400" />
              )}

              <span className="truncate text-sm font-medium text-zinc-900">
                {getCustomerDisplayName(
                  currentCustomer,
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={
                clearCustomer
              }
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Remove customer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value,
                );

                setDropdownOpen(
                  true,
                );
              }}
              onFocus={() =>
                setDropdownOpen(
                  true,
                )
              }
              placeholder="Search customer..."
              autoComplete="off"
              className="h-11 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />

            {dropdownOpen &&
            shouldSearch ? (
              <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">
                {isFetching ? (
                  <div className="px-3 py-4 text-center text-xs text-zinc-500">
                    Searching customers...
                  </div>
                ) : isError ? (
                  <div className="px-3 py-4 text-center text-xs text-red-600">
                    MotoDesk could not search customers.
                  </div>
                ) : results.length ===
                  0 ? (
                  <div className="px-3 py-4 text-center text-xs text-zinc-500">
                    No matching customers.
                  </div>
                ) : (
                  results.map(
                    (customer) => (
                      <button
                        key={
                          customer.id
                        }
                        type="button"
                        onClick={() =>
                          selectCustomer(
                            customer,
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-zinc-50"
                      >
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-500">
                          {customer.type ===
                          "BUSINESS" ? (
                            <Building2 className="h-4 w-4" />
                          ) : (
                            <UserRound className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-900">
                            {getCustomerDisplayName(
                              customer,
                            )}
                          </p>

                          {customer.email ? (
                            <p className="truncate text-[11px] text-zinc-400">
                              {
                                customer.email
                              }
                            </p>
                          ) : null}
                        </div>
                      </button>
                    ),
                  )
                )}
              </div>
            ) : null}
          </div>
        )}
      </label>

      {!currentCustomer ? (
        <p className="text-xs leading-5 text-zinc-500">
          Type at least 2 characters
          to search active customers.
          Leave blank for dealership
          inventory.
        </p>
      ) : null}
    </div>
  );
}

//************************************************************** */
