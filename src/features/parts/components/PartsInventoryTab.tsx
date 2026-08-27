"use client";

import {
  AlertTriangle,
  Boxes,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import { useArchivePartMutation, useGetPartsQuery } from "@/store/api/partsApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

import type { Part } from "../part.types";

import { PartDialog } from "./PartDialog";

import { PartInventoryAdjustDialog } from "./PartInventoryAdjustDialog";

export function PartsInventoryTab() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const [search, setSearch] = useState("");

  const [brandFilter, setBrandFilter] = useState("");

  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);

  const [editingPart, setEditingPart] = useState<Part | null>(null);

  const [inventoryPart, setInventoryPart] = useState<Part | null>(null);

  const {
    data: parts = [],
    isLoading,
    isFetching,
    isError,
  } = useGetPartsQuery(
    {
      organizationId: organizationId ?? "",

      search: search.trim() || undefined,

      lowStock: lowStockOnly || undefined,

      isActive: true,
    },
    {
      skip: !organizationId,
    },
  );

  const [archivePart, { isLoading: isArchiving }] = useArchivePartMutation();

  const brands = useMemo(
    () =>
      Array.from(
        new Set(
          parts
            .map((part) => part.brand)
            .filter((brand): brand is string => Boolean(brand)),
        ),
      ).sort(),
    [parts],
  );

  const visibleParts = brandFilter
    ? parts.filter((part) => part.brand === brandFilter)
    : parts;

  const lowStockCount = parts.filter(isPartLowStock).length;

  async function handleArchive(part: Part) {
    if (!organizationId) {
      return;
    }

    const confirmed = window.confirm(`Archive "${part.description}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await archivePart({
        organizationId,
        partId: part.id,
      }).unwrap();

      toast.success("Part archived.");
    } catch {
      toast.error("MotoDesk could not archive the part.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
          <span>
            <strong className="text-zinc-900">{parts.length}</strong> parts
          </span>

          <span>
            <strong className="text-amber-600">{lowStockCount}</strong> low
            stock
          </span>
        </div>

        <button
          type="button"
          disabled={!organizationId}
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Part
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search part number, description, brand, category..."
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={brandFilter}
          onChange={(event) => setBrandFilter(event.target.value)}
          className="h-10 min-w-48 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-orange-500"
        >
          <option value="">All brands</option>

          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <label className="flex h-10 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(event) => setLowStockOnly(event.target.checked)}
          />

          <span className="text-sm font-medium text-zinc-700">
            Low stock only
          </span>
        </label>
      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {isLoading ? (
          <TableMessage>Loading parts...</TableMessage>
        ) : isError ? (
          <TableMessage>MotoDesk could not load parts.</TableMessage>
        ) : visibleParts.length === 0 ? (
          <TableMessage>No parts found.</TableMessage>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <Heading>Part #</Heading>

                  <Heading>Description</Heading>

                  <Heading>Brand</Heading>

                  <Heading align="right">On Hand</Heading>

                  <Heading align="right">Allocated</Heading>

                  <Heading align="right">Available</Heading>

                  <Heading align="right">On Order</Heading>

                  <Heading align="right">Cost</Heading>

                  <Heading align="right">Sell</Heading>

                  <Heading>Bin</Heading>

                  <Heading align="right">Actions</Heading>
                </tr>
              </thead>

              <tbody>
                {visibleParts.map((part) => {
                  const lowStock = isPartLowStock(part);

                  const available =
                    Number(part.qtyOnHand) - Number(part.qtyAllocated);

                  return (
                    <tr
                      key={part.id}
                      className={`border-b border-zinc-100 last:border-b-0 ${
                        lowStock ? "bg-amber-50/50" : "hover:bg-zinc-50"
                      }`}
                    >
                      <Cell strong mono>
                        {part.partNumber}
                      </Cell>

                      <Cell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-zinc-900">
                            {part.description}
                          </span>

                          {lowStock ? (
                            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                          ) : null}
                        </div>
                      </Cell>

                      <Cell>{part.brand || "—"}</Cell>

                      <Cell align="right">
                        <span
                          className={
                            lowStock
                              ? "font-bold text-amber-700"
                              : "font-semibold text-zinc-900"
                          }
                        >
                          {part.qtyOnHand}
                        </span>
                      </Cell>

                      <Cell align="right">{part.qtyAllocated}</Cell>

                      <Cell align="right" strong>
                        {formatQuantity(available)}
                      </Cell>

                      <Cell align="right">{part.qtyOnOrder}</Cell>

                      <Cell align="right">
                        {formatCurrency(part.costPrice)}
                      </Cell>

                      <Cell align="right" strong>
                        {formatCurrency(part.sellPrice)}
                      </Cell>

                      <Cell mono>{part.location || "—"}</Cell>

                      <Cell align="right">
                        <div className="flex justify-end gap-1">
                          <TableButton
                            icon={SlidersHorizontal}
                            label="Inventory"
                            onClick={() => setInventoryPart(part)}
                          />

                          <TableButton
                            icon={Pencil}
                            label="Edit"
                            onClick={() => setEditingPart(part)}
                          />

                          <TableButton
                            icon={Trash2}
                            label="Archive"
                            disabled={isArchiving}
                            danger
                            onClick={() => void handleArchive(part)}
                          />
                        </div>
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
            {visibleParts.length} part
            {visibleParts.length === 1 ? "" : "s"}
          </span>

          {isFetching ? (
            <span className="text-xs text-zinc-400">Updating...</span>
          ) : null}
        </div>
      </section>

      {organizationId ? (
        <>
          <PartDialog
            organizationId={organizationId}
            open={createOpen}
            onClose={() => setCreateOpen(false)}
          />

          <PartDialog
            organizationId={organizationId}
            part={editingPart}
            open={editingPart !== null}
            onClose={() => setEditingPart(null)}
          />

          <PartInventoryAdjustDialog
            organizationId={organizationId}
            part={inventoryPart}
            open={inventoryPart !== null}
            onClose={() => setInventoryPart(null)}
          />
        </>
      ) : null}
    </div>
  );
}

function isPartLowStock(part: Part): boolean {
  return Number(part.qtyOnHand) <= Number(part.reorderPoint);
}

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

function TableButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: typeof Pencil;

  label: string;

  onClick: () => void;

  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
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

function TableMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-48 place-items-center p-6 text-sm text-zinc-500">
      {children}
    </div>
  );
}

function formatCurrency(value: string): string {
  const amount = Number(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatQuantity(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
