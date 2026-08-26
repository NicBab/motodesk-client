//************************************************************** */

"use client";

import { Plus, Search } from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import { CreateCustomerDialog } from "@/features/customers/components/CreateCustomerDialog";

import { CustomerMetrics } from "@/features/customers/components/CustomerMetrics";

import { CustomerRow } from "@/features/customers/components/CustomerRow";

import {
  CustomerTableHeading,
  CustomerTableMessage,
  EmptyCustomers,
} from "@/features/customers/components/CustomerTableState";

import { EditCustomerDialog } from "@/features/customers/components/EditCustomerDialog";

import type {
  Customer,
  CustomerType,
} from "@/features/customers/customer.types";

import { getCustomerDisplayName } from "@/features/customers/customer.utils";

import {
  useArchiveCustomerMutation,
  useGetCustomersQuery,
  useRestoreCustomerMutation,
} from "@/store/api/customersApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

//************************************************************** */

type CustomerStatusFilter = "active" | "archived";

//************************************************************** */

export default function CustomersPage() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState<"" | CustomerType>("");

  const [statusFilter, setStatusFilter] =
    useState<CustomerStatusFilter>("active");

  const [createOpen, setCreateOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const {
    data: customers = [],
    isLoading,
    isFetching,
    isError,
  } = useGetCustomersQuery(
    {
      organizationId: organizationId ?? "",

      search: search.trim() || undefined,

      type: typeFilter || undefined,

      isActive: statusFilter === "active",
    },
    {
      skip: !organizationId,
    },
  );

  const [archiveCustomer, { isLoading: isArchiving }] =
    useArchiveCustomerMutation();

  const [restoreCustomer, { isLoading: isRestoring }] =
    useRestoreCustomerMutation();

  //************************************************************** */

  async function handleArchive(customer: Customer): Promise<void> {
    if (!organizationId) {
      toast.error("No organization is currently selected.");

      return;
    }

    const confirmed = window.confirm(
      `Archive ${getCustomerDisplayName(customer)}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await archiveCustomer({
        organizationId,
        customerId: customer.id,
      }).unwrap();

      toast.success("Customer archived successfully.");
    } catch {
      toast.error("MotoDesk could not archive the customer.");
    }
  }

  //************************************************************** */

  async function handleRestore(customer: Customer): Promise<void> {
    if (!organizationId) {
      toast.error("No organization is currently selected.");

      return;
    }

    try {
      await restoreCustomer({
        organizationId,
        customerId: customer.id,
      }).unwrap();

      toast.success("Customer restored successfully.");
    } catch {
      toast.error("MotoDesk could not restore the customer.");
    }
  }

  //************************************************************** */

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Customers
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage customer records, contact information, and service
            relationships.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          disabled={!organizationId}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add customer
        </button>
      </div>

      <CustomerMetrics organizationId={organizationId} />

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers..."
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as "" | CustomerType)
            }
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          >
            <option value="">All customer types</option>

            <option value="INDIVIDUAL">Individuals</option>

            <option value="BUSINESS">Businesses</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as CustomerStatusFilter)
            }
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          >
            <option value="active">Active</option>

            <option value="archived">Archived</option>
          </select>
        </div>

        {isLoading ? (
          <CustomerTableMessage>Loading customers...</CustomerTableMessage>
        ) : isError ? (
          <CustomerTableMessage>
            MotoDesk could not load customers.
          </CustomerTableMessage>
        ) : customers.length === 0 ? (
          <EmptyCustomers />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-left">
                    <CustomerTableHeading>Customer</CustomerTableHeading>

                    <CustomerTableHeading>Type</CustomerTableHeading>

                    <CustomerTableHeading>Contact</CustomerTableHeading>

                    <CustomerTableHeading>Location</CustomerTableHeading>

                    <CustomerTableHeading>Vehicles</CustomerTableHeading>

                    <CustomerTableHeading>Status</CustomerTableHeading>

                    <CustomerTableHeading align="right">
                      Actions
                    </CustomerTableHeading>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <CustomerRow
                      key={customer.id}
                      customer={customer}
                      actionDisabled={isArchiving || isRestoring}
                      onEdit={setSelectedCustomer}
                      onArchive={handleArchive}
                      onRestore={handleRestore}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
              <p className="text-xs text-zinc-500">
                {customers.length} customer
                {customers.length === 1 ? "" : "s"}
              </p>

              {isFetching ? (
                <span className="text-xs text-zinc-400">Updating...</span>
              ) : null}
            </div>
          </>
        )}
      </section>

      {organizationId ? (
        <>
          <CreateCustomerDialog
            organizationId={organizationId}
            open={createOpen}
            onClose={() => setCreateOpen(false)}
          />

          <EditCustomerDialog
            organizationId={organizationId}
            customer={selectedCustomer}
            open={selectedCustomer !== null}
            onClose={() => setSelectedCustomer(null)}
          />
        </>
      ) : null}
    </div>
  );
}

//************************************************************** */
