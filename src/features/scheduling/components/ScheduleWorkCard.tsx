"use client";

import { AlertTriangle, Clock3, Flame } from "lucide-react";

import type { ScheduleCardColor } from "../scheduling.card-colors";

import type { ScheduleOverlapLayout } from "../scheduling.layout";

import type { ScheduleWorkBlock } from "../scheduling.types";

import {
  SCHEDULING_CARD_GAP,
  SCHEDULING_CARD_INSET,
  SCHEDULING_HOUR_HEIGHT,
  SCHEDULING_MIN_CARD_HEIGHT,
  SCHEDULING_START_HOUR,
} from "../scheduling.constants";

import {
  formatScheduleStatus,
  formatSchedulingTime,
} from "../scheduling.utils";

//************************************************************** */

export type DispatchDensity = "comfortable" | "compact";

//************************************************************** */

type ScheduleWorkCardProps = {
  workBlock: ScheduleWorkBlock;

  density: DispatchDensity;

  layout: ScheduleOverlapLayout;

  color: ScheduleCardColor;

  selected: boolean;

  onOpen: (block: ScheduleWorkBlock) => void;
};

//************************************************************** */

export function ScheduleWorkCard({
  workBlock,
  density,
  layout,
  color,
  selected,
  onOpen,
}: ScheduleWorkCardProps) {
  if (!workBlock.scheduledEnd) {
    return null;
  }

  const start = new Date(workBlock.scheduledDate);

  const end = new Date(workBlock.scheduledEnd);

  const durationMinutes = Math.max(
    0,
    (end.getTime() - start.getTime()) / 60000,
  );

  const durationHours = durationMinutes / 60;

  const startDecimal = start.getHours() + start.getMinutes() / 60;

  const top = Math.max(
    0,
    (startDecimal - SCHEDULING_START_HOUR) * SCHEDULING_HOUR_HEIGHT,
  );

  const rawHeight = durationHours * SCHEDULING_HOUR_HEIGHT;

  const height =
    Math.max(SCHEDULING_MIN_CARD_HEIGHT, rawHeight) - SCHEDULING_CARD_GAP;

  const totalColumns = Math.max(1, layout.totalColumns);

  const leftPercent = (layout.column / totalColumns) * 100;

  const widthPercent = (1 / totalColumns) * 100;

  const repairOrder = workBlock.repairOrder;

  const customerName = getCustomerName(repairOrder.customer);

  const vehicleDescription = getVehicleDescription(repairOrder.vehicle);

  const laborDescription =
    workBlock.laborLine?.description ?? workBlock.laborLine?.operation ?? null;

  const shortBlock = durationMinutes < 30;

  const mediumBlock = durationMinutes >= 30 && durationMinutes < 60;

  const longBlock = durationMinutes >= 60 && durationMinutes < 120;

  const fullBlock = durationMinutes >= 120;

  const showCustomer = !shortBlock;

  const showVehicle = fullBlock || (density === "comfortable" && longBlock);

  const showLabor =
    Boolean(laborDescription) &&
    (fullBlock || (density === "comfortable" && !shortBlock && !mediumBlock));

  const accessibleLabel =
    `RO ${repairOrder.roNumber}, ${customerName}, ${vehicleDescription}, ` +
    `${formatSchedulingTime(workBlock.scheduledDate)} to ` +
    `${formatSchedulingTime(workBlock.scheduledEnd)}, ` +
    `${formatScheduleStatus(workBlock.status)}`;

  //************************************************************** */

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      onClick={(event) => {
        event.stopPropagation();

        onOpen(workBlock);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();

          onOpen(workBlock);
        }
      }}
      className={[
        "absolute overflow-hidden rounded-md border bg-white shadow-sm",
        "cursor-pointer transition hover:z-10 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1",
        color.border,
        color.hoverBorder,
        selected ? "z-10 ring-2 ring-orange-500 ring-offset-1" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        top,

        height,

        left: `calc(${leftPercent}% + ${SCHEDULING_CARD_INSET}px)`,

        width: `calc(${widthPercent}% - ${SCHEDULING_CARD_INSET * 2}px)`,
      }}
    >
      <div className={`absolute bottom-0 left-0 top-0 w-1 ${color.stripe}`} />

      <div className="flex h-full min-h-0 flex-col py-1.5 pl-2.5 pr-2">
        <div className="flex items-center justify-between gap-1">
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-zinc-900">
            RO #{repairOrder.roNumber}
          </span>

          <span className="shrink-0 text-[10px] tabular-nums text-zinc-400">
            {durationHours.toFixed(1)}h
          </span>
        </div>

        {showCustomer ? (
          <p
            title={customerName}
            className="mt-0.5 truncate text-xs leading-tight text-zinc-700"
          >
            {customerName}
          </p>
        ) : null}

        {showVehicle ? (
          <p
            title={vehicleDescription}
            className="truncate text-[11px] leading-tight text-zinc-400"
          >
            {vehicleDescription}
          </p>
        ) : null}

        {showLabor ? (
          <p
            title={laborDescription ?? undefined}
            className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-zinc-600"
          >
            {laborDescription}
          </p>
        ) : null}

        {!shortBlock ? (
          <div className="mt-auto flex items-center justify-between gap-1 pt-0.5">
            <span className="truncate text-[10px] tabular-nums text-zinc-400">
              {formatSchedulingTime(workBlock.scheduledDate)}
              {" – "}
              {formatSchedulingTime(workBlock.scheduledEnd)}
            </span>

            <div className="flex shrink-0 items-center gap-1">
              <StatusDot status={workBlock.status} />

              {repairOrder.priority === "EMERGENCY" ? (
                <Flame
                  className="h-3 w-3 text-red-500"
                  aria-label="Emergency"
                />
              ) : null}

              {repairOrder.priority === "RUSH" ? (
                <AlertTriangle
                  className="h-3 w-3 text-orange-500"
                  aria-label="Rush"
                />
              ) : null}

              {workBlock.waitingCustomer ? (
                <Clock3
                  className="h-3 w-3 text-amber-500"
                  aria-label="Waiting customer"
                />
              ) : null}
            </div>
          </div>
        ) : (
          <span className="mt-auto text-[10px] tabular-nums text-zinc-400">
            {formatSchedulingTime(workBlock.scheduledDate)}
          </span>
        )}
      </div>
    </article>
  );
}

