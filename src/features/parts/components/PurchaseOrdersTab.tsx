"use client";

import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Plus,
  ReceiptText,
  Search,
  Send,
  XCircle,
  Pencil
} from "lucide-react";

import { Fragment, useState } from "react";

import { toast } from "sonner";

import {
  useCancelPurchaseOrderMutation,
  useGetPurchaseOrdersQuery,
  useOrderPurchaseOrderMutation,
} from "@/store/api/purchaseOrdersApi";

import { useGetVendorsQuery } from "@/store/api/vendorsApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

import type {
  PurchaseOrder,
  PurchaseOrderReceipt,
  PurchaseOrderStatus,
} from "../purchase-order.types";

import { PurchaseOrderDialog } from "./PurchaseOrderDialog";

//************************************************************** */

export function PurchaseOrdersTab() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | PurchaseOrderStatus>("");
  const [vendorId, setVendorId] = useState("");

  const [createOpen, setCreateOpen] = useState(false);

  const [editingPurchaseOrder, setEditingPurchaseOrder] =
    useState<PurchaseOrder | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: purchaseOrders = [],
    isLoading,
    isFetching,
    isError,
  } = useGetPurchaseOrdersQuery(
    {
      organizationId: organizationId ?? "",
      search: search.trim() || undefined,
      status: status || undefined,
      vendorId: vendorId || undefined,
      isActive: true,
    },
    {
      skip: !organizationId,
    },
  );

  const { data: vendors = [] } = useGetVendorsQuery(
    {
      organizationId: organizationId ?? "",
      isActive: true,
    },
    {
      skip: !organizationId,
    },
  );

  const [orderPurchaseOrder, { isLoading: isOrdering }] =
    useOrderPurchaseOrderMutation();

  const [cancelPurchaseOrder, { isLoading: isCancelling }] =
    useCancelPurchaseOrderMutation();

  const disabled = isOrdering || isCancelling;

  //************************************************************** */

  function handleCreate() {
    setEditingPurchaseOrder(null);

    setCreateOpen(true);
  }

  function handleEdit(purchaseOrder: PurchaseOrder) {
    if (purchaseOrder.status !== "DRAFT") {
      return;
    }

    setEditingPurchaseOrder(purchaseOrder);

    setCreateOpen(true);
  }

  function handleDialogClose() {
    setCreateOpen(false);

    setEditingPurchaseOrder(null);
  }

  //************************************************************** */

  async function handleOrder(purchaseOrder: PurchaseOrder) {
    if (!organizationId) {
      return;
    }

    if (!window.confirm(`Order PO #${purchaseOrder.poNumber}?`)) {
      return;
    }

    try {
      await orderPurchaseOrder({
        organizationId,
        purchaseOrderId: purchaseOrder.id,
      }).unwrap();

      toast.success(`PO #${purchaseOrder.poNumber} ordered.`);
    } catch {
      toast.error("MotoDesk could not order the purchase order.");
    }
  }

  //************************************************************** */

  async function handleCancel(purchaseOrder: PurchaseOrder) {
    if (!organizationId) {
      return;
    }

    const notes = window.prompt(
      `Cancellation reason for PO #${purchaseOrder.poNumber}:`,
      "",
    );

    if (notes === null) {
      return;
    }

    try {
      await cancelPurchaseOrder({
        organizationId,
        purchaseOrderId: purchaseOrder.id,
        notes: notes.trim() || undefined,
      }).unwrap();

      toast.success(`PO #${purchaseOrder.poNumber} cancelled.`);
    } catch {
      toast.error("MotoDesk could not cancel the purchase order.");
    }
  }

  //************************************************************** */

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-zinc-900">Purchase Orders</h2>

          <p className="mt-1 text-xs text-zinc-500">
            {purchaseOrders.length} purchase order
            {purchaseOrders.length === 1 ? "" : "s"}
          </p>
        </div>

        <button
          type="button"
          disabled={!organizationId}
          onClick={handleCreate}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Create PO
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search vendor, reference, part #, description..."
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500"
          />
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "" | PurchaseOrderStatus)
          }
          className={selectClassName}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ORDERED">Ordered</option>
          <option value="PARTIALLY_RECEIVED">Partially Received</option>
          <option value="RECEIVED">Received</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={vendorId}
          onChange={(event) => setVendorId(event.target.value)}
          className={selectClassName}
        >
          <option value="">All vendors</option>

          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name}
            </option>
          ))}
        </select>
      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {isLoading ? (
          <TableMessage>Loading purchase orders...</TableMessage>
        ) : isError ? (
          <TableMessage>MotoDesk could not load purchase orders.</TableMessage>
        ) : purchaseOrders.length === 0 ? (
          <TableMessage>No purchase orders found.</TableMessage>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <Heading>PO #</Heading>
                  <Heading>Vendor</Heading>
                  <Heading>Status</Heading>
                  <Heading>Reference</Heading>
                  <Heading>Ordered</Heading>
                  <Heading>Expected</Heading>
                  <Heading align="right">Lines</Heading>
                  <Heading align="right">Receipts</Heading>
                  <Heading align="right">Total</Heading>
                  <Heading align="right">Actions</Heading>
                </tr>
              </thead>

              <tbody>
                {purchaseOrders.map((purchaseOrder) => {
                  const expanded = expandedId === purchaseOrder.id;

                  return (
                    <Fragment key={purchaseOrder.id}>
                      <tr className="border-b border-zinc-100 hover:bg-zinc-50">
                        <Cell strong mono>
                          #{purchaseOrder.poNumber}
                        </Cell>

                        <Cell strong>{purchaseOrder.vendor.name}</Cell>

                        <Cell>
                          <StatusBadge status={purchaseOrder.status} />
                        </Cell>

                        <Cell>{purchaseOrder.vendorReference || "—"}</Cell>

                        <Cell>
                          {purchaseOrder.orderedAt
                            ? formatDate(purchaseOrder.orderedAt)
                            : "—"}
                        </Cell>

                        <Cell>
                          {purchaseOrder.expectedAt
                            ? formatDate(purchaseOrder.expectedAt)
                            : "—"}
                        </Cell>

                        <Cell align="right">{purchaseOrder.lines.length}</Cell>

                        <Cell align="right">
                          {purchaseOrder.receipts?.length ?? 0}
                        </Cell>

                        <Cell align="right" strong>
                          {formatCurrency(getPoTotal(purchaseOrder))}
                        </Cell>

                        <Cell align="right">
                          <div className="flex justify-end gap-1">
                            {purchaseOrder.status === "DRAFT" ? (
                              <>
                                <ActionButton
                                  icon={Pencil}
                                  label="Edit"
                                  disabled={disabled}
                                  onClick={() => handleEdit(purchaseOrder)}
                                />

                                <ActionButton
                                  icon={Send}
                                  label="Order"
                                  disabled={disabled}
                                  onClick={() =>
                                    void handleOrder(purchaseOrder)
                                  }
                                />
                              </>
                            ) : null}

                            {["ORDERED", "PARTIALLY_RECEIVED"].includes(
                              purchaseOrder.status,
                            ) ? (
                              <ActionButton
                                icon={XCircle}
                                label="Cancel"
                                danger
                                disabled={disabled}
                                onClick={() => void handleCancel(purchaseOrder)}
                              />
                            ) : null}

                            <ActionButton
                              icon={expanded ? ChevronUp : ChevronDown}
                              label={expanded ? "Hide" : "View"}
                              disabled={false}
                              onClick={() =>
                                setExpandedId(
                                  expanded ? null : purchaseOrder.id,
                                )
                              }
                            />
                          </div>
                        </Cell>
                      </tr>

                      {expanded ? (
                        <tr className="border-b border-zinc-100 bg-zinc-50/60">
                          <td colSpan={10} className="px-5 py-4">
                            <PoDetails
                              purchaseOrder={purchaseOrder}
                              onEdit={handleEdit}
                            />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
          <span className="text-xs text-zinc-500">
            {purchaseOrders.length} purchase order
            {purchaseOrders.length === 1 ? "" : "s"}
          </span>

          {isFetching ? (
            <span className="text-xs text-zinc-400">Updating...</span>
          ) : null}
        </div>
      </section>

      {organizationId ? (
        <PurchaseOrderDialog
          key={
            createOpen
              ? editingPurchaseOrder
                ? `edit-po-${editingPurchaseOrder.id}`
                : "create-po"
              : "closed-po-dialog"
          }
          organizationId={organizationId}
          open={createOpen}
          purchaseOrder={editingPurchaseOrder}
          onClose={handleDialogClose}
        />
      ) : null}
    </div>
  );
}

//************************************************************** */

function PoDetails({
  purchaseOrder,
  onEdit,
}: {
  purchaseOrder: PurchaseOrder;
  onEdit: (purchaseOrder: PurchaseOrder) => void;
}) {
  return (
    <div className="space-y-5">
      {purchaseOrder.status === "DRAFT" ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onEdit(purchaseOrder)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            <Pencil className="h-4 w-4" />
            Edit Draft PO
          </button>
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          icon={CalendarDays}
          label="Created"
          value={formatDateTime(purchaseOrder.createdAt)}
        />

        <Metric
          icon={Send}
          label="Ordered"
          value={
            purchaseOrder.orderedAt
              ? formatDateTime(purchaseOrder.orderedAt)
              : "Not ordered"
          }
        />

        <Metric
          icon={CalendarDays}
          label="Expected"
          value={
            purchaseOrder.expectedAt
              ? formatDateTime(purchaseOrder.expectedAt)
              : "Not set"
          }
        />

        <Metric
          icon={PackageCheck}
          label="Fully Received"
          value={
            purchaseOrder.receivedAt
              ? formatDateTime(purchaseOrder.receivedAt)
              : "Not complete"
          }
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <Heading>Part #</Heading>
              <Heading>Description</Heading>
              <Heading>Source</Heading>
              <Heading align="right">Ordered</Heading>
              <Heading align="right">Received</Heading>
              <Heading align="right">Damaged</Heading>
              <Heading align="right">Backordered</Heading>
              <Heading align="right">Remaining</Heading>
              <Heading align="right">Unit Cost</Heading>
              <Heading align="right">Actual Cost</Heading>
            </tr>
          </thead>

          <tbody>
            {purchaseOrder.lines.map((line) => {
              const ordered = Number(line.orderedQty);
              const received = Number(line.receivedQty);

              return (
                <tr
                  key={line.id}
                  className="border-b border-zinc-100 last:border-b-0"
                >
                  <Cell strong mono>
                    {line.partNumber}
                  </Cell>

                  <Cell>{line.description}</Cell>

                  <Cell>
                    {line.partId ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                        Inventory
                      </span>
                    ) : line.repairOrderPartLineId ? (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                        RO Special Order
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-600">
                        Manual
                      </span>
                    )}
                  </Cell>

                  <Cell align="right">{formatQuantity(ordered)}</Cell>
                  <Cell align="right">{formatQuantity(received)}</Cell>
                  <Cell align="right">
                    {formatQuantity(Number(line.damagedQty))}
                  </Cell>
                  <Cell align="right">
                    {formatQuantity(Number(line.backorderedQty))}
                  </Cell>
                  <Cell align="right">
                    {formatQuantity(Math.max(0, ordered - received))}
                  </Cell>
                  <Cell align="right">
                    {formatCurrency(Number(line.unitCost))}
                  </Cell>
                  <Cell align="right" strong>
                    {line.actualCost !== null
                      ? formatCurrency(Number(line.actualCost))
                      : "—"}
                  </Cell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          label="Shipping"
          value={formatCurrency(Number(purchaseOrder.shippingCost))}
        />

        <Metric
          label="Tax"
          value={formatCurrency(Number(purchaseOrder.taxAmount))}
        />

        <Metric
          label="Total"
          value={formatCurrency(getPoTotal(purchaseOrder))}
          strong
        />
      </div>

      <ReceiptHistory receipts={purchaseOrder.receipts ?? []} />

      {purchaseOrder.notes ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            PO Notes
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">
            {purchaseOrder.notes}
          </p>
        </div>
      ) : null}
    </div>
  );
}

//************************************************************** */

function ReceiptHistory({ receipts }: { receipts: PurchaseOrderReceipt[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-orange-500" />

          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Receipt History
            </h3>
            <p className="text-xs text-zinc-500">
              {receipts.length} receipt{receipts.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-zinc-500">
          No receipts recorded for this purchase order yet.
        </div>
      ) : (
        <div className="divide-y divide-zinc-200">
          {receipts.map((receipt, index) => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              receiptNumber={receipts.length - index}
            />
          ))}
        </div>
      )}
    </section>
  );
}

//************************************************************** */

function ReceiptCard({
  receipt,
  receiptNumber,
}: {
  receipt: PurchaseOrderReceipt;
  receiptNumber: number;
}) {
  const receivedBy = receipt.receivedByMembership?.user
    ? `${receipt.receivedByMembership.user.firstName} ${receipt.receivedByMembership.user.lastName}`.trim()
    : "—";

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold text-zinc-900">
            Receipt #{receiptNumber}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {formatDateTime(receipt.receivedAt)} · Received by {receivedBy}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-600">
          <span>
            Invoice: <strong>{receipt.invoiceNumber || "—"}</strong>
          </span>
          <span>
            Packing Slip: <strong>{receipt.packingSlip || "—"}</strong>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-zinc-200">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <Heading>Part #</Heading>
              <Heading>Description</Heading>
              <Heading align="right">Received</Heading>
              <Heading align="right">Damaged</Heading>
              <Heading align="right">Backordered</Heading>
              <Heading align="right">Actual Cost</Heading>
              <Heading>Bin</Heading>
            </tr>
          </thead>

          <tbody>
            {receipt.lines.map((line) => (
              <tr
                key={line.id}
                className="border-b border-zinc-100 last:border-b-0"
              >
                <Cell strong mono>
                  {line.partNumber}
                </Cell>
                <Cell>{line.description}</Cell>
                <Cell align="right">
                  {formatQuantity(Number(line.receivedQty))}
                </Cell>
                <Cell align="right">
                  {formatQuantity(Number(line.damagedQty))}
                </Cell>
                <Cell align="right">
                  {formatQuantity(Number(line.backorderedQty))}
                </Cell>
                <Cell align="right">
                  {line.actualCost !== null
                    ? formatCurrency(Number(line.actualCost))
                    : "—"}
                </Cell>
                <Cell>{line.binLocation || "—"}</Cell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {receipt.notes ? (
        <p className="whitespace-pre-wrap text-xs text-zinc-500">
          {receipt.notes}
        </p>
      ) : null}
    </div>
  );
}

//************************************************************** */

function getPoTotal(purchaseOrder: PurchaseOrder): number {
  const lines = purchaseOrder.lines.reduce(
    (total, line) => total + Number(line.orderedQty) * Number(line.unitCost),
    0,
  );

  return (
    lines + Number(purchaseOrder.shippingCost) + Number(purchaseOrder.taxAmount)
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
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 ${
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
      className={`px-4 py-3 text-sm ${align === "right" ? "text-right" : ""} ${
        strong ? "font-semibold text-zinc-900" : "text-zinc-600"
      } ${mono ? "font-mono text-xs" : ""}`}
    >
      {children}
    </td>
  );
}

//************************************************************** */

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-600">
      {formatLabel(status)}
    </span>
  );
}

//************************************************************** */

function ActionButton({
  icon: Icon,
  label,
  disabled,
  onClick,
  danger = false,
}: {
  icon: typeof Send;
  label: string;
  disabled: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-semibold transition disabled:opacity-50 ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

//************************************************************** */

function Metric({
  icon: Icon,
  label,
  value,
  strong = false,
}: {
  icon?: typeof CalendarDays;
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <div className="flex items-center gap-1.5">
        {Icon ? <Icon className="h-3.5 w-3.5 text-zinc-400" /> : null}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </p>
      </div>

      <p
        className={`mt-1 ${
          strong
            ? "text-base font-bold text-zinc-900"
            : "text-sm font-semibold text-zinc-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

//************************************************************** */

function TableMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-48 place-items-center p-6 text-sm text-zinc-500">
      {children}
    </div>
  );
}

//************************************************************** */

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

//************************************************************** */

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

//************************************************************** */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(value) ? value : 0);
}

//************************************************************** */

function formatQuantity(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3);
}

//************************************************************** */

const selectClassName =
  "h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 outline-none focus:border-orange-500";

//************************************************************** */
