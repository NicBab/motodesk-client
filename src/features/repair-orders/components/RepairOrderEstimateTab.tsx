"use client";

import {
  CreditCard,
  Printer,
} from "lucide-react";

import {
  useGetRepairOrderLaborLinesQuery,
  useGetRepairOrderPartLinesQuery,
} from "@/store/api/repairOrdersApi";

import type {
  RepairOrder,
} from "../repair-order.types";

type RepairOrderEstimateTabProps = {
  organizationId: string;
  repairOrder: RepairOrder;
  onOpenActions: () => void;
};

export function RepairOrderEstimateTab({
  organizationId,
  repairOrder,
  onOpenActions,
}: RepairOrderEstimateTabProps) {
  const {
    data: laborLines = [],
    isLoading: isLoadingLabor,
  } =
    useGetRepairOrderLaborLinesQuery({
      organizationId,
      repairOrderId:
        repairOrder.id,
    });

  const {
    data: partLines = [],
    isLoading: isLoadingParts,
  } =
    useGetRepairOrderPartLinesQuery({
      organizationId,
      repairOrderId:
        repairOrder.id,
    });

  const laborSubtotal =
    laborLines.reduce(
      (total, line) =>
        total +
        Number(line.hours || 0) *
          Number(line.rate || 0),
      0,
    );

  const partsSubtotal =
    partLines.reduce(
      (total, line) =>
        total +
        Number(
          line.quantity || 0,
        ) *
          Number(
            line.unitPrice || 0,
          ),
      0,
    );

  const shopSuppliesRate =
    Number(
      repairOrder.shopSuppliesRate ||
        0,
    );

  const discount =
    Number(
      repairOrder.discount || 0,
    );

  const taxRate =
    Number(
      repairOrder.taxRate || 0,
    );

  const deposit =
    Number(
      repairOrder.deposit || 0,
    );

  const laborAndParts =
    laborSubtotal +
    partsSubtotal;

  const shopSupplies =
    laborAndParts *
    (shopSuppliesRate / 100);

  const subtotal =
    laborAndParts +
    shopSupplies;

  const taxable =
    Math.max(
      0,
      subtotal - discount,
    );

  const tax =
    taxable *
    (taxRate / 100);

  const estimateTotal =
    taxable + tax;

  const balanceDue =
    Math.max(
      0,
      estimateTotal - deposit,
    );

  const cashierAvailable =
    repairOrder.status ===
    "READY_FOR_PICKUP";

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold text-zinc-900">
                Estimate
              </h2>

              <StatusBadge
                status={
                  repairOrder.status
                }
              />
            </div>

            <p className="mt-2 text-sm font-semibold text-zinc-900">
              {getCustomerName(
                repairOrder,
              )}
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              {getVehicleName(
                repairOrder,
              )}
            </p>

            {repairOrder.vehicle
              .vin ? (
              <p className="mt-1 font-mono text-xs text-zinc-400">
                VIN{" "}
                {
                  repairOrder.vehicle
                    .vin
                }
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>

            {cashierAvailable ? (
              <button
                type="button"
                onClick={
                  onOpenActions
                }
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-500 px-3 text-xs font-semibold text-white transition hover:bg-orange-600"
              >
                <CreditCard className="h-4 w-4" />
                Cashier
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-4 border-t border-zinc-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <EstimateStat
            label="Priority"
            value={formatLabel(
              repairOrder.priority,
            )}
          />

          <EstimateStat
            label="Promised"
            value={
              repairOrder.promisedDate
                ? formatDate(
                    repairOrder.promisedDate,
                  )
                : "—"
            }
          />

          <EstimateStat
            label="Scheduled"
            value={
              repairOrder.scheduledDate
                ? formatDate(
                    repairOrder.scheduledDate,
                  )
                : "—"
            }
          />

          <EstimateStat
            label="Balance Due"
            value={formatCurrency(
              balanceDue,
            )}
          />
        </div>
      </section>

      {repairOrder.complaint ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-zinc-900">
            Customer concern
          </h3>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
            {
              repairOrder.complaint
            }
          </p>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-900">
            Labor
          </h3>
        </div>

        {isLoadingLabor ? (
          <Message>
            Loading labor...
          </Message>
        ) : laborLines.length ===
          0 ? (
          <Message>
            No labor operations.
          </Message>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left">
                  <Heading>
                    Operation
                  </Heading>

                  <Heading>
                    Technician
                  </Heading>

                  <Heading align="right">
                    Hours
                  </Heading>

                  <Heading align="right">
                    Rate
                  </Heading>

                  <Heading align="right">
                    Total
                  </Heading>
                </tr>
              </thead>

              <tbody>
                {laborLines.map(
                  (line) => (
                    <tr
                      key={line.id}
                      className="border-b border-zinc-100 last:border-b-0"
                    >
                      <Cell>
                        {
                          line.description
                        }
                      </Cell>

                      <Cell>
                        {line.technician
                          ? getTechnicianName(
                              line.technician,
                            )
                          : "Unassigned"}
                      </Cell>

                      <Cell align="right">
                        {Number(
                          line.hours ||
                            0,
                        ).toFixed(2)}
                      </Cell>

                      <Cell align="right">
                        {formatCurrency(
                          Number(
                            line.rate ||
                              0,
                          ),
                        )}
                      </Cell>

                      <Cell
                        align="right"
                        strong
                      >
                        {formatCurrency(
                          Number(
                            line.hours ||
                              0,
                          ) *
                            Number(
                              line.rate ||
                                0,
                            ),
                        )}
                      </Cell>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-900">
            Parts
          </h3>
        </div>

        {isLoadingParts ? (
          <Message>
            Loading parts...
          </Message>
        ) : partLines.length ===
          0 ? (
          <Message>
            No parts.
          </Message>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left">
                  <Heading>
                    Part #
                  </Heading>

                  <Heading>
                    Description
                  </Heading>

                  <Heading align="right">
                    Qty
                  </Heading>

                  <Heading align="right">
                    Unit
                  </Heading>

                  <Heading align="right">
                    Total
                  </Heading>
                </tr>
              </thead>

              <tbody>
                {partLines.map(
                  (line) => (
                    <tr
                      key={line.id}
                      className="border-b border-zinc-100 last:border-b-0"
                    >
                      <Cell strong>
                        {
                          line.partNumber
                        }
                      </Cell>

                      <Cell>
                        {
                          line.description
                        }
                      </Cell>

                      <Cell align="right">
                        {Number(
                          line.quantity ||
                            0,
                        ).toFixed(2)}
                      </Cell>

                      <Cell align="right">
                        {formatCurrency(
                          Number(
                            line.unitPrice ||
                              0,
                          ),
                        )}
                      </Cell>

                      <Cell
                        align="right"
                        strong
                      >
                        {formatCurrency(
                          Number(
                            line.quantity ||
                              0,
                          ) *
                            Number(
                              line.unitPrice ||
                                0,
                            ),
                        )}
                      </Cell>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="ml-auto max-w-md space-y-3">
          <SummaryRow
            label="Labor"
            value={laborSubtotal}
          />

          <SummaryRow
            label="Parts"
            value={partsSubtotal}
          />

          <SummaryRow
            label={`Shop supplies (${shopSuppliesRate.toFixed(
              2,
            )}%)`}
            value={shopSupplies}
          />

          <SummaryRow
            label="Subtotal"
            value={subtotal}
          />

          <SummaryRow
            label="Discount"
            value={-discount}
          />

          <SummaryRow
            label={`Tax (${taxRate.toFixed(
              2,
            )}%)`}
            value={tax}
          />

          <div className="border-t border-zinc-200 pt-3">
            <SummaryRow
              label="Estimate Total"
              value={
                estimateTotal
              }
              strong
            />
          </div>

          <SummaryRow
            label="Deposit"
            value={-deposit}
          />

          <div className="border-t border-zinc-200 pt-3">
            <SummaryRow
              label="Balance Due"
              value={balanceDue}
              strong
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 ring-1 ring-inset ring-orange-200">
      {formatLabel(status)}
    </span>
  );
}

function EstimateStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-zinc-900">
        {value}
      </p>
    </div>
  );
}

function Heading({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 ${
        align === "right"
          ? "text-right"
          : ""
      }`}
    >
      {children}
    </th>
  );
}

function Cell({
  children,
  align = "left",
  strong = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  strong?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 text-sm ${
        strong
          ? "font-semibold text-zinc-900"
          : "text-zinc-600"
      } ${
        align === "right"
          ? "text-right"
          : ""
      }`}
    >
      {children}
    </td>
  );
}

function Message({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-28 place-items-center p-6 text-sm text-zinc-500">
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "text-base font-semibold text-zinc-900"
            : "text-sm text-zinc-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-bold text-zinc-900"
            : "text-sm font-semibold text-zinc-900"
        }
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function getCustomerName(
  repairOrder: RepairOrder,
): string {
  if (
    repairOrder.customer.companyName
  ) {
    return repairOrder.customer
      .companyName;
  }

  return (
    [
      repairOrder.customer.firstName,
      repairOrder.customer.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Unnamed customer"
  );
}

function getVehicleName(
  repairOrder: RepairOrder,
): string {
  return [
    repairOrder.vehicle.year,
    repairOrder.vehicle.make,
    repairOrder.vehicle.model,
    repairOrder.vehicle.trim,
  ]
    .filter(Boolean)
    .join(" ");
}

function getTechnicianName(
  technician: {
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  },
): string {
  const name = [
    technician.user.firstName,
    technician.user.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    name ||
    technician.user.email
  );
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  ).format(value);
}

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}

function formatLabel(
  value: string,
): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}