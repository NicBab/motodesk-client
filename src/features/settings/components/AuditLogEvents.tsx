"use client";

import { Fragment, useState } from "react";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ScrollText,
} from "lucide-react";

import type {
  AuditLogListResponse,
} from "@/features/settings/audit-log.types";

import { AuditLogDetails } from "./AuditLogDetails";

//************************************************************** */

export function AuditLogEvents({
  data,
  pageSize,
  isFetching,
  onPageChange,
  onPageSizeChange,
}: {
  data: AuditLogListResponse;
  pageSize: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const [expandedEventId, setExpandedEventId] =
    useState<string | null>(null);

  const { items, pagination } = data;

  const firstItem = items.length > 0
    ? (pagination.page - 1) * pagination.pageSize + 1
    : 0;

  const lastItem = items.length > 0
    ? firstItem + items.length - 1
    : 0;

  return (
    <section
      aria-label="Audit events"
      aria-busy={isFetching}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Recorded Events
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            {pagination.totalItems.toLocaleString()} matching{" "}
            {pagination.totalItems === 1 ? "event" : "events"}
            {" · "}Newest first
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs text-zinc-500">
          Rows per page

          <select
            value={pageSize}
            disabled={isFetching}
            onChange={(event) =>
              onPageSizeChange(Number(event.target.value))
            }
            className="h-8 rounded-lg border border-zinc-300 bg-white px-2 text-sm text-zinc-700 outline-none focus:border-orange-500"
          >
            {[25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </header>

      {items.length === 0 ? (
        <div className="grid min-h-56 place-items-center p-8 text-center">
          <div>
            <ScrollText className="mx-auto h-8 w-8 text-zinc-300" />

            <h3 className="mt-3 text-sm font-semibold text-zinc-900">
              No matching events
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Adjust your filters or refresh to check for new activity.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <caption className="sr-only">
              Organization audit events. Expand an event to inspect its details.
            </caption>

            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">
                  Timestamp
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Actor
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Action / Event
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Resource
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  IP Address
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {items.map((event) => {
                const expanded = expandedEventId === event.id;

                const actorName = event.actorUser
                  ? [
                      event.actorUser.firstName,
                      event.actorUser.lastName,
                    ].filter(Boolean).join(" ")
                  : event.actorUserId
                    ? "Unavailable user"
                    : "System / unspecified";

                return (
                  <Fragment key={event.id}>
                    <tr className={expanded ? "bg-orange-50/40" : ""}>
                      <td className="whitespace-nowrap px-5 py-4 align-top">
                        <time
                          dateTime={event.createdAt}
                          title={event.createdAt}
                          className="text-xs text-zinc-700"
                        >
                          {formatDateTime(event.createdAt)}
                        </time>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <p className="break-words font-medium text-zinc-800">
                          {actorName}
                        </p>

                        <p className="mt-1 max-w-56 break-all text-xs text-zinc-500">
                          {event.actorUser?.email ?? event.actorUserId ?? "No user recorded"}
                        </p>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <span className="inline-block rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-700">
                          {event.action}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <p className="font-medium text-zinc-800">
                          {event.resourceType}
                        </p>

                        <p className="mt-1 max-w-56 break-all font-mono text-xs text-zinc-500">
                          {event.resourceId ?? "No identifier recorded"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 align-top font-mono text-xs text-zinc-500">
                        {event.ipAddress ?? "Not recorded"}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={`audit-details-${event.id}`}
                          aria-label={`${expanded ? "Hide" : "Show"} details for ${event.action} at ${event.createdAt}`}
                          onClick={() =>
                            setExpandedEventId(expanded ? null : event.id)
                          }
                          className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                        >
                          {expanded ? "Hide" : "View"}

                          <ChevronDown
                            className={[
                              "h-3.5 w-3.5 transition-transform",
                              expanded ? "rotate-180" : "",
                            ].join(" ")}
                          />
                        </button>
                      </td>
                    </tr>

                    <tr hidden={!expanded}>
                      <td colSpan={6} className="p-0">
                        <div id={`audit-details-${event.id}`}>
                          {expanded ? (
                            <AuditLogDetails event={event} />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-5 py-4">
        <p className="text-xs text-zinc-500">
          Showing {firstItem.toLocaleString()}–{lastItem.toLocaleString()} of{" "}
          {pagination.totalItems.toLocaleString()}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous page"
            disabled={!pagination.hasPreviousPage || isFetching}
            onClick={() => onPageChange(pagination.page - 1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-300 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-xs text-zinc-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            type="button"
            aria-label="Next page"
            disabled={!pagination.hasNextPage || isFetching}
            onClick={() => onPageChange(pagination.page + 1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-300 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </section>
  );
}

//************************************************************** */

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown timestamp";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
}

//************************************************************** */