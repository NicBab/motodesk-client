"use client";

import { useState } from "react";

import { useGetRepairOrderQuery } from "@/store/api/repairOrdersApi";

import type { RepairOrder } from "../repair-order.types";

import { RepairOrderApprovalTab } from "./RepairOrderApprovalTab";

import { RepairOrderCashierTab } from "./RepairOrderCashierTab";

import { RepairOrderDialogShell } from "./RepairOrderDialogShell";

import { RepairOrderLaborTab } from "./RepairOrderLaborTab";

import { RepairOrderOverview } from "./RepairOrderOverview";

import { RepairOrderPartsTab } from "./RepairOrderPartsTab";

import { RepairOrderTabs, type RepairOrderTab } from "./RepairOrderTabs";

import { RepairOrderActionsTab } from "./RepairOrderActionsTab";

import { RepairOrderAdditionalWorkTab } from "./RepairOrderAdditionalWorkTab";

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

  const {
    data: currentRepairOrder,
    isLoading,
    isError,
  } = useGetRepairOrderQuery(
    {
      organizationId,
      repairOrderId: repairOrder?.id ?? "",
    },
    {
      skip: !open || !repairOrder || !organizationId,
    },
  );

  if (!open || !repairOrder) {
    return null;
  }

  const resolvedRepairOrder = currentRepairOrder ?? repairOrder;

  return (
    <RepairOrderDialogShell
      title={`RO #${resolvedRepairOrder.roNumber}`}
      description="Manage the complete repair order lifecycle from estimate through cashiering and pickup."
      onClose={onClose}
    >
      <RepairOrderTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-6">
        {isLoading && !currentRepairOrder ? (
          <DialogMessage>Loading repair order...</DialogMessage>
        ) : isError ? (
          <DialogMessage>
            MotoDesk could not load the current repair order.
          </DialogMessage>
        ) : (
          <>
            {activeTab === "overview" ? (
              <RepairOrderOverview
                organizationId={organizationId}
                repairOrder={resolvedRepairOrder}
              />
            ) : null}

            {activeTab === "actions" ? (
              <RepairOrderActionsTab
                organizationId={organizationId}
                repairOrder={resolvedRepairOrder}
              />
            ) : null}

            {activeTab === "labor" ? (
              <RepairOrderLaborTab
                organizationId={organizationId}
                repairOrder={resolvedRepairOrder}
              />
            ) : null}

            {activeTab === "parts" ? (
              <RepairOrderPartsTab
                organizationId={organizationId}
                repairOrder={resolvedRepairOrder}
              />
            ) : null}

            {activeTab === "additional-work" ? (
              <RepairOrderAdditionalWorkTab
                organizationId={organizationId}
                repairOrder={resolvedRepairOrder}
              />
            ) : null}

            {activeTab === "approval" ? (
              <RepairOrderApprovalTab
                organizationId={organizationId}
                repairOrder={resolvedRepairOrder}
              />
            ) : null}

            {activeTab === "cashier" ? (
              <RepairOrderCashierTab
                organizationId={organizationId}
                repairOrder={resolvedRepairOrder}
              />
            ) : null}
          </>
        )}
      </div>
    </RepairOrderDialogShell>
  );
}

function DialogMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
      {children}
    </div>
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
