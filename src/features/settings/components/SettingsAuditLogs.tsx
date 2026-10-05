"use client";

import { useState } from "react";

import {
  Loader2,
  RefreshCw,
  ScrollText,
  ShieldAlert,
} from "lucide-react";

import type {
  AuditLogListInput,
} from "@/features/settings/audit-log.types";

import {
  useGetAuditLogFilterOptionsQuery,
  useGetAuditLogsQuery,
} from "@/store/api/auditApi";

import {
  AuditLogFilters,
  EMPTY_AUDIT_FILTERS,
  type AuditLogFilterValues,
} from "./AuditLogFilters";

import { AuditLogEvents } from "./AuditLogEvents";

//************************************************************** */

export function SettingsAuditLogs({
  organizationId,
  permissions,
}: {
  organizationId: string;
  permissions: string[];
}) {
  if (!permissions.includes("audit:view")) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-8 w-8 text-zinc-400" />

        <h2 className="mt-3 text-sm font-semibold text-zinc-900">
          Audit Log Access Required
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Your organization membership does not have permission to view audit logs.
        </p>
      </section>
    );
  }

  // Reset filters and pagination when switching organizations.
  // No audit queries are mounted without the required permission.
  return (
    <AuditLogViewer
      key={organizationId}
      organizationId={organizationId}
    />
  );
}

//************************************************************** */

function AuditLogViewer({
  organizationId,
}: {
  organizationId: string;
}) {
  const [draftFilters, setDraftFilters] =
    useState<AuditLogFilterValues>({
      ...EMPTY_AUDIT_FILTERS,
    });

  const [filterError, setFilterError] =
    useState<string | null>(null);

  const [query, setQuery] = useState<AuditLogListInput>({
    organizationId,
    page: 1,
    pageSize: 25,
  });

  const {
    currentData: auditLogs,
    isFetching,
    isError,
    error: auditError,
    refetch: refetchLogs,
  } = useGetAuditLogsQuery(query, {
    refetchOnMountOrArgChange: true,
  });

  const {
    currentData: filterOptions,
    isFetching: isFetchingOptions,
    isError: isOptionsError,
    refetch: refetchOptions,
  } = useGetAuditLogFilterOptionsQuery(
    { organizationId },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const accessDenied =
    auditError !== undefined &&
    "status" in auditError &&
    (auditError.status === 401 || auditError.status === 403);

  //************************************************************** */

  function applyFilters() {
    setFilterError(null);

    const {
      search,
      action,
      actorUserId,
      resourceType,
      startDate,
      endDate,
    } = draftFilters;

    if (startDate && endDate && startDate > endDate) {
      setFilterError(
        "The through date must be on or after the from date.",
      );

      return;
    }

    try {
      setQuery({
        organizationId,
        page: 1,
        pageSize: query.pageSize,

        ...(search.trim()
          ? { search: search.trim() }
          : {}),

        ...(action
          ? { action }
          : {}),

        ...(actorUserId
          ? { actorUserId }
          : {}),

        ...(resourceType
          ? { resourceType }
          : {}),

        ...(startDate
          ? { createdFrom: dateBoundary(startDate, false) }
          : {}),

        ...(endDate
          ? { createdBefore: dateBoundary(endDate, true) }
          : {}),
      });
    } catch {
      setFilterError("Enter a valid date range.");
    }
  }

  //************************************************************** */

  function resetFilters() {
    setDraftFilters({ ...EMPTY_AUDIT_FILTERS });
    setFilterError(null);

    setQuery({
      organizationId,
      page: 1,
      pageSize: query.pageSize,
    });
  }

  function refresh() {
    void refetchLogs();
    void refetchOptions();
  }

  //************************************************************** */

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900">
            <ScrollText className="h-5 w-5 text-orange-500" />
            Audit Logs
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Review recorded activity for this organization, identify who
            performed an action, and inspect its resource context and details.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={isFetching || isFetchingOptions}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={[
              "h-4 w-4",
              isFetching || isFetchingOptions ? "animate-spin" : "",
            ].join(" ")}
          />

          Refresh
        </button>
      </section>

      {accessDenied ? (
        <section
          role="alert"
          className="rounded-xl border border-amber-200 bg-white p-6 text-sm text-amber-800 shadow-sm"
        >
          Your current session cannot access audit logs. Refresh your account
          or contact an organization administrator.
        </section>
      ) : (
        <>
          <AuditLogFilters
            values={draftFilters}
            options={filterOptions}
            isLoadingOptions={isFetchingOptions && !filterOptions}
            isOptionsError={isOptionsError}
            error={filterError}
            onChange={(values) => {
              setDraftFilters(values);
              setFilterError(null);
            }}
            onApply={applyFilters}
            onReset={resetFilters}
            onRetryOptions={() => void refetchOptions()}
          />

          {isError ? (
            <section
              role="alert"
              className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm"
            >
              <p className="text-sm font-semibold text-red-700">
                MotoDesk could not load audit logs.
              </p>

              <button
                type="button"
                onClick={() => void refetchLogs()}
                disabled={isFetching}
                className="mt-4 h-9 rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                Try Again
              </button>
            </section>
          ) : !auditLogs ? (
            <section
              role="status"
              className="flex min-h-56 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500 shadow-sm"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading audit logs…
            </section>
          ) : (
            <>
              {isFetching ? (
                <p role="status" className="text-xs text-zinc-500">
                  Updating events…
                </p>
              ) : null}

              <AuditLogEvents
                key={JSON.stringify(query)}
                data={auditLogs}
                pageSize={query.pageSize}
                isFetching={isFetching}
                onPageChange={(page) =>
                  setQuery((current) => ({
                    ...current,
                    page,
                  }))
                }
                onPageSizeChange={(pageSize) =>
                  setQuery((current) => ({
                    ...current,
                    page: 1,
                    pageSize,
                  }))
                }
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

//************************************************************** */

function dateBoundary(
  value: string,
  nextDay: boolean,
): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Invalid date.");
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date.");
  }

  const [year, month, day] = value.split("-").map(Number);

  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    throw new Error("Invalid date.");
  }

  if (nextDay) {
    // Advance a calendar day rather than adding 24 hours, preserving
    // full-day filtering across daylight-saving transitions.
    date.setDate(date.getDate() + 1);
  }

  return date.toISOString();
}

//************************************************************** */