//************************************************************** */

function StatusDot({ status }: { status: ScheduleWorkBlock["status"] }) {
  const className = getStatusDotClassName(status);

  return (
    <span
      title={formatScheduleStatus(status)}
      className={`h-2 w-2 rounded-full ${className}`}
    />
  );
}

//************************************************************** */

function getStatusDotClassName(status: ScheduleWorkBlock["status"]): string {
  switch (status) {
    case "IN_PROGRESS":
      return "bg-indigo-500";

    case "COMPLETED":
      return "bg-emerald-500";

    case "PAUSED":
      return "bg-amber-500";

    case "BLOCKED":
    case "MISSED":
      return "bg-red-500";

    case "SCHEDULED":
    case "CONFIRMED":
      return "bg-blue-500";

    case "READY":
      return "bg-emerald-500";

    case "RESCHEDULE_REQUIRED":
      return "bg-orange-500";

    case "TENTATIVE":
    case "CANCELLED":
    default:
      return "bg-zinc-400";
  }
}

//************************************************************** */

function getCustomerName(
  customer: ScheduleWorkBlock["repairOrder"]["customer"],
): string {
  if (customer.companyName) {
    return customer.companyName;
  }

  return (
    [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim() ||
    "Unknown customer"
  );
}

//************************************************************** */

function getVehicleDescription(
  vehicle: ScheduleWorkBlock["repairOrder"]["vehicle"],
): string {
  return (
    [vehicle.year, vehicle.make, vehicle.model]
      .filter(Boolean)
      .join(" ")
      .trim() || "No vehicle"
  );
}

//************************************************************** */
