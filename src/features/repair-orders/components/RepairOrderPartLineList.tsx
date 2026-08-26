"use client";

import {
  CheckCircle2,
  PackageCheck,
  PackageOpen,
  ShoppingCart,
  Trash2,
  Wrench,
} from "lucide-react";

import { toast } from "sonner";

import {
  useAllocateRepairOrderPartLineMutation,
  useDeleteRepairOrderPartLineMutation,
  useInstallRepairOrderPartLineMutation,

  //   useOrderRepairOrderPartLineMutation,
  useMarkRepairOrderPartToBeOrderedMutation,
  usePullRepairOrderPartLineMutation,
  useReceiveRepairOrderPartLineMutation,
  useStageRepairOrderPartLineMutation,
} from "@/store/api/repairOrdersApi";

import type { RepairOrderPartLine } from "../repair-order-parts.types";

type RepairOrderPartLineListProps = {
  organizationId: string;
  repairOrderId: string;
  partLines: RepairOrderPartLine[];
};

export function RepairOrderPartLineList({
  organizationId,
  repairOrderId,
  partLines,
}: RepairOrderPartLineListProps) {
  const [allocatePart, { isLoading: isAllocating }] =
    useAllocateRepairOrderPartLineMutation();

  const [markToBeOrdered, { isLoading: isOrdering }] =
    useMarkRepairOrderPartToBeOrderedMutation();

  const [receivePart, { isLoading: isReceiving }] =
    useReceiveRepairOrderPartLineMutation();

  const [pullPart, { isLoading: isPulling }] =
    usePullRepairOrderPartLineMutation();

  const [stagePart, { isLoading: isStaging }] =
    useStageRepairOrderPartLineMutation();

  const [installPart, { isLoading: isInstalling }] =
    useInstallRepairOrderPartLineMutation();

  const [deletePart, { isLoading: isDeleting }] =
    useDeleteRepairOrderPartLineMutation();

  const disabled =
    isAllocating ||
    isOrdering ||
    isReceiving ||
    isPulling ||
    isStaging ||
    isInstalling ||
    isDeleting;

  async function runQuantityAction(
    action: (input: {
      organizationId: string;
      repairOrderId: string;
      partLineId: string;
      quantity: number;
    }) => {
      unwrap: () => Promise<unknown>;
    },
    partLine: RepairOrderPartLine,
    quantity: number,
    successMessage: string,
  ) {
    try {
      await action({
        organizationId,
        repairOrderId,
        partLineId: partLine.id,
        quantity,
      }).unwrap();

      toast.success(successMessage);
    } catch {
      toast.error("MotoDesk could not update the part line.");
    }
  }

  async function handleStage(partLine: RepairOrderPartLine) {
    try {
      await stagePart({
        organizationId,
        repairOrderId,
        partLineId: partLine.id,
      }).unwrap();

      toast.success("Part staged.");
    } catch {
      toast.error("MotoDesk could not stage the part.");
    }
  }

  async function handleDelete(partLine: RepairOrderPartLine) {
    const confirmed = window.confirm(
      `Remove "${partLine.description}" from this repair order?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePart({
        organizationId,
        repairOrderId,
        partLineId: partLine.id,
      }).unwrap();

      toast.success("Part line removed.");
    } catch {
      toast.error("MotoDesk could not remove the part line.");
    }
  }

  return (
    <div className="divide-y divide-zinc-100">
      {partLines.map((partLine) => {
        const requiredQty = Number(partLine.requiredQty) || 0;

        const availableToPull = Math.max(
          0,
          Number(partLine.allocatedQty) - Number(partLine.pulledQty),
        );

        const availableToInstall = Math.max(
          0,
          Number(partLine.pulledQty) - Number(partLine.installedQty),
        );

        return (
          <div key={partLine.id} className="px-5 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900">
                    {partLine.partNumber}
                  </p>

                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
                    {formatLabel(partLine.status)}
                  </span>

                  {partLine.blocksWork ? (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                      Blocks work
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 text-sm text-zinc-700">
                  {partLine.description}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                  <span>Required: {partLine.requiredQty}</span>

                  <span>Allocated: {partLine.allocatedQty}</span>

                  <span>Ordered: {partLine.orderedQty}</span>

                  <span>Received: {partLine.receivedQty}</span>

                  <span>Pulled: {partLine.pulledQty}</span>

                  <span>Installed: {partLine.installedQty}</span>
                </div>
              </div>

              <div className="flex max-w-xl flex-wrap gap-2">
                {partLine.status ===
"NEEDS_REVIEW" ? (
  <>
    {partLine.partId ? (
      <ActionButton
        icon={PackageCheck}
        label="Allocate"
        disabled={disabled}
        onClick={() =>
          void runQuantityAction(
            allocatePart,
            partLine,
            requiredQty,
            "Part allocated.",
          )
        }
      />
    ) : null}

    <ActionButton
      icon={ShoppingCart}
      label="Order"
      disabled={disabled}
      onClick={() =>
        void markToBeOrdered({
          organizationId,
          repairOrderId,
          partLineId:
            partLine.id,
        })
          .unwrap()
          .then(() =>
            toast.success(
              "Part marked to be ordered.",
            ),
          )
          .catch(() =>
            toast.error(
              "MotoDesk could not mark the part for ordering.",
            ),
          )
      }
    />
  </>
) : null}

                {[
                  "TO_BE_ORDERED",
                  "ORDERED",
                  "PARTIALLY_RECEIVED",
                  "BACKORDERED",
                ].includes(partLine.status) ? (
                  <ActionButton
                    icon={PackageOpen}
                    label="Receive"
                    disabled={disabled}
                    onClick={() =>
                      void runQuantityAction(
                        receivePart,
                        partLine,
                        requiredQty,
                        "Part received.",
                      )
                    }
                  />
                ) : null}

                {availableToPull > 0 ? (
                  <ActionButton
                    icon={Wrench}
                    label="Pull"
                    disabled={disabled}
                    onClick={() =>
                      void runQuantityAction(
                        pullPart,
                        partLine,
                        availableToPull,
                        "Part pulled.",
                      )
                    }
                  />
                ) : null}

                {partLine.status === "PULLED" ? (
                  <ActionButton
                    icon={PackageCheck}
                    label="Stage"
                    disabled={disabled}
                    onClick={() => void handleStage(partLine)}
                  />
                ) : null}

                {availableToInstall > 0 ? (
                  <ActionButton
                    icon={CheckCircle2}
                    label="Install"
                    disabled={disabled}
                    onClick={() =>
                      void runQuantityAction(
                        installPart,
                        partLine,
                        availableToInstall,
                        "Part installed.",
                      )
                    }
                  />
                ) : null}

                {!["INSTALLED", "CANCELLED"].includes(partLine.status) ? (
                  <ActionButton
                    icon={Trash2}
                    label="Remove"
                    disabled={disabled}
                    onClick={() => void handleDelete(partLine)}
                  />
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type ActionButtonProps = {
  icon: typeof Wrench;
  label: string;
  disabled: boolean;
  onClick: () => void;
};

function ActionButton({
  icon: Icon,
  label,
  disabled,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-semibold text-zinc-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
