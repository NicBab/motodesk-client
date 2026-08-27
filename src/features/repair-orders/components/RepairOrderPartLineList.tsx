"use client";

import {
  CheckCircle2,
  PackageCheck,
  PackageOpen,
  ShoppingCart,
  Trash2,
  Wrench,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  useAllocateRepairOrderPartLineMutation,
  useDeleteRepairOrderPartLineMutation,
  useInstallRepairOrderPartLineMutation,
  useMarkRepairOrderPartToBeOrderedMutation,
  usePullRepairOrderPartLineMutation,
  useReceiveRepairOrderPartLineMutation,
  useStageRepairOrderPartLineMutation,
} from "@/store/api/repairOrdersApi";

import type {
  RepairOrderPartLine,
} from "../repair-order-parts.types";

type Props = {
  organizationId: string;
  repairOrderId: string;
  partLines: RepairOrderPartLine[];
};

export function RepairOrderPartLineList({
  organizationId,
  repairOrderId,
  partLines,
}: Props) {
  const [
    allocatePart,
    {
      isLoading:
        isAllocating,
    },
  ] =
    useAllocateRepairOrderPartLineMutation();

  const [
    markToBeOrdered,
    {
      isLoading:
        isOrdering,
    },
  ] =
    useMarkRepairOrderPartToBeOrderedMutation();

  const [
    receivePart,
    {
      isLoading:
        isReceiving,
    },
  ] =
    useReceiveRepairOrderPartLineMutation();

  const [
    pullPart,
    {
      isLoading:
        isPulling,
    },
  ] =
    usePullRepairOrderPartLineMutation();

  const [
    stagePart,
    {
      isLoading:
        isStaging,
    },
  ] =
    useStageRepairOrderPartLineMutation();

  const [
    installPart,
    {
      isLoading:
        isInstalling,
    },
  ] =
    useInstallRepairOrderPartLineMutation();

  const [
    deletePart,
    {
      isLoading:
        isDeleting,
    },
  ] =
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
    action: (
      input: {
        organizationId: string;
        repairOrderId: string;
        partLineId: string;
        quantity: number;
      },
    ) => {
      unwrap: () =>
        Promise<unknown>;
    },
    partLine:
      RepairOrderPartLine,
    quantity: number,
    success: string,
  ) {
    try {
      await action({
        organizationId,
        repairOrderId,
        partLineId:
          partLine.id,
        quantity,
      }).unwrap();

      toast.success(success);
    } catch {
      toast.error(
        "MotoDesk could not update the part line.",
      );
    }
  }

  async function handleOrder(
    partLine:
      RepairOrderPartLine,
  ) {
    try {
      await markToBeOrdered({
        organizationId,
        repairOrderId,
        partLineId:
          partLine.id,
      }).unwrap();

      toast.success(
        "Part marked to be ordered.",
      );
    } catch {
      toast.error(
        "MotoDesk could not mark the part for ordering.",
      );
    }
  }

  async function handleStage(
    partLine:
      RepairOrderPartLine,
  ) {
    try {
      await stagePart({
        organizationId,
        repairOrderId,
        partLineId:
          partLine.id,
      }).unwrap();

      toast.success(
        "Part staged.",
      );
    } catch {
      toast.error(
        "MotoDesk could not stage the part.",
      );
    }
  }

  async function handleDelete(
    partLine:
      RepairOrderPartLine,
  ) {
    const confirmed =
      window.confirm(
        `Remove "${partLine.description}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deletePart({
        organizationId,
        repairOrderId,
        partLineId:
          partLine.id,
      }).unwrap();

      toast.success(
        "Part removed.",
      );
    } catch {
      toast.error(
        "MotoDesk could not remove the part.",
      );
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1250px]">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <Heading>
              Part #
            </Heading>

            <Heading>
              Description
            </Heading>

            <Heading align="right">
              Required
            </Heading>

            <Heading align="right">
              Allocated
            </Heading>

            <Heading align="right">
              Ordered
            </Heading>

            <Heading align="right">
              Received
            </Heading>

            <Heading align="right">
              Pulled
            </Heading>

            <Heading align="right">
              Installed
            </Heading>

            <Heading>
              Status
            </Heading>

            <Heading>
              Blocking
            </Heading>

            <Heading align="right">
              Actions
            </Heading>
          </tr>
        </thead>

        <tbody>
          {partLines.map(
            (partLine) => {
              const required =
                Number(
                  partLine.requiredQty,
                ) || 0;

              const availableToPull =
                Math.max(
                  0,
                  Number(
                    partLine.allocatedQty,
                  ) -
                    Number(
                      partLine.pulledQty,
                    ),
                );

              const availableToInstall =
                Math.max(
                  0,
                  Number(
                    partLine.pulledQty,
                  ) -
                    Number(
                      partLine.installedQty,
                    ),
                );

              return (
                <tr
                  key={
                    partLine.id
                  }
                  className="border-b border-zinc-100 last:border-b-0"
                >
                  <Cell strong>
                    {
                      partLine.partNumber
                    }
                  </Cell>

                  <Cell>
                    {
                      partLine.description
                    }
                  </Cell>

                  <Cell align="right">
                    {
                      partLine.requiredQty
                    }
                  </Cell>

                  <Cell align="right">
                    {
                      partLine.allocatedQty
                    }
                  </Cell>

                  <Cell align="right">
                    {
                      partLine.orderedQty
                    }
                  </Cell>

                  <Cell align="right">
                    {
                      partLine.receivedQty
                    }
                  </Cell>

                  <Cell align="right">
                    {
                      partLine.pulledQty
                    }
                  </Cell>

                  <Cell align="right">
                    {
                      partLine.installedQty
                    }
                  </Cell>

                  <Cell>
                    <StatusBadge
                      status={
                        partLine.status
                      }
                    />
                  </Cell>

                  <Cell>
                    {partLine.blocksWork ? (
                      <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
                        Yes
                      </span>
                    ) : (
                      <span className="text-sm text-zinc-400">
                        No
                      </span>
                    )}
                  </Cell>

                  <Cell align="right">
                    <div className="flex justify-end gap-1">
                      {partLine.status ===
                        "NEEDS_REVIEW" &&
                      partLine.partId ? (
                        <IconButton
                          icon={
                            PackageCheck
                          }
                          label="Allocate"
                          disabled={
                            disabled
                          }
                          onClick={() =>
                            void runQuantityAction(
                              allocatePart,
                              partLine,
                              required,
                              "Part allocated.",
                            )
                          }
                        />
                      ) : null}

                      {partLine.status ===
                      "NEEDS_REVIEW" ? (
                        <IconButton
                          icon={
                            ShoppingCart
                          }
                          label="Order"
                          disabled={
                            disabled
                          }
                          onClick={() =>
                            void handleOrder(
                              partLine,
                            )
                          }
                        />
                      ) : null}

                      {[
                        "TO_BE_ORDERED",
                        "ORDERED",
                        "PARTIALLY_RECEIVED",
                        "BACKORDERED",
                      ].includes(
                        partLine.status,
                      ) ? (
                        <IconButton
                          icon={
                            PackageOpen
                          }
                          label="Receive"
                          disabled={
                            disabled
                          }
                          onClick={() =>
                            void runQuantityAction(
                              receivePart,
                              partLine,
                              required,
                              "Part received.",
                            )
                          }
                        />
                      ) : null}

                      {availableToPull >
                      0 ? (
                        <IconButton
                          icon={Wrench}
                          label="Pull"
                          disabled={
                            disabled
                          }
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

                      {partLine.status ===
                      "PULLED" ? (
                        <IconButton
                          icon={
                            PackageCheck
                          }
                          label="Stage"
                          disabled={
                            disabled
                          }
                          onClick={() =>
                            void handleStage(
                              partLine,
                            )
                          }
                        />
                      ) : null}

                      {availableToInstall >
                      0 ? (
                        <IconButton
                          icon={
                            CheckCircle2
                          }
                          label="Install"
                          disabled={
                            disabled
                          }
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

                      {![
                        "INSTALLED",
                        "CANCELLED",
                      ].includes(
                        partLine.status,
                      ) ? (
                        <IconButton
                          icon={
                            Trash2
                          }
                          label="Remove"
                          disabled={
                            disabled
                          }
                          onClick={() =>
                            void handleDelete(
                              partLine,
                            )
                          }
                        />
                      ) : null}
                    </div>
                  </Cell>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
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
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 ${
        align === "right"
          ? "text-right"
          : ""
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
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  strong?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 text-sm ${
        strong
          ? "font-semibold text-zinc-900"
          : "text-zinc-600"
      } ${
        align === "right"
          ? "text-right"
          : ""
      }`}
    >
      {children}
    </td>
  );
}

function IconButton({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: typeof Wrench;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={label}
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
    >
      <Icon className="h-3.5 w-3.5" />
      <span>
        {label}
      </span>
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-600">
      {status
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase(),
        )}
    </span>
  );
}