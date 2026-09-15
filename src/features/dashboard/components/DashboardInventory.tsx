import Link from "next/link";

import {
  ArrowRight,
  Boxes,
  CalendarDays,
  PackageCheck,
  TriangleAlert,
} from "lucide-react";

import type {
  DashboardExpectedDelivery,
  DashboardLowStockPart,
} from "../dashboard.types";

//************************************************************** */

type DashboardInventoryProps = {
  lowStockParts: DashboardLowStockPart[];

  expectedDeliveries: DashboardExpectedDelivery[];
};

//************************************************************** */

export function DashboardInventory({
  lowStockParts,
  expectedDeliveries,
}: DashboardInventoryProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <LowStockPanel parts={lowStockParts} />

      <ExpectedDeliveriesPanel deliveries={expectedDeliveries} />
    </div>
  );
}

//************************************************************** */

function LowStockPanel({ parts }: { parts: DashboardLowStockPart[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Low Stock</h2>

          <p className="mt-1 text-xs text-zinc-500">
            Parts at or below their reorder point
          </p>
        </div>

        <Link
          href="/parts"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-orange-600 transition hover:text-orange-700"
        >
          View parts
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {parts.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="Stock levels look healthy"
          description="No low-stock parts need attention."
        />
      ) : (
        <div className="divide-y divide-zinc-100">
          {parts.map((part) => {
            const available = part.qtyOnHand - part.qtyAllocated;

            return (
              <div key={part.id} className="flex items-center gap-4 px-5 py-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600">
                  <TriangleAlert className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {part.partNumber}
                    </p>

                    {part.location ? (
                      <span className="text-[10px] font-medium text-zinc-400">
                        {part.location}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {part.description}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                    <span>
                      On hand{" "}
                      <strong className="font-semibold text-zinc-700">
                        {formatQuantity(part.qtyOnHand)}
                      </strong>
                    </span>

                    <span>
                      Available{" "}
                      <strong className="font-semibold text-zinc-700">
                        {formatQuantity(available)}
                      </strong>
                    </span>

                    <span>
                      On order{" "}
                      <strong className="font-semibold text-zinc-700">
                        {formatQuantity(part.qtyOnOrder)}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                    Reorder
                  </p>

                  <p className="mt-1 text-sm font-bold text-zinc-900">
                    {formatQuantity(part.reorderPoint)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

//************************************************************** */

function ExpectedDeliveriesPanel({
  deliveries,
}: {
  deliveries: DashboardExpectedDelivery[];
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Expected Deliveries
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Upcoming purchase order arrivals
          </p>
        </div>

        <Link
          href="/parts"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-orange-600 transition hover:text-orange-700"
        >
          View purchasing
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {deliveries.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No expected deliveries"
          description="Ordered purchase orders with expected dates will appear here."
        />
      ) : (
        <div className="divide-y divide-zinc-100">
          {deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="flex items-center gap-4 px-5 py-4"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <CalendarDays className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900">
                    PO #{delivery.poNumber}
                  </p>

                  <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                    {formatLabel(delivery.status)}
                  </span>
                </div>

                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {delivery.vendorName}
                </p>

                <p className="mt-2 text-[11px] text-zinc-500">
                  {delivery.lineCount}{" "}
                  {delivery.lineCount === 1 ? "line" : "lines"}
                  {" · "}
                  {formatQuantity(delivery.remainingQuantity)} remaining
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                  Expected
                </p>

                <p className="mt-1 text-xs font-semibold text-zinc-700">
                  {formatDate(delivery.expectedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

//************************************************************** */

type EmptyStateProps = {
  icon: typeof Boxes;

  title: string;

  description: string;
};

//************************************************************** */

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="grid min-h-52 place-items-center p-6 text-center">
      <div>
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-zinc-100 text-zinc-400">
          <Icon className="h-5 w-5" />
        </div>

        <p className="mt-3 text-sm font-medium text-zinc-700">{title}</p>

        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

//************************************************************** */

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
  }).format(value);
}

//************************************************************** */

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",

    day: "numeric",

    year: "numeric",
  }).format(new Date(value));
}

//************************************************************** */

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */
