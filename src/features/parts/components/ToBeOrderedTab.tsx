"use client";

import { CheckSquare, PackagePlus, Search, Square } from "lucide-react";

import { useMemo, useState } from "react";

import { useGetPartOrderDemandQuery } from "@/store/api/partsApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

import type { PartOrderDemandItem } from "../part-order-demand.types";

import {
  PurchaseOrderDialog,
  type PurchaseOrderInitialLine,
} from "./PurchaseOrderDialog";

//************************************************************** */

export function ToBeOrderedTab() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [createPurchaseOrderOpen, setCreatePurchaseOrderOpen] = useState(false);

  //************************************************************** */

  const {
    data: demand = [],
    isLoading,
    isFetching,
    isError,
  } = useGetPartOrderDemandQuery(
    {
      organizationId: organizationId ?? "",

      search: search.trim() || undefined,
    },
    {
      skip: !organizationId,
    },
  );

  //************************************************************** */

  const orderableDemand = useMemo(
    () =>
      demand.filter(
        (item) => item.qtyToOrder > 0 && !item.alreadyOnPurchaseOrder,
      ),
    [demand],
  );

  //************************************************************** */

  const selectedDemand = useMemo(
    () => orderableDemand.filter((item) => selectedIds.has(item.partLineId)),
    [orderableDemand, selectedIds],
  );

  //************************************************************** */

  const initialPurchaseOrderLines: PurchaseOrderInitialLine[] =
    selectedDemand.map((item) => ({
      ...(item.partId
        ? {
            partId: item.partId,
          }
        : {}),

      repairOrderPartLineId: item.partLineId,

      partNumber: item.partNumber,

      description: item.description,

      quantity: item.qtyToOrder,

      unitCost: item.estimatedCost,
    }));

  //************************************************************** */

  const allSelected =
    orderableDemand.length > 0 &&
    orderableDemand.every((item) => selectedIds.has(item.partLineId));

  //************************************************************** */

  function toggleDemand(partLineId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(partLineId)) {
        next.delete(partLineId);
      } else {
        next.add(partLineId);
      }

      return next;
    });
  }

  //************************************************************** */

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());

      return;
    }

    setSelectedIds(new Set(orderableDemand.map((item) => item.partLineId)));
  }

  //************************************************************** */

  function openCreatePurchaseOrder() {
    if (selectedDemand.length === 0) {
      return;
    }

    setCreatePurchaseOrderOpen(true);
  }

  //************************************************************** */

  function closeCreatePurchaseOrder() {
    setCreatePurchaseOrderOpen(false);

    setSelectedIds(new Set());
  }

  //************************************************************** */

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-zinc-900">To Be Ordered</h2>

          <p className="mt-1 text-xs text-zinc-500">
            {orderableDemand.length} part
            {orderableDemand.length === 1 ? "" : "s"} requiring purchase
          </p>
        </div>

        <button
          type="button"
          disabled={selectedDemand.length === 0}
          onClick={openCreatePurchaseOrder}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PackagePlus className="h-4 w-4" />
          Create PO
          {selectedDemand.length > 0 ? ` (${selectedDemand.length})` : ""}
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search part, description, vendor, or customer..."
          className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500"
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {isLoading ? (
          <TableMessage>Loading ordering demand...</TableMessage>
        ) : isError ? (
          <TableMessage>MotoDesk could not load ordering demand.</TableMessage>
        ) : demand.length === 0 ? (
          <TableMessage>No parts currently need ordering.</TableMessage>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="w-12 px-4 py-3 text-left">
                    <button
                      type="button"
                      disabled={orderableDemand.length === 0}
                      onClick={toggleAll}
                      className="text-zinc-500 hover:text-orange-600 disabled:opacity-30"
                      title="Select all orderable lines"
                    >
                      {allSelected ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>

                  <Heading>RO</Heading>

                  <Heading>Customer / Unit</Heading>

                  <Heading>Part</Heading>

                  <Heading align="right">Required</Heading>

                  <Heading align="right">Available</Heading>

                  <Heading align="right">Allocated</Heading>

                  <Heading align="right">Ordered</Heading>

                  <Heading align="right">To Order</Heading>

                  <Heading>Vendor</Heading>

                  <Heading>Status</Heading>
                </tr>
              </thead>

              <tbody>
                {demand.map((item) => {
                  const selectable =
                    item.qtyToOrder > 0 && !item.alreadyOnPurchaseOrder;

                  const selected = selectedIds.has(item.partLineId);

                  return (
                    <tr
                      key={item.partLineId}
                      className="border-b border-zinc-100 hover:bg-zinc-50"
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={!selectable}
                          onClick={() => toggleDemand(item.partLineId)}
                          className="text-zinc-500 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-25"
                          title={
                            item.alreadyOnPurchaseOrder
                              ? "Already on a purchase order"
                              : item.qtyToOrder <= 0
                                ? "No purchase required"
                                : "Select for purchase order"
                          }
                        >
                          {selected ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      <Cell strong mono>
                        #{item.roNumber}
                      </Cell>

                      <Cell>
                        <p className="font-semibold text-zinc-900">
                          {item.customerName}
                        </p>

                        <p className="mt-0.5 text-xs text-zinc-500">
                          {item.vehicleDescription}
                        </p>
                      </Cell>

                      <Cell>
                        <p className="font-semibold text-zinc-900">
                          {item.description}
                        </p>

                        <p className="mt-0.5 font-mono text-xs text-zinc-500">
                          {item.partNumber}
                        </p>

                        {!item.partId ? (
                          <p className="mt-1 text-[11px] font-medium text-zinc-400">
                            Special order
                          </p>
                        ) : null}
                      </Cell>

                      <Cell align="right">
                        {formatQuantity(
                          item.approvedQty > 0
                            ? item.approvedQty
                            : item.requiredQty,
                        )}
                      </Cell>

                      <Cell align="right">
                        {formatQuantity(item.availableQty)}
                      </Cell>

                      <Cell align="right">
                        {formatQuantity(item.allocatedQty)}
                      </Cell>

                      <Cell align="right">
                        {formatQuantity(item.orderedQty)}
                      </Cell>

                      <Cell align="right">
                        <span
                          className={
                            item.qtyToOrder > 0
                              ? "font-bold text-orange-600"
                              : "font-semibold text-emerald-600"
                          }
                        >
                          {formatQuantity(item.qtyToOrder)}
                        </span>
                      </Cell>

                      <Cell>{item.vendorName ?? "—"}</Cell>

                      <Cell>
                        <DemandStatus item={item} />
                      </Cell>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
          <span className="text-xs text-zinc-500">
            {selectedDemand.length} selected
          </span>

          {isFetching ? (
            <span className="text-xs text-zinc-400">Updating...</span>
          ) : null}
        </div>
      </section>

      {organizationId && createPurchaseOrderOpen ? (
        <PurchaseOrderDialog
          key={selectedDemand
            .map((item) => item.partLineId)
            .sort()
            .join("-")}
          organizationId={organizationId}
          open
          initialLines={initialPurchaseOrderLines}
          onClose={closeCreatePurchaseOrder}
        />
      ) : null}
    </div>
  );
}

//************************************************************** */

function DemandStatus({ item }: { item: PartOrderDemandItem }) {
  if (item.alreadyOnPurchaseOrder) {
    return (
      <div>
        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
          ON PO
        </span>

        {item.purchaseOrderNumbers.length > 0 ? (
          <p className="mt-1 text-xs text-zinc-500">
            PO{" "}
            {item.purchaseOrderNumbers.map((number) => `#${number}`).join(", ")}
          </p>
        ) : null}
      </div>
    );
  }

  if (item.status === "NEEDS_REVIEW") {
    return (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
        NEEDS REVIEW
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">
      TO BE ORDERED
    </span>
  );
}

//************************************************************** */

function Heading({
  children,
  align = "left",
}: {
  children: React.ReactNode;

  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

//************************************************************** */

function Cell({
  children,
  align = "left",
  strong = false,
  mono = false,
}: {
  children: React.ReactNode;

  align?: "left" | "right";

  strong?: boolean;

  mono?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 text-sm text-zinc-700 ${
        align === "right" ? "text-right" : "text-left"
      } ${strong ? "font-semibold text-zinc-900" : ""} ${
        mono ? "font-mono" : ""
      }`}
    >
      {children}
    </td>
  );
}

//************************************************************** */

function TableMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-64 place-items-center p-8 text-center text-sm font-medium text-zinc-500">
      {children}
    </div>
  );
}

//************************************************************** */

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
  }).format(value);
}

//************************************************************** */
