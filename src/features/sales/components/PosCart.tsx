"use client";

import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import type { Customer } from "@/features/customers/customer.types";

import type {
  SaleTenderMethod,
} from "../sale.types";

//************************************************************** */

export type PosCartLine = {
  partId: string;

  partNumber: string;

  description: string;

  quantity: number;

  unitPrice: number;

  maxQuantity: number;
};

//************************************************************** */

export type PosPaymentDraft = {
  method: SaleTenderMethod;

  amount: string;

  reference: string;

  remote: boolean;
};

//************************************************************** */

type Props = {
  cart: PosCartLine[];

  customers: Customer[];

  customerId: string;

  taxRate: string;

  discountAmount: string;

  discountReason: string;

  splitPayment: boolean;

  payments: PosPaymentDraft[];

  processing: boolean;

  onCustomerChange: (
    customerId: string,
  ) => void;

  onTaxRateChange: (
    value: string,
  ) => void;

  onDiscountAmountChange: (
    value: string,
  ) => void;

  onDiscountReasonChange: (
    value: string,
  ) => void;

  onSplitPaymentChange: (
    split: boolean,
  ) => void;

  onPaymentChange: (
    index: number,
    payment: PosPaymentDraft,
  ) => void;

  onIncrement: (
    partId: string,
  ) => void;

  onDecrement: (
    partId: string,
  ) => void;

  onRemove: (
    partId: string,
  ) => void;

  onCheckout: () => void;
};

//************************************************************** */

const tenderMethods: Array<{
  value: SaleTenderMethod;

  label: string;
}> = [
  {
    value: "CASH",
    label: "Cash",
  },
  {
    value: "CREDIT_CARD",
    label: "Credit Card",
  },
  {
    value: "DEBIT_CARD",
    label: "Debit Card",
  },
  {
    value: "CHECK",
    label: "Check",
  },
  {
    value: "ACH",
    label: "ACH",
  },
  {
    value: "EXTERNAL_TERMINAL",
    label: "External Terminal",
  },
];

//************************************************************** */

