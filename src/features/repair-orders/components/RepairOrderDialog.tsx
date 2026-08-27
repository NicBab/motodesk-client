"use client";

import {
  useState,
} from "react";

import {
  useGetRepairOrderQuery,
} from "@/store/api/repairOrdersApi";

import type {
  RepairOrder,
} from "../repair-order.types";

import {
  RepairOrderActionsTab,
} from "./RepairOrderActionsTab";

import {
  RepairOrderDialogShell,
} from "./RepairOrderDialogShell";

import {
  RepairOrderEstimateTab,
} from "./RepairOrderEstimateTab";

import {
  RepairOrderHistoryTab,
} from "./RepairOrderHistoryTab";

import {
  RepairOrderLaborTab,
} from "./RepairOrderLaborTab";

import {
  RepairOrderPartsTab,
} from "./RepairOrderPartsTab";

import {
  RepairOrderStatusTab,
} from "./RepairOrderStatusTab";

import {
  RepairOrderTabs,
  type RepairOrderTab,
} from "./RepairOrderTabs";

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
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<RepairOrderTab>(
      "estimate",
    );

  const {
    data: currentRepairOrder,
    isLoading,
    isError,
  } = useGetRepairOrderQuery(
    {
      organizationId,
      repairOrderId:
        repairOrder?.id ?? "",
    },
    {
      skip:
        !open ||
        !repairOrder ||
        !organizationId,
    },
  );

  if (!open || !repairOrder) {
    return null;
  }

  const resolvedRepairOrder =
    currentRepairOrder ??
    repairOrder;

  return (
    <RepairOrderDialogShell
      title={`RO #${resolvedRepairOrder.roNumber}`}
      description={`${getCustomerName(
        resolvedRepairOrder,
      )} · ${getVehicleName(
        resolvedRepairOrder,
      )}`}
      onClose={onClose}
    >
      <RepairOrderTabs
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="pt-6">
        {isLoading &&
        !currentRepairOrder ? (
          <DialogMessage>
            Loading repair order...
          </DialogMessage>
        ) : isError ? (
          <DialogMessage>
            MotoDesk could not load the
            current repair order.
          </DialogMessage>
        ) : (
          <>
            {activeTab ===
            "estimate" ? (
              <RepairOrderEstimateTab
                organizationId={
                  organizationId
                }
                repairOrder={
                  resolvedRepairOrder
                }
                onOpenActions={() =>
                  setActiveTab(
                    "actions",
                  )
                }
              />
            ) : null}

            {activeTab ===
            "actions" ? (
              <RepairOrderActionsTab
                organizationId={
                  organizationId
                }
                repairOrder={
                  resolvedRepairOrder
                }
              />
            ) : null}

            {activeTab ===
            "labor" ? (
              <RepairOrderLaborTab
                organizationId={
                  organizationId
                }
                repairOrder={
                  resolvedRepairOrder
                }
              />
            ) : null}

            {activeTab ===
            "parts" ? (
              <RepairOrderPartsTab
                organizationId={
                  organizationId
                }
                repairOrder={
                  resolvedRepairOrder
                }
              />
            ) : null}

            {activeTab ===
            "status" ? (
              <RepairOrderStatusTab
                repairOrder={
                  resolvedRepairOrder
                }
              />
            ) : null}

            {activeTab ===
            "history" ? (
              <RepairOrderHistoryTab
                repairOrder={
                  resolvedRepairOrder
                }
              />
            ) : null}
          </>
        )}
      </div>
    </RepairOrderDialogShell>
  );
}

function DialogMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-56 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
      {children}
    </div>
  );
}

function getCustomerName(
  repairOrder: RepairOrder,
): string {
  if (
    repairOrder.customer.companyName
  ) {
    return repairOrder.customer
      .companyName;
  }

  return (
    [
      repairOrder.customer.firstName,
      repairOrder.customer.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Unnamed customer"
  );
}

function getVehicleName(
  repairOrder: RepairOrder,
): string {
  return [
    repairOrder.vehicle.year,
    repairOrder.vehicle.make,
    repairOrder.vehicle.model,
    repairOrder.vehicle.trim,
  ]
    .filter(Boolean)
    .join(" ");
}