import type { ReportMode } from "./report.types";

//************************************************************** */

export const REPORT_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

//************************************************************** */

export function getCurrentReportSelection() {
  const now = new Date();

  return {
    mode: "month" as ReportMode,

    month: now.getMonth(),

    year: now.getFullYear(),
  };
}

//************************************************************** */

export function getReportRange(
  mode: ReportMode,
  month: number,
  year: number,
): {
  start: string;

  end: string;
} {
  if (mode === "annual") {
    const start = new Date(year, 0, 1, 0, 0, 0, 0);

    const end = new Date(year + 1, 0, 1, 0, 0, 0, 0);

    return {
      start: start.toISOString(),

      end: end.toISOString(),
    };
  }

  const start = new Date(year, month, 1, 0, 0, 0, 0);

  const end = new Date(year, month + 1, 1, 0, 0, 0, 0);

  return {
    start: start.toISOString(),

    end: end.toISOString(),
  };
}

//************************************************************** */

export function formatReportPeriodLabel(
  mode: ReportMode,
  month: number,
  year: number,
): string {
  if (mode === "annual") {
    return String(year);
  }

  return `${REPORT_MONTHS[month]} ${year}`;
}

//************************************************************** */

export function formatReportCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",

    currency: "USD",

    minimumFractionDigits: 2,

    maximumFractionDigits: 2,
  }).format(value);
}

//************************************************************** */

export function formatReportNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: digits,

    maximumFractionDigits: digits,
  }).format(value);
}

//************************************************************** */

export function formatReportDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",

    day: "numeric",

    year: "numeric",

    hour: "numeric",

    minute: "2-digit",
  }).format(date);
}

//************************************************************** */

export function formatReportStatus(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

//************************************************************** */