export function PosCart({
  cart,
  customers,
  customerId,
  taxRate,
  discountAmount,
  discountReason,
  splitPayment,
  payments,
  processing,
  onCustomerChange,
  onTaxRateChange,
  onDiscountAmountChange,
  onDiscountReasonChange,
  onSplitPaymentChange,
  onPaymentChange,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
}: Props) {
  const selectedCustomer =
    customers.find(
      (customer) =>
        customer.id ===
        customerId,
    ) ?? null;

  const subtotal =
    money(
      cart.reduce(
        (sum, line) =>
          sum +
          line.quantity *
            line.unitPrice,
        0,
      ),
    );

  const discount =
    Math.min(
      Math.max(
        numberValue(
          discountAmount,
        ),
        0,
      ),
      subtotal,
    );

  const taxableSubtotal =
    money(
      Math.max(
        subtotal -
          discount,
        0,
      ),
    );

  const effectiveTaxRate =
    selectedCustomer
      ?.taxExempt
      ? 0
      : Math.max(
          numberValue(
            taxRate,
          ),
          0,
        );

  const tax =
    money(
      taxableSubtotal *
        (effectiveTaxRate /
          100),
    );

  const total =
    money(
      taxableSubtotal +
        tax,
    );

  const paymentTotal =
    money(
      payments.reduce(
        (sum, payment) =>
          sum +
          numberValue(
            payment.amount,
          ),
        0,
      ),
    );

  //************************************************************** */

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
        <ShoppingCart className="h-4 w-4 text-orange-500" />

        <h2 className="font-semibold text-zinc-900">
          Current Sale
        </h2>

        <span className="ml-auto rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
          {cart.length}
        </span>
      </div>

      <div className="border-b border-zinc-200 p-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-zinc-700">
            Customer
          </span>

          <select
            value={customerId}
            onChange={(event) =>
              onCustomerChange(
                event.target.value,
              )
            }
            className={inputClassName}
          >
            <option value="">
              Walk-in
            </option>

            {customers.map(
              (customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customerName(
                    customer,
                  )}
                  {customer.taxExempt
                    ? " · Tax Exempt"
                    : ""}
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="grid min-h-56 place-items-center p-6 text-center">
            <div>
              <ShoppingCart className="mx-auto h-8 w-8 text-zinc-300" />

              <p className="mt-3 text-sm font-semibold text-zinc-700">
                Cart is empty
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Add an in-stock part from the catalog.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {cart.map(
              (line) => (
                <div
                  key={line.partId}
                  className="p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-900">
                        {
                          line.description
                        }
                      </p>

                      <p className="mt-0.5 font-mono text-xs text-zinc-500">
                        {
                          line.partNumber
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onRemove(
                          line.partId,
                        )
                      }
                      className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-lg border border-zinc-200">
                      <button
                        type="button"
                        onClick={() =>
                          onDecrement(
                            line.partId,
                          )
                        }
                        className="grid h-8 w-8 place-items-center text-zinc-600 hover:bg-zinc-50"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <span className="min-w-10 px-2 text-center text-sm font-semibold text-zinc-800">
                        {
                          line.quantity
                        }
                      </span>

                      <button
                        type="button"
                        disabled={
                          line.quantity >=
                          line.maxQuantity
                        }
                        onClick={() =>
                          onIncrement(
                            line.partId,
                          )
                        }
                        className="grid h-8 w-8 place-items-center text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-zinc-500">
                        {formatCurrency(
                          line.unitPrice,
                        )}{" "}
                        each
                      </p>

                      <p className="font-bold text-zinc-900">
                        {formatCurrency(
                          line.quantity *
                            line.unitPrice,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 border-t border-zinc-200 bg-zinc-50 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-zinc-700">
              Tax %
            </span>

            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={
                selectedCustomer
                  ?.taxExempt
                  ? "0"
                  : taxRate
              }
              disabled={
                Boolean(
                  selectedCustomer
                    ?.taxExempt,
                )
              }
              onChange={(event) =>
                onTaxRateChange(
                  event.target.value,
                )
              }
              className={inputClassName}
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-semibold text-zinc-700">
              Discount
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                discountAmount
              }
              onChange={(event) =>
                onDiscountAmountChange(
                  event.target.value,
                )
              }
              className={inputClassName}
            />
          </label>
        </div>

        {numberValue(
          discountAmount,
        ) > 0 ? (
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-zinc-700">
              Discount reason
            </span>

            <input
              value={
                discountReason
              }
              onChange={(event) =>
                onDiscountReasonChange(
                  event.target.value,
                )
              }
              placeholder="Optional reason"
              className={inputClassName}
            />
          </label>
        ) : null}

        <div className="space-y-1.5 rounded-lg border border-zinc-200 bg-white p-3">
          <SummaryRow
            label="Subtotal"
            value={subtotal}
          />

          <SummaryRow
            label="Discount"
            value={-discount}
          />

          <SummaryRow
            label={`Tax (${effectiveTaxRate.toFixed(
              2,
            )}%)`}
            value={tax}
          />

          <div className="border-t border-zinc-200 pt-2">
            <SummaryRow
              label="Total"
              value={total}
              strong
            />
          </div>
        </div>

        <label className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5">
          <span className="text-sm font-semibold text-zinc-700">
            Split payment
          </span>

          <input
            type="checkbox"
            checked={splitPayment}
            onChange={(event) =>
              onSplitPaymentChange(
                event.target.checked,
              )
            }
            className="h-4 w-4 rounded border-zinc-300"
          />
        </label>

        <div className="space-y-3">
          {payments.map(
            (payment, index) => (
              <div
                key={index}
                className="rounded-lg border border-zinc-200 bg-white p-3"
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    value={
                      payment.method
                    }
                    onChange={(event) =>
                      onPaymentChange(
                        index,
                        {
                          ...payment,

                          method:
                            event.target
                              .value as SaleTenderMethod,
                        },
                      )
                    }
                    className={inputClassName}
                  >
                    {tenderMethods.map(
                      (method) => (
                        <option
                          key={
                            method.value
                          }
                          value={
                            method.value
                          }
                        >
                          {
                            method.label
                          }
                        </option>
                      ),
                    )}
                  </select>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      payment.amount
                    }
                    onChange={(event) =>
                      onPaymentChange(
                        index,
                        {
                          ...payment,

                          amount:
                            event.target
                              .value,
                        },
                      )
                    }
                    placeholder="Amount"
                    className={inputClassName}
                  />
                </div>

                <input
                  value={
                    payment.reference
                  }
                  onChange={(event) =>
                    onPaymentChange(
                      index,
                      {
                        ...payment,

                        reference:
                          event.target
                            .value,
                      },
                    )
                  }
                  placeholder="Reference / auth # (optional)"
                  className={`mt-2 ${inputClassName}`}
                />
              </div>
            ),
          )}
        </div>

        {splitPayment ? (
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              Payment total
            </span>

            <span
              className={
                Math.abs(
                  paymentTotal -
                    total,
                ) < 0.001
                  ? "font-bold text-emerald-600"
                  : "font-bold text-red-600"
              }
            >
              {formatCurrency(
                paymentTotal,
              )}
            </span>
          </div>
        ) : null}

        <button
          type="button"
          disabled={
            processing ||
            cart.length === 0 ||
            total < 0
          }
          onClick={onCheckout}
          className="h-11 w-full rounded-lg bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing
            ? "Processing..."
            : `Checkout ${formatCurrency(
                total,
              )}`}
        </button>
      </div>
    </section>
  );
}

//************************************************************** */

function customerName(
  customer: Customer,
): string {
  if (
    customer.companyName
  ) {
    return customer.companyName;
  }

  return [
    customer.firstName,
    customer.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Customer";
}

//************************************************************** */

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
            ? "text-sm font-bold text-zinc-900"
            : "text-xs text-zinc-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-base font-bold text-zinc-900"
            : "text-sm font-semibold text-zinc-800"
        }
      >
        {formatCurrency(
          value,
        )}
      </span>
    </div>
  );
}

//************************************************************** */

function numberValue(
  value: string,
): number {
  const parsed =
    Number(value);

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

//************************************************************** */

function money(
  value: number,
): number {
  return Math.round(
    (value +
      Number.EPSILON) *
      100,
  ) / 100;
}

//************************************************************** */

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        "USD",
    },
  ).format(value);
}

//************************************************************** */

const inputClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-zinc-100 disabled:text-zinc-500";

//************************************************************** */
