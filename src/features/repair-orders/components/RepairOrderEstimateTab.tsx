"use client";

import {
  Bike,
  ClipboardList,
  Package,
  StickyNote,
  User,
  Wrench,
} from "lucide-react";

import { type ReactNode, useState } from "react";

import { toast } from "sonner";

import {
  useGetRepairOrderLaborLinesQuery,
  useGetRepairOrderPartLinesQuery,
  useUpdateRepairOrderMutation,
} from "@/store/api/repairOrdersApi";

import type { RepairOrder } from "../repair-order.types";

type RepairOrderEstimateTabProps = {
  organizationId: string;
  repairOrder: RepairOrder;
};

export function RepairOrderEstimateTab({
  organizationId,
  repairOrder,
}: RepairOrderEstimateTabProps) {
  const [shopSuppliesRate, setShopSuppliesRate] = useState(
    repairOrder.shopSuppliesRate || "6",
  );

  const [discount, setDiscount] = useState(repairOrder.discount || "0");

  const [taxRate, setTaxRate] = useState(repairOrder.taxRate || "0");

  const [deposit, setDeposit] = useState(repairOrder.deposit || "0");

  const { data: laborLines = [], isLoading: isLoadingLabor } =
    useGetRepairOrderLaborLinesQuery({
      organizationId,
      repairOrderId: repairOrder.id,
    });

  const { data: partLines = [], isLoading: isLoadingParts } =
    useGetRepairOrderPartLinesQuery({
      organizationId,
      repairOrderId: repairOrder.id,
    });

  const [updateRepairOrder, { isLoading: isSaving }] =
    useUpdateRepairOrderMutation();

  const laborSubtotal = laborLines.reduce(
    (total, line) => total + Number(line.hours || 0) * Number(line.rate || 0),
    0,
  );

  const partsSubtotal = partLines.reduce(
    (total, line) =>
      total + Number(line.quantity || 0) * Number(line.unitPrice || 0),
    0,
  );

  const base = laborSubtotal + partsSubtotal;

  const suppliesRate = numberValue(shopSuppliesRate);

  const discountAmount = numberValue(discount);

  const currentTaxRate = numberValue(taxRate);

  const depositAmount = numberValue(deposit);

  const shopSupplies = base * (suppliesRate / 100);

  const subtotal = base + shopSupplies;

  const afterDiscount = Math.max(0, subtotal - discountAmount);

  const tax = afterDiscount * (currentTaxRate / 100);

  const total = afterDiscount + tax;

  const balanceDue = Math.max(0, total - depositAmount);

  async function saveFinancialField(
    field: "shopSuppliesRate" | "discount" | "taxRate" | "deposit",
    value: string,
  ) {
    const number = Number(value || 0);

    if (!Number.isFinite(number) || number < 0) {
      toast.error("Enter a valid amount.");

      return;
    }

    if ((field === "shopSuppliesRate" || field === "taxRate") && number > 100) {
      toast.error("Rate cannot exceed 100%.");

      return;
    }

    try {
      await updateRepairOrder({
        organizationId,
        repairOrderId: repairOrder.id,
        data: {
          [field]: number,
        },
      }).unwrap();
    } catch {
      toast.error("MotoDesk could not save the estimate.");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <SectionTitle icon={<ClipboardList className="h-4 w-4" />}>
            Order details
          </SectionTitle>

          <div className="mt-3 grid gap-x-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="RO Number" value={`#${repairOrder.roNumber}`} />

            <InfoRow label="Status" value={formatLabel(repairOrder.status)} />

            <InfoRow
              label="Priority"
              value={formatLabel(repairOrder.priority)}
            />

            <InfoRow label="Opened" value={formatDate(repairOrder.createdAt)} />

            <InfoRow
              label="Promised"
              value={
                repairOrder.promisedDate
                  ? formatDate(repairOrder.promisedDate)
                  : "—"
              }
            />

            <InfoRow
              label="Scheduled"
              value={
                repairOrder.scheduledDate
                  ? formatDate(repairOrder.scheduledDate)
                  : "—"
              }
            />
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <SectionTitle icon={<User className="h-4 w-4" />}>
              Customer
            </SectionTitle>

            <div className="mt-3 space-y-1 text-sm">
              <p className="font-semibold text-zinc-900">
                {getCustomerName(repairOrder)}
              </p>

              {repairOrder.customer.phone ? (
                <p className="text-zinc-500">{repairOrder.customer.phone}</p>
              ) : null}

              {repairOrder.customer.email ? (
                <p className="text-zinc-500">{repairOrder.customer.email}</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <SectionTitle icon={<Bike className="h-4 w-4" />}>
              Vehicle
            </SectionTitle>

            <div className="mt-3 space-y-1 text-sm">
              <p className="font-semibold text-zinc-900">
                {getVehicleName(repairOrder)}
              </p>

              {repairOrder.vehicle.vin ? (
                <p className="font-mono text-xs text-zinc-500">
                  VIN: {repairOrder.vehicle.vin}
                </p>
              ) : null}
            </div>
          </section>
        </div>

        {repairOrder.complaint ? (
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <SectionTitle icon={<StickyNote className="h-4 w-4" />}>
              Customer concern
            </SectionTitle>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
              {repairOrder.complaint}
            </p>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4">
            <SectionTitle icon={<Wrench className="h-4 w-4" />}>
              Labor
            </SectionTitle>
          </div>

          {isLoadingLabor ? (
            <EstimateMessage>Loading labor...</EstimateMessage>
          ) : laborLines.length === 0 ? (
            <EstimateMessage>No labor lines</EstimateMessage>
          ) : (
            <>
              <div className="divide-y divide-zinc-100">
                {laborLines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-start justify-between gap-4 px-5 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {line.description}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {getTechnicianName(line.technician)}
                        {" · "}
                        {Number(line.hours || 0).toFixed(2)} hrs @{" "}
                        {formatCurrency(Number(line.rate || 0))}
                        /hr
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-zinc-900">
                      {formatCurrency(
                        Number(line.hours || 0) * Number(line.rate || 0),
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <SubtotalRow label="Labor subtotal" value={laborSubtotal} />
            </>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4">
            <SectionTitle icon={<Package className="h-4 w-4" />}>
              Parts
            </SectionTitle>
          </div>

          {isLoadingParts ? (
            <EstimateMessage>Loading parts...</EstimateMessage>
          ) : partLines.length === 0 ? (
            <EstimateMessage>No parts lines</EstimateMessage>
          ) : (
            <>
              <div className="divide-y divide-zinc-100">
                {partLines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-start justify-between gap-4 px-5 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {line.description}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {line.partNumber}
                        {" · "}
                        {Number(line.quantity || 0).toFixed(2)}
                        {" × "}
                        {formatCurrency(Number(line.unitPrice || 0))}
                        {" · "}
                        {formatLabel(line.status)}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-zinc-900">
                      {formatCurrency(
                        Number(line.quantity || 0) *
                          Number(line.unitPrice || 0),
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <SubtotalRow label="Parts subtotal" value={partsSubtotal} />
            </>
          )}
        </section>

        {repairOrder.notes ? (
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-zinc-900">
              Internal notes
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
              {repairOrder.notes}
            </p>
          </section>
        ) : null}
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-zinc-900">Summary</h3>

          <div className="mt-4 space-y-3">
            <SummaryRow label="Labor subtotal" value={laborSubtotal} />

            <SummaryRow label="Parts subtotal" value={partsSubtotal} />

            <EditableRateRow
              label="Shop supplies"
              value={shopSuppliesRate}
              onChange={setShopSuppliesRate}
              onSave={() =>
                void saveFinancialField("shopSuppliesRate", shopSuppliesRate)
              }
              suffix="%"
            />

            <SummaryRow label="Shop supplies" value={shopSupplies} />

            <SummaryRow label="Subtotal" value={subtotal} />

            <EditableMoneyRow
              label="Discount"
              value={discount}
              onChange={setDiscount}
              onSave={() => void saveFinancialField("discount", discount)}
            />

            <EditableRateRow
              label="Tax"
              value={taxRate}
              onChange={setTaxRate}
              onSave={() => void saveFinancialField("taxRate", taxRate)}
              suffix="%"
            />

            <SummaryRow label="Tax" value={tax} />

            <div className="border-t border-zinc-200 pt-3">
              <SummaryRow label="Total" value={total} strong />
            </div>

            <EditableMoneyRow
              label="Deposit"
              value={deposit}
              onChange={setDeposit}
              onSave={() => void saveFinancialField("deposit", deposit)}
            />

            <div className="border-t border-zinc-200 pt-3">
              <SummaryRow label="Balance due" value={balanceDue} strong />
            </div>

            {isSaving ? (
              <p className="text-right text-xs text-zinc-400">Saving...</p>
            ) : null}
          </div>
        </section>
      </aside>
    </div>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
      {icon}
      {children}
    </h3>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-zinc-100 py-2 text-sm last:border-b-0">
      <span className="text-zinc-500">{label}</span>

      <span className="text-right font-medium text-zinc-900">{value}</span>
    </div>
  );
}

function EstimateMessage({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-28 place-items-center px-5 py-8 text-sm text-zinc-500">
      {children}
    </div>
  );
}

function SubtotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-end border-t border-zinc-200 px-5 py-3">
      <span className="text-sm font-semibold text-zinc-900">
        {label}: {formatCurrency(value)}
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "text-base font-semibold text-zinc-900"
            : "text-sm text-zinc-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-base font-bold text-zinc-900"
            : "text-sm font-medium text-zinc-900"
        }
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function EditableRateRow({
  label,
  value,
  onChange,
  onSave,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  suffix: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-zinc-500">{label}</span>

      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onSave}
          className="h-8 w-20 rounded-md border border-zinc-300 px-2 text-right text-sm outline-none focus:border-orange-500"
        />

        <span className="text-xs text-zinc-500">{suffix}</span>
      </div>
    </div>
  );
}

function EditableMoneyRow({
  label,
  value,
  onChange,
  onSave,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-zinc-500">{label}</span>

      <div className="flex items-center gap-1">
        <span className="text-xs text-zinc-500">$</span>

        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onSave}
          className="h-8 w-24 rounded-md border border-zinc-300 px-2 text-right text-sm outline-none focus:border-orange-500"
        />
      </div>
    </div>
  );
}

function getCustomerName(repairOrder: RepairOrder): string {
  if (repairOrder.customer.companyName) {
    return repairOrder.customer.companyName;
  }

  return (
    [repairOrder.customer.firstName, repairOrder.customer.lastName]
      .filter(Boolean)
      .join(" ") || "Unnamed customer"
  );
}

function getVehicleName(repairOrder: RepairOrder): string {
  return [
    repairOrder.vehicle.year,
    repairOrder.vehicle.make,
    repairOrder.vehicle.model,
    repairOrder.vehicle.trim,
  ]
    .filter(Boolean)
    .join(" ");
}

function getTechnicianName(
  technician: {
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  } | null,
): string {
  if (!technician) {
    return "Unassigned";
  }

  const name = [technician.user.firstName, technician.user.lastName]
    .filter(Boolean)
    .join(" ");

  return name || technician.user.email;
}

function numberValue(value: string): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
