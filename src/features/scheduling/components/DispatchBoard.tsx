"use client";

import { useEffect, useMemo, useState } from "react";

import type { Employee } from "@/features/employees/employee.types";

import { getScheduleCardColor } from "../scheduling.card-colors";

import { computeScheduleOverlapLayout } from "../scheduling.layout";

import type { ScheduleWorkBlock } from "../scheduling.types";

import {
  SCHEDULING_DEFAULT_DAILY_HOURS,
  SCHEDULING_END_HOUR,
  SCHEDULING_HOUR_HEIGHT,
  SCHEDULING_SLOT_HEIGHT,
  SCHEDULING_SLOT_MINUTES,
  SCHEDULING_START_HOUR,
} from "../scheduling.constants";

import { getEmployeeDisplayName, isToday } from "../scheduling.utils";

import { ScheduleWorkCard, type DispatchDensity } from "./ScheduleWorkCard";

//************************************************************** */

type DispatchBoardProps = {
  technicians: Employee[];

  workBlocks: ScheduleWorkBlock[];

  selectedDate: Date;

  selectedBlockId?: string | null;

  onWorkBlockClick?: (block: ScheduleWorkBlock) => void;

  onSlotClick?: (technician: Employee, hour: number, minute: number) => void;
};

//************************************************************** */

type TimeSlot = {
  hour: number;

  minute: number;

  label: string;
};

//************************************************************** */

const DISPATCH_DENSITY_KEY = "motodesk-dispatch-density";

//************************************************************** */

