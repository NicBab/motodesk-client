import type { Employee } from "@/features/employees/employee.types";

import type { ScheduleWorkBlock, ServiceAppointment } from "./scheduling.types";

import { SCHEDULING_DEFAULT_DAILY_HOURS } from "./scheduling.constants";

//************************************************************** */

export function getDateFromScheduleParam(value: string | null): Date {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return startOfLocalDay(new Date());
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return startOfLocalDay(new Date());
  }

  return date;
}

//************************************************************** */

export function startOfLocalDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

//************************************************************** */

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

//************************************************************** */

export function getSchedulingDayRange(date: Date): {
  start: string;

  end: string;
} {
  const start = startOfLocalDay(date);

  const end = addDays(start, 1);

  return {
    start: start.toISOString(),

    end: end.toISOString(),
  };
}

//************************************************************** */

export function toScheduleDateParam(date: Date): string {
  const year = date.getFullYear().toString();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

//************************************************************** */

export function formatSchedulingDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",

    day: "numeric",

    year: "numeric",
  }).format(date);
}

//************************************************************** */

export function isToday(date: Date): boolean {
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

//************************************************************** */

export function formatSchedulingTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",

    minute: "2-digit",
  }).format(date);
}

//************************************************************** */

export function getEmployeeDisplayName(
  employee: Employee | null | undefined,
): string {
  if (!employee) {
    return "Unassigned";
  }

  return (
    [employee.firstName, employee.lastName].filter(Boolean).join(" ").trim() ||
    "Unnamed employee"
  );
}

//************************************************************** */

export function getScheduledRepairOrderCount(
  schedules: ScheduleWorkBlock[],
): number {
  return new Set(
    schedules
      .filter((schedule) => schedule.status !== "CANCELLED")
      .map((schedule) => schedule.repairOrderId),
  ).size;
}

//************************************************************** */

export function getAppointmentsCount(
  appointments: ServiceAppointment[],
): number {
  return appointments.filter(
    (appointment) => appointment.status !== "CANCELLED",
  ).length;
}

//************************************************************** */

export function getShopCapacityPercent(
  technicians: Employee[],
  schedules: ScheduleWorkBlock[],
): number {
  const availableMinutes = technicians.reduce((total, technician) => {
    const hours = Number(technician.maxDailyHours);

    const dailyHours =
      Number.isFinite(hours) && hours > 0
        ? hours
        : SCHEDULING_DEFAULT_DAILY_HOURS;

    return total + dailyHours * 60;
  }, 0);

  if (availableMinutes <= 0) {
    return 0;
  }

  const scheduledMinutes = schedules.reduce((total, schedule) => {
    if (schedule.status === "CANCELLED" || !schedule.scheduledEnd) {
      return total;
    }

    const start = new Date(schedule.scheduledDate).getTime();

    const end = new Date(schedule.scheduledEnd).getTime();

    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      return total;
    }

    return total + (end - start) / 60000;
  }, 0);

  return Math.round((scheduledMinutes / availableMinutes) * 100);
}

//************************************************************** */

export function formatServiceAppointmentType(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

//************************************************************** */

export function formatScheduleStatus(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

//************************************************************** */
