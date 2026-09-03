"use client";

import { BarChart3 } from "lucide-react";

import type { ReportMode } from "../report.types";

import { REPORT_MONTHS, formatReportPeriodLabel } from "../report.utils";

//************************************************************** */

type ReportsHeaderProps = {
  mode: ReportMode;

  month: number;

  year: number;

  years: number[];

  repairOrderCount: number;

  onModeChange: (mode: ReportMode) => void;

  onMonthChange: (month: number) => void;

  onYearChange: (year: number) => void;
};

//************************************************************** */

export function ReportsHeader({
  mode,
  month,
  year,
  years,
  repairOrderCount,
  onModeChange,
  onMonthChange,
  onYearChange,
}: ReportsHeaderProps) {
  const periodLabel = formatReportPeriodLabel(mode, month, year);

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
          <BarChart3 className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            {periodLabel}
            {" · "}
            {repairOrderCount}{" "}
            {repairOrderCount === 1 ? "repair order" : "repair orders"}
            {" analyzed"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ReportModeToggle mode={mode} onChange={onModeChange} />

        {mode === "month" ? (
          <select
            value={month}
            onChange={(event) => onMonthChange(Number(event.target.value))}
            aria-label="Report month"
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          >
            {REPORT_MONTHS.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        ) : null}

        <select
          value={year}
          onChange={(event) => onYearChange(Number(event.target.value))}
          aria-label="Report year"
          className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

//************************************************************** */

function ReportModeToggle({
  mode,
  onChange,
}: {
  mode: ReportMode;

  onChange: (mode: ReportMode) => void;
}) {
  const options: {
    value: ReportMode;

    label: string;
  }[] = [
    {
      value: "month",

      label: "Monthly",
    },

    {
      value: "annual",

      label: "Annual",
    },
  ];

  return (
    <div className="flex overflow-hidden rounded-lg border border-zinc-300 bg-white">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={[
            "h-10 px-4 text-sm font-semibold transition",
            mode === option.value
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
          ].join(" ")}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

//************************************************************** */