export function DispatchBoard({
  technicians,
  workBlocks,
  selectedDate,
  selectedBlockId,
  onWorkBlockClick,
  onSlotClick,
}: DispatchBoardProps) {
  const [density, setDensity] = useState<DispatchDensity>(() => {
    if (typeof window === "undefined") {
      return "comfortable";
    }

    const stored = window.localStorage.getItem(DISPATCH_DENSITY_KEY);

    if (stored === "comfortable" || stored === "compact") {
      return stored;
    }

    return "comfortable";
  });

  //************************************************************** */

  function updateDensity(value: DispatchDensity) {
    setDensity(value);

    window.localStorage.setItem(DISPATCH_DENSITY_KEY, value);
  }

  //************************************************************** */

  const timeSlots = useMemo(() => createTimeSlots(), []);

  const gridHeight =
    (SCHEDULING_END_HOUR - SCHEDULING_START_HOUR) * SCHEDULING_HOUR_HEIGHT;

  const nowTop = getCurrentTimeTop();

  const showCurrentTime =
    isToday(selectedDate) && nowTop >= 0 && nowTop <= gridHeight;

  //************************************************************** */

  if (technicians.length === 0) {
    return (
      <section className="grid min-h-72 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-center">
        <div>
          <p className="text-sm font-semibold text-zinc-700">
            No schedulable technicians
          </p>

          <p className="mt-1 max-w-md text-xs leading-5 text-zinc-400">
            Active Technician employees marked as schedulable will appear on the
            dispatch board.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">
          {technicians.length}{" "}
          {technicians.length === 1 ? "technician" : "technicians"}
          {" · "}
          {workBlocks.length}{" "}
          {workBlocks.length === 1 ? "scheduled block" : "scheduled blocks"}
        </p>

        <DensityToggle density={density} onChange={updateDensity} />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex">
          <div className="w-16 shrink-0 border-r border-zinc-200 bg-zinc-50">
            <div className="sticky top-0 z-20 h-16 border-b border-zinc-200 bg-zinc-50" />

            <div className="relative">
              {timeSlots.map((slot) => (
                <div
                  key={`${slot.hour}-${slot.minute}`}
                  className={[
                    "border-b pr-2 pt-1 text-right text-[10px] leading-none text-zinc-400",
                    slot.minute === 30 ? "border-zinc-100" : "border-zinc-200",
                  ].join(" ")}
                  style={{
                    height: SCHEDULING_SLOT_HEIGHT,
                  }}
                >
                  {slot.label}
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1 overflow-x-auto">
            <div
              className="flex"
              style={{
                minWidth: technicians.length * 210,
              }}
            >
              {technicians.map((technician, technicianIndex) => {
                const technicianBlocks = workBlocks.filter(
                  (block) => block.technicianEmployeeId === technician.id,
                );

                const layouts = computeScheduleOverlapLayout(technicianBlocks);

                const scheduledMinutes = getScheduledMinutes(technicianBlocks);

                const availableHours = getTechnicianAvailableHours(technician);

                const availableMinutes = availableHours * 60;

                const capacity =
                  availableMinutes > 0
                    ? Math.round((scheduledMinutes / availableMinutes) * 100)
                    : 0;

                return (
                  <div
                    key={technician.id}
                    className={[
                      "w-[210px] shrink-0 border-r border-zinc-200",
                      technicianIndex % 2 === 1 ? "bg-zinc-50/40" : "bg-white",
                    ].join(" ")}
                  >
                    <TechnicianHeader
                      technician={technician}
                      scheduledMinutes={scheduledMinutes}
                      availableHours={availableHours}
                      capacity={capacity}
                    />

                    <div
                      className="relative"
                      style={{
                        height: gridHeight,
                      }}
                      onClick={(event) => {
                        if (event.target !== event.currentTarget) {
                          return;
                        }

                        if (!onSlotClick) {
                          return;
                        }

                        const rect =
                          event.currentTarget.getBoundingClientRect();

                        const y = event.clientY - rect.top;

                        const slotIndex = Math.max(
                          0,
                          Math.min(
                            timeSlots.length - 1,

                            Math.floor(y / SCHEDULING_SLOT_HEIGHT),
                          ),
                        );

                        const slot = timeSlots[slotIndex];

                        onSlotClick(technician, slot.hour, slot.minute);
                      }}
                    >
                      {timeSlots.map((slot) => (
                        <div
                          key={`${technician.id}-${slot.hour}-${slot.minute}`}
                          className={[
                            "border-b",
                            slot.minute === 30
                              ? "border-zinc-100"
                              : "border-zinc-200/70",
                          ].join(" ")}
                          style={{
                            height: SCHEDULING_SLOT_HEIGHT,
                          }}
                        />
                      ))}

                      {showCurrentTime ? (
                        <div
                          className="pointer-events-none absolute left-0 right-0 z-[1]"
                          style={{
                            top: nowTop,
                          }}
                        >
                          <div className="h-px bg-red-500/70" />

                          <div className="absolute -left-1 -top-[3px] h-1.5 w-1.5 rounded-full bg-red-500" />
                        </div>
                      ) : null}

                      {technicianBlocks.map((block) => (
                        <ScheduleWorkCard
                          key={block.id}
                          workBlock={block}
                          density={density}
                          layout={
                            layouts.get(block.id) ?? {
                              column: 0,

                              totalColumns: 1,
                            }
                          }
                          color={getScheduleCardColor(
                            block.repairOrderId || block.id,
                          )}
                          selected={selectedBlockId === block.id}
                          onOpen={(selectedBlock) =>
                            onWorkBlockClick?.(selectedBlock)
                          }
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

//************************************************************** */

function TechnicianHeader({
  technician,
  scheduledMinutes,
  availableHours,
  capacity,
}: {
  technician: Employee;

  scheduledMinutes: number;

  availableHours: number;

  capacity: number;
}) {
  return (
    <div className="sticky top-0 z-20 flex h-16 flex-col justify-center border-b border-zinc-200 bg-zinc-50/95 px-2 backdrop-blur">
      <p className="truncate text-sm font-semibold text-zinc-800">
        {getEmployeeDisplayName(technician)}
      </p>

      <p className={`text-[11px] ${getCapacityTextClassName(capacity)}`}>
        {(scheduledMinutes / 60).toFixed(1)}/{availableHours.toFixed(0)}
        {" hrs · "}
        {capacity}%
      </p>

      <div className="mt-1 h-1 overflow-hidden rounded-full bg-zinc-200">
        <div
          className={`h-full rounded-full transition-all ${getCapacityBarClassName(
            capacity,
          )}`}
          style={{
            width: `${Math.min(100, capacity)}%`,
          }}
        />
      </div>
    </div>
  );
}

//************************************************************** */

function DensityToggle({
  density,
  onChange,
}: {
  density: DispatchDensity;

  onChange: (value: DispatchDensity) => void;
}) {
  const options: DispatchDensity[] = ["comfortable", "compact"];

  return (
    <div className="flex w-fit items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-0.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={[
            "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition",
            density === option
              ? "bg-zinc-900 text-white"
              : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
          ].join(" ")}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

//************************************************************** */

function createTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (
    let hour = SCHEDULING_START_HOUR;
    hour < SCHEDULING_END_HOUR;
    hour += 1
  ) {
    slots.push({
      hour,

      minute: 0,

      label: formatGridTime(hour, 0),
    });

    slots.push({
      hour,

      minute: SCHEDULING_SLOT_MINUTES,

      label: "",
    });
  }

  return slots;
}

//************************************************************** */

function formatGridTime(hour: number, minute: number): string {
  const date = new Date(2000, 0, 1, hour, minute);

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",

    minute: "2-digit",
  }).format(date);
}

//************************************************************** */

function getScheduledMinutes(blocks: ScheduleWorkBlock[]): number {
  return blocks.reduce((total, block) => {
    if (block.status === "CANCELLED" || !block.scheduledEnd) {
      return total;
    }

    const start = new Date(block.scheduledDate).getTime();

    const end = new Date(block.scheduledEnd).getTime();

    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      return total;
    }

    return total + (end - start) / 60000;
  }, 0);
}

//************************************************************** */

function getTechnicianAvailableHours(technician: Employee): number {
  const value = Number(technician.maxDailyHours);

  if (Number.isFinite(value) && value > 0) {
    return value;
  }

  return SCHEDULING_DEFAULT_DAILY_HOURS;
}

//************************************************************** */

function getCurrentTimeTop(): number {
  const now = new Date();

  const decimalHour = now.getHours() + now.getMinutes() / 60;

  return (decimalHour - SCHEDULING_START_HOUR) * SCHEDULING_HOUR_HEIGHT;
}

//************************************************************** */

function getCapacityBarClassName(percent: number): string {
  if (percent >= 100) {
    return "bg-red-500";
  }

  if (percent >= 85) {
    return "bg-amber-500";
  }

  if (percent >= 50) {
    return "bg-emerald-500";
  }

  return "bg-orange-500";
}

//************************************************************** */

function getCapacityTextClassName(percent: number): string {
  if (percent >= 100) {
    return "text-red-600";
  }

  if (percent >= 85) {
    return "text-amber-600";
  }

  if (percent >= 50) {
    return "text-emerald-600";
  }

  return "text-zinc-400";
}

//************************************************************** */
