//************************************************************** */

import {
  Archive,
  Building2,
  Mail,
  Phone,
  RotateCcw,
  UserRound,
} from "lucide-react";

import type {
  Customer,
} from "../customer.types";

import {
  getCustomerDisplayName,
} from "../customer.utils";

//************************************************************** */

type CustomerRowProps = {
  customer: Customer;
  actionDisabled: boolean;

  onEdit: (
    customer: Customer,
  ) => void;

  onArchive: (
    customer: Customer,
  ) => Promise<void>;

  onRestore: (
    customer: Customer,
  ) => Promise<void>;
};

//************************************************************** */

export function CustomerRow({
  customer,
  actionDisabled,
  onEdit,
  onArchive,
  onRestore,
}: CustomerRowProps) {
  const displayName =
    getCustomerDisplayName(
      customer,
    );

  const location = [
    customer.city,
    customer.state,
  ]
    .filter(Boolean)
    .join(", ");

    //************************************************************** */
    
  return (
    <tr className="group border-b border-zinc-100 transition last:border-b-0 hover:bg-zinc-50">
      <td className="p-0">
        <button
          type="button"
          onClick={() =>
            onEdit(customer)
          }
          className="flex w-full items-center gap-3 px-4 py-4 text-left"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-500 transition group-hover:bg-orange-50 group-hover:text-orange-600">
            {customer.type ===
            "BUSINESS" ? (
              <Building2 className="h-4 w-4" />
            ) : (
              <UserRound className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 group-hover:text-orange-600">
              {displayName}
            </p>

            <p className="mt-0.5 text-[11px] text-zinc-400">
              View or edit customer
            </p>
          </div>
        </button>
      </td>

      <td className="px-4 py-4">
        <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
          {customer.type ===
          "BUSINESS"
            ? "Business"
            : "Individual"}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="space-y-1">
          {customer.email ? (
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <Mail className="h-3.5 w-3.5 text-zinc-400" />

              <span className="truncate">
                {customer.email}
              </span>
            </div>
          ) : null}

          {customer.phone ? (
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <Phone className="h-3.5 w-3.5 text-zinc-400" />

              {customer.phone}
            </div>
          ) : null}

          {!customer.email &&
          !customer.phone ? (
            <span className="text-xs text-zinc-400">
              No contact information
            </span>
          ) : null}
        </div>
      </td>

      <td className="px-4 py-4 text-xs text-zinc-600">
        {location || "—"}
      </td>

      <td className="px-4 py-4">
        {customer.isActive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />

            Archived
          </span>
        )}
      </td>

      <td className="px-4 py-4 text-right">
        {customer.isActive ? (
          <button
            type="button"
            disabled={actionDisabled}
            onClick={() =>
              void onArchive(
                customer,
              )
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-medium text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Archive className="h-3.5 w-3.5" />

            Archive
          </button>
        ) : (
          <button
            type="button"
            disabled={actionDisabled}
            onClick={() =>
              void onRestore(
                customer,
              )
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-medium text-zinc-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />

            Restore
          </button>
        )}
      </td>
    </tr>
  );
}

//************************************************************** */