"use client";

import { useState } from "react";

import type { RepairOrder } from "../repair-order.types";

import { RepairOrderDialogShell } from "./RepairOrderDialogShell";

import { RepairOrderOverview } from "./RepairOrderOverview";

import { RepairOrderTabs, type RepairOrderTab } from "./RepairOrderTabs";

type RepairOrderDialogProps = {
  organizationId: string;
  repairOrder: RepairOrder | null;
  open: boolean;
  onClose: () => void;
};

export function RepairOrderDialog({
  organizationId,
  repairOrder,
  open,
  onClose,
}: RepairOrderDialogProps) {
  const [activeTab, setActiveTab] = useState<RepairOrderTab>("overview");

  if (!open || !repairOrder) {
    return null;
  }

  return (
    <RepairOrderDialogShell
      title={`RO #${repairOrder.roNumber}`}
      description="Manage the complete repair order lifecycle from estimate through cashiering and pickup."
      onClose={onClose}
    >
      <RepairOrderTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-6">
        {activeTab === "overview" ? (
          <RepairOrderOverview
            organizationId={organizationId}
            repairOrder={repairOrder}
          />
        ) : null}

        {activeTab === "labor" ? (
          <LifecyclePlaceholder
            title="Labor"
            description="Labor operations, technician assignments, and time tracking will appear here."
          />
        ) : null}

        {activeTab === "parts" ? (
          <LifecyclePlaceholder
            title="Parts"
            description="Repair-order parts requirements, ordering status, receiving, and availability will appear here."
          />
        ) : null}

        {activeTab === "additional-work" ? (
          <LifecyclePlaceholder
            title="Additional Work"
            description="Additional findings, recommendations, and supplemental work requests will appear here."
          />
        ) : null}

        {activeTab === "approval" ? (
          <LifecyclePlaceholder
            title="Approval"
            description="Customer approval history and additional approval workflow will appear here."
          />
        ) : null}

        {activeTab === "cashier" ? (
          <LifecyclePlaceholder
            title="Cashier / Pickup"
            description="Payment, cashier status, remaining balance, pickup, and closeout workflow will appear here."
          />
        ) : null}
      </div>
    </RepairOrderDialogShell>
  );
}

function LifecyclePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-56 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-center">
      <div>
        <p className="text-sm font-semibold text-zinc-700">{title}</p>

        <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}
