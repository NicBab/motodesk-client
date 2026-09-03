//************************************************************** */

type ReportTableShellProps = {
  title: string;

  count?: number;

  controls?: React.ReactNode;

  children: React.ReactNode;

  className?: string;
};

//************************************************************** */

export function ReportTableShell({
  title,
  count,
  controls,
  children,
  className = "",
}: ReportTableShellProps) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm ${className}`}
    >
      <header className="space-y-3 border-b border-zinc-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-800">
          {title}

          {typeof count === "number" ? (
            <span className="ml-1 font-normal text-zinc-400">({count})</span>
          ) : null}
        </h2>

        {controls ? <div>{controls}</div> : null}
      </header>

      <div className="p-5">{children}</div>
    </section>
  );
}

//************************************************************** */

export function ReportTableEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-28 place-items-center px-4 py-8 text-center">
      <p className="text-sm text-zinc-400">{children}</p>
    </div>
  );
}

//************************************************************** */

export function ReportStatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusClassName(
        value,
      )}`}
    >
      {formatValue(value)}
    </span>
  );
}

//************************************************************** */

export function formatReportTableValue(value: string): string {
  return formatValue(value);
}

//************************************************************** */

function formatValue(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

//************************************************************** */

function getStatusClassName(value: string): string {
  switch (value) {
    case "COMPLETED":
    case "CASHIERED":
    case "PICKED_UP":
    case "READY_TO_WORK":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "PARTIALLY_REFUNDED":
    case "WAITING_ON_PARTS":
    case "AWAITING_APPROVAL":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "REFUNDED":
    case "VOID":
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";

    case "IN_PROGRESS":
      return "border-blue-200 bg-blue-50 text-blue-700";

    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-600";
  }
}

//************************************************************** */
