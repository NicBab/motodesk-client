"use client";

import {
  CheckCircle2,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  Send,
} from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import {
  useClosePartReturnMutation,
  useGetPartReturnsQuery,
  useShipPartReturnMutation,
  useUpdatePartReturnCreditMutation,
} from "@/store/api/partReturnsApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

import type {
  PartReturn,
  PartReturnStatus,
  PartReturnType,
} from "../part-return.types";

import { PartReturnDialog } from "./PartReturnDialog";

//************************************************************** */

export function ReturnsTab() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<"" | PartReturnStatus>("");

  const [returnType, setReturnType] = useState<"" | PartReturnType>("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editing, setEditing] = useState<PartReturn | null>(null);

  const {
    data: partReturns = [],
    isLoading,
    isFetching,
    isError,
  } = useGetPartReturnsQuery(
    {
      organizationId: organizationId ?? "",

      search: search.trim() || undefined,

      status: status || undefined,

      returnType: returnType || undefined,

      isActive: true,
    },
    {
      skip: !organizationId,
    },
  );

  const [shipPartReturn, { isLoading: isShipping }] =
    useShipPartReturnMutation();

  const [updatePartReturnCredit, { isLoading: isCrediting }] =
    useUpdatePartReturnCreditMutation();

  const [closePartReturn, { isLoading: isClosing }] =
    useClosePartReturnMutation();

  const disabled = isShipping || isCrediting || isClosing;

  //************************************************************** */

  function handleCreate() {
    setEditing(null);

    setDialogOpen(true);
  }

  //************************************************************** */

  function handleEdit(partReturn: PartReturn) {
    setEditing(partReturn);

    setDialogOpen(true);
  }

  //************************************************************** */

  async function handleShip(partReturn: PartReturn) {
    if (!organizationId) {
      return;
    }

    if (
      !window.confirm(`Mark return #${partReturn.returnNumber} as shipped?`)
    ) {
      return;
    }

    try {
      await shipPartReturn({
        organizationId,

        partReturnId: partReturn.id,
      }).unwrap();

      toast.success(`Return #${partReturn.returnNumber} shipped.`);
    } catch {
      toast.error("MotoDesk could not ship the return.");
    }
  }

  //************************************************************** */

  async function handleCredit(partReturn: PartReturn) {
    if (!organizationId) {
      return;
    }

    const rawAmount = window.prompt(
      `Credit amount for return #${partReturn.returnNumber}:`,
      String(Number(partReturn.creditAmount)),
    );

    if (rawAmount === null) {
      return;
    }

    const creditAmount = Number(rawAmount);

    if (!Number.isFinite(creditAmount) || creditAmount < 0) {
      toast.error("Enter a valid credit amount.");

      return;
    }

    try {
      await updatePartReturnCredit({
        organizationId,

        partReturnId: partReturn.id,

        data: {
          creditAmount,

          creditStatus: "RECEIVED",
        },
      }).unwrap();

      toast.success(`Credit recorded for return #${partReturn.returnNumber}.`);
    } catch {
      toast.error("MotoDesk could not record the return credit.");
    }
  }

  //************************************************************** */

  async function handleClose(partReturn: PartReturn) {
    if (!organizationId) {
      return;
    }

    const inventoryReturn = isInventoryReturnType(partReturn.returnType);

    const message = inventoryReturn
      ? `Return ${formatQuantity(
          Number(partReturn.quantity),
        )} of ${partReturn.partNumber ?? "this part"} to inventory and close return #${partReturn.returnNumber}?`
      : `Close return #${partReturn.returnNumber}?`;

    if (!window.confirm(message)) {
      return;
    }

    try {
      await closePartReturn({
        organizationId,

        partReturnId: partReturn.id,
      }).unwrap();

      toast.success(
        inventoryReturn
          ? `Return #${partReturn.returnNumber} returned to inventory and closed.`
          : `Return #${partReturn.returnNumber} closed.`,
      );
    } catch {
      toast.error("MotoDesk could not close the return.");
    }
  }

  //************************************************************** */

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-bold text-zinc-900">Returns</h2>

          <p className="mt-1 text-xs text-zinc-500">
            {partReturns.length} return
            {partReturns.length === 1 ? "" : "s"}
          </p>
        </div>

        <button
          type="button"
          disabled={!organizationId}
          onClick={handleCreate}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          New Return
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search return #, part, vendor, authorization..."
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500"
          />
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "" | PartReturnStatus)
          }
          className={selectClassName}
        >
          <option value="">All statuses</option>

          <option value="PENDING">Pending</option>

          <option value="SHIPPED">Shipped</option>

          <option value="CREDITED">Credited</option>

          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={returnType}
          onChange={(event) =>
            setReturnType(event.target.value as "" | PartReturnType)
          }
          className={selectClassName}
        >
          <option value="">All return types</option>

          <option value="TO_VENDOR">To Vendor</option>

          <option value="TO_INVENTORY">To Inventory</option>

          <option value="WRONG_PART">Wrong Part</option>

          <option value="DAMAGED">Damaged</option>

          <option value="UNUSED_RO_PART">Unused RO Part</option>

          <option value="CORE_RETURN">Core Return</option>

          <option value="WARRANTY_RETURN">Warranty Return</option>
        </select>
      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {isLoading ? (
          <TableMessage>Loading returns...</TableMessage>
        ) : isError ? (
          <TableMessage>MotoDesk could not load returns.</TableMessage>
        ) : partReturns.length === 0 ? (
          <TableMessage>No returns found.</TableMessage>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <Heading>Return #</Heading>

                  <Heading>Type</Heading>

                  <Heading>Part</Heading>

                  <Heading align="right">Qty</Heading>

                  <Heading>Vendor</Heading>

                  <Heading>PO / RO</Heading>

                  <Heading align="right">Credit</Heading>

                  <Heading>Status</Heading>

                  <Heading align="right">Actions</Heading>
                </tr>
              </thead>

              <tbody>
                {partReturns.map((partReturn) => (
                  <tr
                    key={partReturn.id}
                    className="border-b border-zinc-100 hover:bg-zinc-50"
                  >
                    <Cell strong mono>
                      #{partReturn.returnNumber}
                    </Cell>

                    <Cell>{formatReturnType(partReturn.returnType)}</Cell>

                    <Cell>
                      <p className="font-semibold text-zinc-900">
                        {partReturn.description ?? "—"}
                      </p>

                      <p className="mt-0.5 font-mono text-xs text-zinc-500">
                        {partReturn.partNumber ?? "—"}
                      </p>
                    </Cell>

                    <Cell align="right">
                      {formatQuantity(Number(partReturn.quantity))}
                    </Cell>

                    <Cell>{partReturn.vendorName ?? "—"}</Cell>

                    <Cell>
                      <div className="space-y-0.5 text-xs">
                        {partReturn.poNumber ? (
                          <p>PO #{partReturn.poNumber}</p>
                        ) : null}

                        {partReturn.roNumber ? (
                          <p>RO #{partReturn.roNumber}</p>
                        ) : null}

                        {!partReturn.poNumber && !partReturn.roNumber
                          ? "—"
                          : null}
                      </div>
                    </Cell>

                    <Cell align="right">
                      {Number(partReturn.creditAmount) > 0 ? (
                        <>
                          <p className="font-semibold">
                            {formatMoney(Number(partReturn.creditAmount))}
                          </p>

                          <p
                            className={`text-xs ${
                              partReturn.creditStatus === "RECEIVED"
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }`}
                          >
                            {formatStatus(partReturn.creditStatus)}
                          </p>
                        </>
                      ) : (
                        "—"
                      )}
                    </Cell>

                    <Cell>
                      <StatusBadge status={partReturn.status} />
                    </Cell>

                    <Cell align="right">
                      <div className="flex justify-end gap-1">
                        {partReturn.status === "PENDING" ? (
                          <>
                            <ActionButton
                              title="Edit"
                              disabled={disabled}
                              onClick={() => handleEdit(partReturn)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </ActionButton>

                            {isInventoryReturnType(partReturn.returnType) ? (
                              <ActionButton
                                title="Return to Inventory"
                                disabled={disabled}
                                onClick={() => void handleClose(partReturn)}
                              >
                                <PackageCheck className="h-3.5 w-3.5" />
                                Return to Stock
                              </ActionButton>
                            ) : (
                              <ActionButton
                                title="Ship"
                                disabled={disabled}
                                onClick={() => void handleShip(partReturn)}
                              >
                                <Send className="h-3.5 w-3.5" />
                                Ship
                              </ActionButton>
                            )}
                          </>
                        ) : null}

                        {partReturn.status === "SHIPPED" ? (
                          <ActionButton
                            title="Record Credit"
                            disabled={disabled}
                            onClick={() => void handleCredit(partReturn)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Credit
                          </ActionButton>
                        ) : null}

                        {partReturn.status === "CREDITED" ? (
                          <ActionButton
                            title="Close"
                            disabled={disabled}
                            onClick={() => void handleClose(partReturn)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Close
                          </ActionButton>
                        ) : null}
                      </div>
                    </Cell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
          <span className="text-xs text-zinc-500">
            {partReturns.length} return
            {partReturns.length === 1 ? "" : "s"}
          </span>

          {isFetching ? (
            <span className="text-xs text-zinc-400">Updating...</span>
          ) : null}
        </div>
      </section>

      {organizationId ? (
        <PartReturnDialog
          organizationId={organizationId}
          open={dialogOpen}
          partReturn={editing}
          onClose={() => {
            setDialogOpen(false);

            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

//************************************************************** */

function isInventoryReturnType(returnType: PartReturnType): boolean {
  return returnType === "TO_INVENTORY" || returnType === "UNUSED_RO_PART";
}

//************************************************************** */

function StatusBadge({ status }: { status: PartReturnStatus }) {
  const className =
    status === "CLOSED"
      ? "border-zinc-200 bg-zinc-100 text-zinc-700"
      : status === "CREDITED"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : status === "SHIPPED"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${className}`}
    >
      {formatStatus(status)}
    </span>
  );
}

//************************************************************** */

function ActionButton({
  children,
  title,
  disabled,
  onClick,
}: {
  children: React.ReactNode;

  title: string;

  disabled?: boolean;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
    >
      {children}
    </button>
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

function TableMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-64 place-items-center p-8 text-center text-sm font-medium text-zinc-500">
      {children}
    </div>
  );
}

//************************************************************** */

function formatReturnType(value: PartReturnType): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

function formatStatus(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
  }).format(value);
}

//************************************************************** */

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",

    currency: "USD",
  }).format(value);
}

//************************************************************** */

const selectClassName =
  "h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none focus:border-orange-500";

//************************************************************** */
