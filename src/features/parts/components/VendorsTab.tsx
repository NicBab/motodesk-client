"use client";

import {
  ArchiveRestore,
  Building2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import {
  useArchiveVendorMutation,
  useGetVendorsQuery,
  useRestoreVendorMutation,
} from "@/store/api/vendorsApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

import type { Vendor } from "../vendor.types";

import { VendorDialog } from "./VendorDialog";

type VendorView = "active" | "archived";

export function VendorsTab() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const [view, setView] = useState<VendorView>("active");

  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);

  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const archived = view === "archived";

  const {
    data: vendors = [],
    isLoading,
    isFetching,
    isError,
  } = useGetVendorsQuery(
    {
      organizationId: organizationId ?? "",

      search: search.trim() || undefined,

      isActive: !archived,
    },
    {
      skip: !organizationId,
    },
  );

  const [archiveVendor, { isLoading: isArchiving }] =
    useArchiveVendorMutation();

  const [restoreVendor, { isLoading: isRestoring }] =
    useRestoreVendorMutation();

  const actionDisabled = isArchiving || isRestoring;

  async function handleArchive(vendor: Vendor) {
    if (!organizationId) {
      return;
    }

    const confirmed = window.confirm(`Archive "${vendor.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await archiveVendor({
        organizationId,

        vendorId: vendor.id,
      }).unwrap();

      toast.success("Vendor archived.");
    } catch {
      toast.error("MotoDesk could not archive the vendor.");
    }
  }

  async function handleRestore(vendor: Vendor) {
    if (!organizationId) {
      return;
    }

    try {
      await restoreVendor({
        organizationId,

        vendorId: vendor.id,
      }).unwrap();

      toast.success("Vendor restored.");
    } catch {
      toast.error("MotoDesk could not restore the vendor.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900">
            <Building2 className="h-4 w-4 text-orange-500" />
            Vendors
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            {vendors.length} {archived ? "archived" : "active"} vendor
            {vendors.length === 1 ? "" : "s"}
          </p>
        </div>

        {!archived ? (
          <button
            type="button"
            disabled={!organizationId}
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Vendor
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">


        <div className="relative w-full max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              archived
                ? "Search archived vendors..."
                : "Search name, contact, email, account number..."
            }
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500"
          />
        </div>
                <div className="inline-flex w-fit rounded-lg border border-zinc-200 bg-white p-1">
          <ViewButton
            active={view === "active"}
            onClick={() => setView("active")}
          >
            Active
          </ViewButton>

          <ViewButton
            active={view === "archived"}
            onClick={() => setView("archived")}
          >
            Archived
          </ViewButton>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {isLoading ? (
          <TableMessage>Loading vendors...</TableMessage>
        ) : isError ? (
          <TableMessage>MotoDesk could not load vendors.</TableMessage>
        ) : vendors.length === 0 ? (
          <TableMessage>
            {archived ? "No archived vendors." : "No active vendors found."}
          </TableMessage>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <Heading>Vendor</Heading>

                  <Heading>Contact</Heading>

                  <Heading>Phone</Heading>

                  <Heading>Email</Heading>

                  <Heading>Account #</Heading>

                  <Heading>Location</Heading>

                  <Heading>Status</Heading>

                  <Heading align="right">Actions</Heading>
                </tr>
              </thead>

              <tbody>
                {vendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50"
                  >
                    <Cell strong>{vendor.name}</Cell>

                    <Cell>{vendor.contactName || "—"}</Cell>

                    <Cell>{vendor.contactPhone || vendor.phone || "—"}</Cell>

                    <Cell>{vendor.contactEmail || vendor.email || "—"}</Cell>

                    <Cell mono>{vendor.accountNumber || "—"}</Cell>

                    <Cell>{formatLocation(vendor)}</Cell>

                    <Cell>
                      {vendor.isActive ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-600">
                          Archived
                        </span>
                      )}
                    </Cell>

                    <Cell align="right">
                      <div className="flex justify-end gap-1">
                        {vendor.isActive ? (
                          <>
                            <ActionButton
                              icon={Pencil}
                              label="Edit"
                              disabled={actionDisabled}
                              onClick={() => setEditingVendor(vendor)}
                            />

                            <ActionButton
                              icon={Trash2}
                              label="Archive"
                              danger
                              disabled={actionDisabled}
                              onClick={() => void handleArchive(vendor)}
                            />
                          </>
                        ) : (
                          <ActionButton
                            icon={ArchiveRestore}
                            label="Restore"
                            disabled={actionDisabled}
                            onClick={() => void handleRestore(vendor)}
                          />
                        )}
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
            {vendors.length} vendor
            {vendors.length === 1 ? "" : "s"}
          </span>

          {isFetching ? (
            <span className="text-xs text-zinc-400">Updating...</span>
          ) : null}
        </div>
      </section>

      {organizationId && !archived ? (
        <>
          <VendorDialog
            organizationId={organizationId}
            open={createOpen}
            onClose={() => setCreateOpen(false)}
          />

          <VendorDialog
            organizationId={organizationId}
            vendor={editingVendor}
            open={editingVendor !== null}
            onClose={() => setEditingVendor(null)}
          />
        </>
      ) : null}
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;

  onClick: () => void;

  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 rounded-md px-3 text-xs font-semibold transition ${
        active
          ? "bg-orange-50 text-orange-700"
          : "text-zinc-500 hover:text-zinc-900"
      }`}
    >
      {children}
    </button>
  );
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
      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 ${
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
      className={`px-5 py-3 text-sm ${align === "right" ? "text-right" : ""} ${
        strong ? "font-semibold text-zinc-900" : "text-zinc-600"
      } ${mono ? "font-mono text-xs" : ""}`}
    >
      {children}
    </td>
  );
}

function ActionButton({
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
      disabled={disabled}
      title={label}
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

function formatLocation(vendor: Vendor): string {
  return [vendor.city, vendor.state].filter(Boolean).join(", ") || "—";
}
