"use client";

import { useMemo, useState } from "react";

import { ReportChart } from "@/features/reports/components/ReportChart";

import { ReportsDetails } from "@/features/reports/components/ReportDetails";

import { ReportsHeader } from "@/features/reports/components/ReportHeader";

import { ReportsSummary } from "@/features/reports/components/ReportSummary";

import type { ReportMode } from "@/features/reports/report.types";

import {
  getCurrentReportSelection,
  getReportRange,
} from "@/features/reports/report.utils";

import { useGetReportsOverviewQuery } from "@/store/api/reportsApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

//************************************************************** */

const initialSelection = getCurrentReportSelection();

//************************************************************** */

export default function ReportsPage() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const [mode, setMode] = useState<ReportMode>(initialSelection.mode);

  const [selectedMonth, setSelectedMonth] = useState(initialSelection.month);

  const [selectedYear, setSelectedYear] = useState(initialSelection.year);

  //************************************************************** */

  const range = useMemo(
    () => getReportRange(mode, selectedMonth, selectedYear),
    [mode, selectedMonth, selectedYear],
  );

  //************************************************************** */

  const {
    data: report,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetReportsOverviewQuery(
    {
      organizationId: organizationId ?? "",

      start: range.start,

      end: range.end,

      mode,
    },
    {
      skip: !organizationId,
    },
  );

  //************************************************************** */

  const years = useMemo(() => {
    const values = new Set<number>(report?.filters.years ?? []);

    values.add(selectedYear);

    values.add(new Date().getFullYear());

    return Array.from(values).sort((left, right) => right - left);
  }, [report, selectedYear]);

  //************************************************************** */

  if (!organizationId) {
    return (
      <ReportsState
        title="No organization selected"
        description="Select an organization to view Reports."
      />
    );
  }

  //************************************************************** */

  return (
    <div className="space-y-6">
      <ReportsHeader
        mode={mode}
        month={selectedMonth}
        year={selectedYear}
        years={years}
        repairOrderCount={report?.summary.repairOrderCount ?? 0}
        onModeChange={setMode}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      {isLoading ? (
        <ReportsState
          title="Loading Reports"
          description="MotoDesk is calculating the selected reporting period."
        />
      ) : isError ? (
        <ReportsError onRetry={refetch} />
      ) : !report ? (
        <ReportsState
          title="No report available"
          description="MotoDesk did not receive report data for the selected period."
        />
      ) : (
        <>
          {isFetching ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700">
              Updating report...
            </div>
          ) : null}

          <ReportsSummary summary={report.summary} />

          <ReportChart
            revenueTrend={report.revenueTrend}
            laborPartsBreakdown={report.laborPartsBreakdown}
            statusDistribution={report.statusDistribution}
          />

          <ReportsDetails report={report} />
        </>
      )}
    </div>
  );
}

//************************************************************** */

function ReportsState({
  title,
  description,
}: {
  title: string;

  description: string;
}) {
  return (
    <section className="grid min-h-72 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <div>
        <p className="text-sm font-semibold text-zinc-700">{title}</p>

        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      </div>
    </section>
  );
}

//************************************************************** */

function ReportsError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="grid min-h-72 place-items-center rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
      <div>
        <p className="text-sm font-semibold text-red-700">
          MotoDesk could not load Reports.
        </p>

        <p className="mt-1 text-sm text-zinc-400">
          The reporting request failed.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          Try Again
        </button>
      </div>
    </section>
  );
}

//************************************************************** */
