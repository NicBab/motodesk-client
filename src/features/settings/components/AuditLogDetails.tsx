import type {
  AuditJsonValue,
  AuditLogItem,
} from "@/features/settings/audit-log.types";

//************************************************************** */

export function AuditLogDetails({
  event,
}: {
  event: AuditLogItem;
}) {
  const actorName = event.actorUser
    ? [
        event.actorUser.firstName,
        event.actorUser.lastName,
      ].filter(Boolean).join(" ")
    : event.actorUserId
      ? "Unavailable user"
      : "System / unspecified actor";

  return (
    <div className="space-y-5 bg-zinc-50/70 p-5">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">
          Event Details
        </h3>

        <p className="mt-1 text-xs text-zinc-500">
          Recorded event context and sanitized metadata.
        </p>
      </div>

      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Event ID" value={event.id} mono />

        <DetailField
          label="Recorded At"
          value={formatTimestamp(event.createdAt)}
        />

        <DetailField label="Action" value={event.action} mono />

        <DetailField
          label="Resource Type"
          value={event.resourceType}
        />

        <DetailField
          label="Resource ID"
          value={event.resourceId}
          mono
        />

        <DetailField label="Actor" value={actorName} />

        <DetailField
          label="Actor Email"
          value={event.actorUser?.email}
        />

        <DetailField
          label="Actor User ID"
          value={event.actorUserId}
          mono
        />

        <DetailField
          label="IP Address"
          value={event.ipAddress}
          mono
        />

        <div className="sm:col-span-2 lg:col-span-3">
          <DetailField
            label="User Agent"
            value={event.userAgent}
          />
        </div>
      </dl>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Metadata
        </h4>

        <div className="mt-3">
          {event.metadata === null ? (
            <p className="text-sm text-zinc-500">
              No metadata was recorded for this event.
            </p>
          ) : (
            <MetadataValue value={event.metadata} />
          )}
        </div>
      </section>
    </div>
  );
}

//************************************************************** */

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-zinc-500">
        {label}
      </dt>

      <dd
        className={[
          "mt-1 whitespace-pre-wrap break-words text-sm text-zinc-800",
          mono ? "font-mono text-xs" : "",
        ].join(" ")}
      >
        {value || "Not recorded"}
      </dd>
    </div>
  );
}

//************************************************************** */

function MetadataValue({
  value,
}: {
  value: AuditJsonValue;
}) {
  if (value === null) {
    return <span className="text-xs text-zinc-500">null</span>;
  }

  if (typeof value !== "object") {
    const displayedValue =
      typeof value === "string"
        ? value
        : String(value);

    return (
      <span
        className={[
          "whitespace-pre-wrap break-words text-xs",
          displayedValue === "[REDACTED]"
            ? "font-medium text-amber-700"
            : "text-zinc-700",
        ].join(" ")}
      >
        {displayedValue === "" ? "(empty string)" : displayedValue}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span className="text-xs text-zinc-500">
          Empty list
        </span>
      );
    }

    return (
      <ol className="space-y-3">
        {value.map((item, index) => (
          <li
            key={index}
            className="min-w-0 rounded-md border border-zinc-200 bg-zinc-50/50 p-3"
          >
            <p className="mb-2 text-xs font-medium text-zinc-500">
              Item {index + 1}
            </p>

            <MetadataValue value={item} />
          </li>
        ))}
      </ol>
    );
  }

  const entries = Object.entries(value);

  if (entries.length === 0) {
    return (
      <span className="text-xs text-zinc-500">
        No additional details
      </span>
    );
  }

  return (
    <dl className="space-y-3">
      {entries.map(([key, entryValue]) => (
        <div
          key={key}
          className="min-w-0 border-l-2 border-zinc-200 pl-3"
        >
          <dt className="break-words text-xs font-semibold text-zinc-800">
            {key}
          </dt>

          <dd className="mt-1 min-w-0">
            <MetadataValue value={entryValue} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

//************************************************************** */

function formatTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "long",
  }).format(date);
}

//************************************************************** */