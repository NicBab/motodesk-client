"use client";

import {
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
  useMarkRepairOrderPartToBeOrderedMutation,
  usePullRepairOrderPartLineMutation,
  useReceiveRepairOrderPartLineMutation,
  useStageRepairOrderPartLineMutation,
} from "@/store/api/repairOrdersApi";

import type { RepairOrderPartLine } from "../repair-order-parts.types";

//************************************************************** */

type Props = {
  organizationId: string;
  repairOrderId: string;
  partLines: RepairOrderPartLine[];
};

//************************************************************** */

type QuantityAction = (input: {
  organizationId: string;
  repairOrderId: string;
  partLineId: string;
  quantity: number;
}) => {
  unwrap: () => Promise<unknown>;
};

//************************************************************** */

export function RepairOrderPartLineList({
  organizationId,
  repairOrderId,
  partLines,
}: Props) {
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

  //************************************************************** */

  async function runQuantityAction(
    action: QuantityAction,
    partLine: RepairOrderPartLine,
    quantity: number,
    success: string,
  ) {
    if (quantity <= 0) {
      return;
    }

    try {
      await action({
        organizationId,
        repairOrderId,
        partLineId: partLine.id,
        quantity,
      }).unwrap();

      toast.success(success);
    } catch {
      toast.error("MotoDesk could not update the part line.");
    }
  }

  //************************************************************** */

  async function handleQuantitySelection(
    action: QuantityAction,
    partLine: RepairOrderPartLine,
    currentQuantity: number,
    selectedQuantity: number,
    success: string,
  ) {
    if (selectedQuantity <= currentQuantity) {
      return;
    }

    const quantityToAdd = selectedQuantity - currentQuantity;

    await runQuantityAction(
      action,
      partLine,
      quantityToAdd,
      success,
    );
  }

  //************************************************************** */

  async function handleOrder(partLine: RepairOrderPartLine) {
    try {
      await markToBeOrdered({
        organizationId,
        repairOrderId,
        partLineId: partLine.id,
      }).unwrap();

      toast.success("Part marked to be ordered.");
    } catch {
      toast.error("MotoDesk could not mark the part for ordering.");
    }
  }

  //************************************************************** */

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

  //************************************************************** */

  async function handleDelete(partLine: RepairOrderPartLine) {
    const confirmed = window.confirm(
      `Remove "${partLine.description}"?`,
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

      toast.success("Part removed.");
    } catch {
      toast.error("MotoDesk could not remove the part.");
    }
  }

  //************************************************************** */

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1250px]">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <Heading>Part #</Heading>

            <Heading>Description</Heading>

            <Heading align="right">Required</Heading>

            <Heading align="right">Allocated</Heading>

            <Heading align="right">Ordered</Heading>

            <Heading align="right">Received</Heading>

            <Heading align="right">Pulled</Heading>

            <Heading align="right">Installed</Heading>

            <Heading>Status</Heading>

            <Heading>Blocking</Heading>

            <Heading align="right">Actions</Heading>
          </tr>
        </thead>

        <tbody>
          {partLines.map((partLine) => {
            const requiredQty = toQuantity(partLine.requiredQty);

            const approvedQty = toQuantity(partLine.approvedQty);

            const allocatedQty = toQuantity(partLine.allocatedQty);

            const orderedQty = toQuantity(partLine.orderedQty);

            const receivedQty = toQuantity(partLine.receivedQty);

            const pulledQty = toQuantity(partLine.pulledQty);

            const installedQty = toQuantity(partLine.installedQty);

            const fulfillmentQty =
              approvedQty > 0
                ? approvedQty
                : requiredQty;

            // const allocationMaximum = Math.max(
            //   fulfillmentQty,
            //   allocatedQty,
            // );

            // const pullMaximum = Math.max(
            //   allocatedQty,
            //   pulledQty,
            // );

            // const installMaximum = Math.max(
            //   pulledQty,
            //   installedQty,
            // );

const availableToAllocate = partLine.partId
  ? fulfillmentQty
  : Math.min(
      fulfillmentQty,
      receivedQty,
    );

const allocationMaximum = Math.max(
  allocatedQty,
  availableToAllocate,
);

const pullMaximum = Math.max(
  pulledQty,
  allocatedQty,
);

const installMaximum = Math.max(
  installedQty,
  pulledQty,
);

const canAllocate =
  ![
    "CANCELLED",
    "WAIVED",
    "INSTALLED",
  ].includes(partLine.status) &&
  allocatedQty < availableToAllocate;

const canPull =
  ![
    "CANCELLED",
    "WAIVED",
    "INSTALLED",
  ].includes(partLine.status) &&
  allocatedQty > 0 &&
  pulledQty < allocatedQty;

const canInstall =
  ![
    "CANCELLED",
    "WAIVED",
  ].includes(partLine.status) &&
  pulledQty > 0 &&
  installedQty < pulledQty;

            return (
              <tr
                key={partLine.id}
                className="border-b border-zinc-100 last:border-b-0"
              >
                <Cell strong>{partLine.partNumber}</Cell>

                <Cell>{partLine.description}</Cell>

                <Cell align="right">
                  {formatQuantity(requiredQty)}
                </Cell>

                <Cell align="right">
                  <QuantitySelect
                    value={allocatedQty}
                    maximum={allocationMaximum}
                    disabled={disabled || !canAllocate}
                    onChange={(selectedQuantity) =>
                      void handleQuantitySelection(
                        allocatePart,
                        partLine,
                        allocatedQty,
                        selectedQuantity,
                        "Part allocation updated.",
                      )
                    }
                  />
                </Cell>

                <Cell align="right">
                  {formatQuantity(orderedQty)}
                </Cell>

                <Cell align="right">
                  {formatQuantity(receivedQty)}
                </Cell>

                <Cell align="right">
                  <QuantitySelect
                    value={pulledQty}
                    maximum={pullMaximum}
                    disabled={disabled || !canPull}
                    onChange={(selectedQuantity) =>
                      void handleQuantitySelection(
                        pullPart,
                        partLine,
                        pulledQty,
                        selectedQuantity,
                        "Part pulled.",
                      )
                    }
                  />
                </Cell>

                <Cell align="right">
                  <QuantitySelect
                    value={installedQty}
                    maximum={installMaximum}
                    disabled={disabled || !canInstall}
                    onChange={(selectedQuantity) =>
                      void handleQuantitySelection(
                        installPart,
                        partLine,
                        installedQty,
                        selectedQuantity,
                        "Part installation updated.",
                      )
                    }
                  />
                </Cell>

                <Cell>
                  <StatusBadge status={partLine.status} />
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
                    {partLine.status === "NEEDS_REVIEW" ? (
                      <IconButton
                        icon={ShoppingCart}
                        label="Order"
                        disabled={disabled}
                        onClick={() =>
                          void handleOrder(partLine)
                        }
                      />
                    ) : null}

                    {[
                      "TO_BE_ORDERED",
                      "ORDERED",
                      "PARTIALLY_RECEIVED",
                      "BACKORDERED",
                    ].includes(partLine.status) ? (
                      <IconButton
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

                    {partLine.status === "PULLED" ? (
                      <IconButton
                        icon={PackageCheck}
                        label="Stage"
                        disabled={disabled}
                        onClick={() =>
                          void handleStage(partLine)
                        }
                      />
                    ) : null}

                    {![
                      "INSTALLED",
                      "CANCELLED",
                    ].includes(partLine.status) ? (
                      <IconButton
                        icon={Trash2}
                        label="Remove"
                        disabled={disabled}
                        onClick={() =>
                          void handleDelete(partLine)
                        }
                      />
                    ) : null}
                  </div>
                </Cell>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

//************************************************************** */

function QuantitySelect({
  value,
  maximum,
  disabled,
  onChange,
}: {
  value: number;
  maximum: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const options = createQuantityOptions(value, maximum);

  if (options.length <= 1) {
    return (
      <span className="inline-flex min-w-16 justify-end text-sm text-zinc-600">
        {formatQuantity(value)}
      </span>
    );
  }

  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => {
        const nextValue = Number(event.target.value);

        if (!Number.isFinite(nextValue)) {
          return;
        }

        onChange(nextValue);
      }}
      className="h-8 min-w-16 rounded-md border border-zinc-200 bg-white px-2 text-right text-sm font-medium text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
    >
      {options.map((quantity) => (
        <option key={quantity} value={quantity}>
          {formatQuantity(quantity)}
        </option>
      ))}
    </select>
  );
}

//************************************************************** */

function createQuantityOptions(
  currentQuantity: number,
  maximumQuantity: number,
): number[] {
  const current = Math.max(0, currentQuantity);

  const maximum = Math.max(current, maximumQuantity);

  const values = new Set<number>([current]);

  if (
    Number.isInteger(current) &&
    Number.isInteger(maximum)
  ) {
    for (
      let quantity = Math.ceil(current);
      quantity <= maximum;
      quantity += 1
    ) {
      values.add(quantity);
    }
  } else if (maximum > current) {
    values.add(maximum);
  }

  return [...values].sort((left, right) => left - right);
}

//************************************************************** */

function toQuantity(value: string): number {
  const quantity = Number(value);

  if (!Number.isFinite(quantity)) {
    return 0;
  }

  return quantity;
}

//************************************************************** */

function formatQuantity(value: number): string {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toString();
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
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 ${
        align === "right" ? "text-right" : ""
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

//************************************************************** */

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

      <span>{label}</span>
    </button>
  );
}

//************************************************************** */

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
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase(),
        )}
    </span>
  );
}

//************************************************************** */