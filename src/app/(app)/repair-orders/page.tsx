"use client";

import { Plus, Search } from "lucide-react";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { CreateRepairOrderDialog } from "@/features/repair-orders/components/CreateRepairOrderDialog";

import { RepairOrderDialog } from "@/features/repair-orders/components/RepairOrderDialog";

import { RepairOrderRow } from "@/features/repair-orders/components/RepairOrderRow";

import {
  EmptyRepairOrders,
  RepairOrderTableHeading,
  RepairOrderTableMessage,
} from "@/features/repair-orders/components/RepairOrderTableState";

import { useOpenRepairOrders } from "@/features/repair-orders/open-repair-orders.context";

import type {
  RepairOrder,
  RepairOrderPriority,
  RepairOrderStatus,
} from "@/features/repair-orders/repair-order.types";

import { useGetRepairOrdersQuery } from "@/store/api/repairOrdersApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

export default function RepairOrdersPage() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const router = useRouter();

  const searchParams = useSearchParams();

  const { openRepairOrder } = useOpenRepairOrders();

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"" | RepairOrderStatus>("");

  const [priorityFilter, setPriorityFilter] = useState<
    "" | RepairOrderPriority
  >("");

  const [createOpen, setCreateOpen] = useState(false);

  const {
    data: repairOrders = [],
    isLoading,
    isFetching,
    isError,
  } = useGetRepairOrdersQuery(
    {
      organizationId: organizationId ?? "",

      search: search.trim() || undefined,

      status: statusFilter || undefined,

      priority: priorityFilter || undefined,

      isActive: true,
    },
    {
      skip: !organizationId,
    },
  );

  const requestedRepairOrderId = searchParams.get("ro");

  const selectedRepairOrder = requestedRepairOrderId
    ? (repairOrders.find(
        (repairOrder) => repairOrder.id === requestedRepairOrderId,
      ) ?? null)
    : null;

  function handleOpenRepairOrder(repairOrder: RepairOrder) {
    openRepairOrder({
      id: repairOrder.id,
      roNumber: repairOrder.roNumber,
      customerName: getCustomerName(repairOrder),
    });

    router.push(`/repair-orders?ro=${repairOrder.id}`);
  }

  function handleCloseRepairOrder() {
    router.push("/repair-orders");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Repair Orders
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage estimates, approvals, service work, parts status, cashiering,
            and pickup.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          disabled={!organizationId}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          New repair order
        </button>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-zinc-200 p-4 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search repair orders..."
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "" | RepairOrderStatus)
            }
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          >
            <option value="">All statuses</option>

            <option value="ESTIMATE">Estimate</option>

            <option value="AWAITING_CUSTOMER_APPROVAL">
              Awaiting customer approval
            </option>

            <option value="APPROVED">Approved</option>

            <option value="PARTS_REVIEW">Parts review</option>

            <option value="WAITING_ON_PARTS">Waiting on parts</option>

            <option value="READY_TO_WORK">Ready to work</option>

            <option value="SCHEDULED">Scheduled</option>

            <option value="IN_PROGRESS">In progress</option>

            <option value="PAUSED">Paused</option>

            <option value="WAITING_ON_ADDITIONAL_APPROVAL">
              Waiting on additional approval
            </option>

            <option value="WORK_COMPLETE">Work complete</option>

            <option value="QUALITY_CHECK">Quality check</option>

            <option value="READY_FOR_PICKUP">Ready for pickup</option>

            <option value="CASHIERED">Cashiered</option>

            <option value="COMPLETED">Completed</option>

            <option value="PICKED_UP">Picked up</option>

            <option value="CLOSED">Closed</option>

            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as "" | RepairOrderPriority)
            }
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          >
            <option value="">All priorities</option>

            <option value="STANDARD">Standard</option>

            <option value="RUSH">Rush</option>

            <option value="EMERGENCY">Emergency</option>

            <option value="HOLD">Hold</option>
          </select>
        </div>

        {isLoading ? (
          <RepairOrderTableMessage>
            Loading repair orders...
          </RepairOrderTableMessage>
        ) : isError ? (
          <RepairOrderTableMessage>
            MotoDesk could not load repair orders.
          </RepairOrderTableMessage>
        ) : repairOrders.length === 0 ? (
          <EmptyRepairOrders />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-left">
                    <RepairOrderTableHeading>
                      Repair Order
                    </RepairOrderTableHeading>

                    <RepairOrderTableHeading>Customer</RepairOrderTableHeading>

                    <RepairOrderTableHeading>Vehicle</RepairOrderTableHeading>

                    <RepairOrderTableHeading>Status</RepairOrderTableHeading>

                    <RepairOrderTableHeading>Priority</RepairOrderTableHeading>

                    <RepairOrderTableHeading>Complaint</RepairOrderTableHeading>

                    <RepairOrderTableHeading>Scheduled</RepairOrderTableHeading>
                  </tr>
                </thead>

                <tbody>
                  {repairOrders.map((repairOrder) => (
                    <RepairOrderRow
                      key={repairOrder.id}
                      repairOrder={repairOrder}
                      onOpen={handleOpenRepairOrder}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
              <p className="text-xs text-zinc-500">
                {repairOrders.length} repair order
                {repairOrders.length === 1 ? "" : "s"}
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
          <CreateRepairOrderDialog
            organizationId={organizationId}
            open={createOpen}
            onClose={() => setCreateOpen(false)}
          />

          <RepairOrderDialog
            organizationId={organizationId}
            repairOrder={selectedRepairOrder}
            open={selectedRepairOrder !== null}
            onClose={handleCloseRepairOrder}
          />
        </>
      ) : null}
    </div>
  );
}

function getCustomerName(repairOrder: RepairOrder): string {
  if (repairOrder.customer.companyName) {
    return repairOrder.customer.companyName;
  }

  const name = [repairOrder.customer.firstName, repairOrder.customer.lastName]
    .filter(Boolean)
    .join(" ");

  return name || "Unnamed customer";
}
