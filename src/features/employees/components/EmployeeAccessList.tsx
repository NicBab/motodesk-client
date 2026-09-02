"use client";

import { Search } from "lucide-react";

import type {
  AccountFilter,
  EmployeeAccessItem,
} from "./user-permissions.types";

import {
  formatPermissionLabel,
  getEmployeeInitials,
} from "./user-permissions.utils";

import type { MembershipStatus } from "@/features/memberships/membership.types";

//************************************************************** */

type Props = {
  items: EmployeeAccessItem[];

  selectedEmployeeId: string;

  search: string;

  accountFilter: AccountFilter;

  onSearchChange: (value: string) => void;

  onFilterChange: (value: AccountFilter) => void;

  onSelectEmployee: (employeeId: string) => void;
};

//************************************************************** */

export function EmployeeAccessList({
  items,
  selectedEmployeeId,
  search,
  accountFilter,
  onSearchChange,
  onFilterChange,
  onSelectEmployee,
}: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="space-y-3 border-b border-zinc-200 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search employees..."
            className={`${inputClassName} pl-9`}
          />
        </div>

        <select
          value={accountFilter}
          onChange={(event) =>
            onFilterChange(event.target.value as AccountFilter)
          }
          className={inputClassName}
        >
          <option value="ALL">All Accounts</option>

          <option value="ACTIVE">Active</option>

          <option value="INVITED">Invited</option>

          <option value="SUSPENDED">Suspended</option>

          <option value="NO_ACCOUNT">No Account</option>
        </select>
      </div>

      <div className="max-h-[720px] overflow-y-auto">
        {items.map((item) => {
          const active = item.employee.id === selectedEmployeeId;

          return (
            <button
              key={item.employee.id}
              type="button"
              onClick={() => onSelectEmployee(item.employee.id)}
              className={`flex w-full items-center gap-3 border-b border-zinc-100 p-4 text-left transition ${
                active ? "bg-orange-50" : "hover:bg-zinc-50"
              }`}
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
                {getEmployeeInitials(item.employee)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  {item.employee.firstName} {item.employee.lastName}
                </p>

                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {item.membership
                    ? formatPermissionLabel(item.membership.role)
                    : "No MotoDesk account"}
                </p>
              </div>

              <AccountBadge status={item.membership?.status ?? null} />
            </button>
          );
        })}

        {items.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-500">
            No employees match the current filters.
          </div>
        ) : null}
      </div>
    </section>
  );
}

//************************************************************** */

function AccountBadge({ status }: { status: MembershipStatus | null }) {
  if (!status) {
    return (
      <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500">
        No Account
      </span>
    );
  }

  const className =
    status === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700"
      : status === "SUSPENDED"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-bold ${className}`}
    >
      {formatPermissionLabel(status)}
    </span>
  );
}

//************************************************************** */

const inputClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */
