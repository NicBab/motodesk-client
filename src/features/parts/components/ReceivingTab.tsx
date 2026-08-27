"use client";

import { Package, Search } from "lucide-react";

import { useMemo, useState } from "react";

import { useGetPurchaseOrdersQuery } from "@/store/api/purchaseOrdersApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

import type {
  PurchaseOrder,
  PurchaseOrderStatus,
} from "../purchase-order.types";

import { ReceivePurchaseOrderDialog } from "./ReceivePurchaseOrderDialog"

//************************************************************** */

type ReceivingStatusFilter =
  | ""
  | Extract<
      PurchaseOrderStatus,
      "ORDERED" | "PARTIALLY_RECEIVED"
    >;

//************************************************************** */

export function ReceivingTab() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<ReceivingStatusFilter>("");

  const [receivingPurchaseOrder, setReceivingPurchaseOrder] =
    useState<PurchaseOrder | null>(null);

  //************************************************************** */

  const {
    data: purchaseOrders = [],
    isLoading,
    isFetching,
    isError,
  } = useGetPurchaseOrdersQuery(
    {
      organizationId: organizationId ?? "",

      isActive: true,
    },
    {
      skip: !organizationId,
    },
  );

  //************************************************************** */

  const receivingQueue = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return purchaseOrders
      .filter((purchaseOrder) =>
        ["ORDERED", "PARTIALLY_RECEIVED"].includes(
          purchaseOrder.status,
        ),
      )
      .filter(
        (purchaseOrder) =>
          !statusFilter ||
          purchaseOrder.status === statusFilter,
      )
      .filter((purchaseOrder) => {
        if (!searchValue) {
          return true;
        }

        if (
          String(purchaseOrder.poNumber)
            .toLowerCase()
            .includes(searchValue)
        ) {
          return true;
        }

        if (
          purchaseOrder.vendor.name
            .toLowerCase()
            .includes(searchValue)
        ) {
          return true;
        }

        if (
          purchaseOrder.vendorReference
            ?.toLowerCase()
            .includes(searchValue)
        ) {
          return true;
        }

        return purchaseOrder.lines.some(
          (line) =>
            line.partNumber
              .toLowerCase()
              .includes(searchValue) ||
            line.description
              .toLowerCase()
              .includes(searchValue),
        );
      });
  }, [purchaseOrders, search, statusFilter]);

  //************************************************************** */

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-zinc-900">
          Receiving
        </h2>

        <p className="mt-1 text-xs text-zinc-500">
          {receivingQueue.length} purchase order
          {receivingQueue.length === 1 ? "" : "s"} awaiting receipt
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search PO #, vendor, reference, or part..."
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as ReceivingStatusFilter,
            )
          }
          className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none focus:border-orange-500"
        >
          <option value="">All statuses</option>

          <option value="ORDERED">Ordered</option>

          <option value="PARTIALLY_RECEIVED">
            Partially Received
          </option>
        </select>
      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {isLoading ? (
          <TableMessage>Loading receiving queue...</TableMessage>
        ) : isError ? (
          <TableMessage>
            MotoDesk could not load the receiving queue.
          </TableMessage>
        ) : receivingQueue.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <Heading>PO #</Heading>

                  <Heading>Vendor</Heading>

                  <Heading>Status</Heading>

                  <Heading align="right">Lines</Heading>

                  <Heading align="right">Received</Heading>

                  <Heading>Expected</Heading>

                  <Heading align="right">Action</Heading>
                </tr>
              </thead>

              <tbody>
                {receivingQueue.map((purchaseOrder) => {
                  const totalOrdered =
                    purchaseOrder.lines.reduce(
                      (sum, line) =>
                        sum + toNumber(line.orderedQty),
                      0,
                    );

                  const totalReceived =
                    purchaseOrder.lines.reduce(
                      (sum, line) =>
                        sum + toNumber(line.receivedQty),
                      0,
                    );

                  return (
                    <tr
                      key={purchaseOrder.id}
                      className="border-b border-zinc-100 transition hover:bg-zinc-50"
                    >
                      <Cell strong mono>
                        #{purchaseOrder.poNumber}
                      </Cell>

                      <Cell strong>
                        {purchaseOrder.vendor.name}
                      </Cell>

                      <Cell>
                        <StatusBadge
                          status={purchaseOrder.status}
                        />
                      </Cell>

                      <Cell align="right">
                        {purchaseOrder.lines.length}
                      </Cell>

                      <Cell align="right">
                        <span
                          className={
                            totalReceived > 0
                              ? "font-bold text-amber-600"
                              : "font-semibold text-zinc-600"
                          }
                        >
                          {formatQuantity(totalReceived)} /{" "}
                          {formatQuantity(totalOrdered)}
                        </span>
                      </Cell>

                      <Cell>
                        {purchaseOrder.expectedAt
                          ? formatDate(
                              purchaseOrder.expectedAt,
                            )
                          : "—"}
                      </Cell>

                      <Cell align="right">
                        <button
                          type="button"
                          disabled={!organizationId}
                          onClick={() =>
                            setReceivingPurchaseOrder(
                              purchaseOrder,
                            )
                          }
                          className="inline-flex h-8 items-center gap-2 rounded-lg bg-orange-500 px-3 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
                        >
                          <Package className="h-3.5 w-3.5" />

                          Receive
                        </button>
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
            {receivingQueue.length} awaiting receipt
          </span>

          {isFetching ? (
            <span className="text-xs text-zinc-400">
              Updating...
            </span>
          ) : null}
        </div>
      </section>

      {organizationId ? (
        <ReceivePurchaseOrderDialog
          organizationId={organizationId}
          purchaseOrder={receivingPurchaseOrder}
          open={receivingPurchaseOrder !== null}
          onClose={() => setReceivingPurchaseOrder(null)}
        />
      ) : null}
    </div>
  );
}

//************************************************************** */

function EmptyState() {
  return (
    <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-zinc-100">
          <Package className="h-6 w-6 text-zinc-400" />
        </div>

        <p className="mt-3 text-sm font-bold text-zinc-800">
          No purchase orders awaiting receiving
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          Ordered purchase orders will appear here until all
          quantities have been received.
        </p>
      </div>
    </div>
  );
}

//************************************************************** */

function StatusBadge({
  status,
}: {
  status: PurchaseOrderStatus;
}) {
  const className =
    status === "PARTIALLY_RECEIVED"
      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
      : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${className}`}
    >
      {formatStatus(status)}
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
      className={`px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500 ${
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
      className={`px-5 py-3 text-sm text-zinc-700 ${
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

function TableMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-64 place-items-center p-8 text-center text-sm font-medium text-zinc-500">
      {children}
    </div>
  );
}

//************************************************************** */

function toNumber(value: string | number | null | undefined): number {
  const number = Number(value ?? 0);

  return Number.isFinite(number) ? number : 0;
}

//************************************************************** */

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
  }).format(value);
}

//************************************************************** */

function formatStatus(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

//************************************************************** */