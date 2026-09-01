"use client";

import { History, ShoppingCart } from "lucide-react";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import {
  PosCart,
  type PosCartLine,
  type PosPaymentDraft,
} from "@/features/sales/components/PosCart";

import { PosCatalog } from "@/features/sales/components/PosCatalog";

import { SaleReceipt } from "@/features/sales/components/SaleReceipt";

import { SaleReturnDialog } from "@/features/sales/components/SaleReturnDialog";

import { SalesHistory } from "@/features/sales/components/SalesHistory";

import type { Sale } from "@/features/sales/sale.types";

import { useGetCustomersQuery } from "@/store/api/customersApi";

import { useGetPartsQuery } from "@/store/api/partsApi";

import {
  useCreatePosSaleMutation,
  useGetSalesQuery,
} from "@/store/api/salesApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

//************************************************************** */

type SalesTab = "new-sale" | "history";

//************************************************************** */

export default function SalesPage() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const [tab, setTab] = useState<SalesTab>("new-sale");

  const [cart, setCart] = useState<PosCartLine[]>([]);

  const [customerId, setCustomerId] = useState("");

  const [taxRate, setTaxRate] = useState("0");

  const [discountAmount, setDiscountAmount] = useState("0");

  const [discountReason, setDiscountReason] = useState("");

  const [splitPayment, setSplitPayment] = useState(false);

  const [payments, setPayments] = useState<PosPaymentDraft[]>([
    {
      method: "CASH",

      amount: "0",

      reference: "",

      remote: false,
    },
  ]);

  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const [historySearch, setHistorySearch] = useState("");

  const [returnSale, setReturnSale] = useState<Sale | null>(null);

  //************************************************************** */

  const {
    data: parts = [],
    isLoading: partsLoading,
    isError: partsError,
  } = useGetPartsQuery(
    {
      organizationId: organizationId ?? "",

      isActive: true,
    },
    {
      skip: !organizationId,
    },
  );

  const { data: customers = [] } = useGetCustomersQuery(
    {
      organizationId: organizationId ?? "",

      isActive: true,
    },
    {
      skip: !organizationId,
    },
  );

  const { data: sales = [], isFetching: salesFetching } = useGetSalesQuery(
    {
      organizationId: organizationId ?? "",

      search: historySearch.trim() || undefined,
    },
    {
      skip: !organizationId,
    },
  );

  const [createPosSale, { isLoading: processing }] = useCreatePosSaleMutation();

  //************************************************************** */

  const sellableParts = useMemo(
    () => parts.filter((part) => Number(part.qtyOnHand) > 0),
    [parts],
  );

  const cartQuantityByPartId = useMemo(
    () => new Map(cart.map((line) => [line.partId, line.quantity])),
    [cart],
  );

  //************************************************************** */

  function handleAddPart(part: (typeof parts)[number]) {
    setCart((current) => {
      const existing = current.find((line) => line.partId === part.id);

      const maxQuantity = Number(part.qtyOnHand);

      if (existing) {
        if (existing.quantity >= maxQuantity) {
          toast.error(`${part.partNumber} has no more available stock.`);

          return current;
        }

        return current.map((line) =>
          line.partId === part.id
            ? {
                ...line,

                quantity: line.quantity + 1,
              }
            : line,
        );
      }

      return [
        ...current,

        {
          partId: part.id,

          partNumber: part.partNumber,

          description: part.description,

          quantity: 1,

          unitPrice: Number(part.sellPrice),

          maxQuantity,
        },
      ];
    });
  }

  //************************************************************** */

  function handleIncrement(partId: string) {
    setCart((current) =>
      current.map((line) =>
        line.partId === partId && line.quantity < line.maxQuantity
          ? {
              ...line,

              quantity: line.quantity + 1,
            }
          : line,
      ),
    );
  }

  //************************************************************** */

  function handleDecrement(partId: string) {
    setCart((current) =>
      current.map((line) =>
        line.partId === partId
          ? {
              ...line,

              quantity: Math.max(1, line.quantity - 1),
            }
          : line,
      ),
    );
  }

  //************************************************************** */

  function handleRemove(partId: string) {
    setCart((current) => current.filter((line) => line.partId !== partId));
  }

  //************************************************************** */

  function handleSplitPaymentChange(split: boolean) {
    setSplitPayment(split);

    if (split) {
      setPayments([
        {
          method: "CASH",

          amount: "0",

          reference: "",

          remote: false,
        },

        {
          method: "CREDIT_CARD",

          amount: "0",

          reference: "",

          remote: false,
        },
      ]);

      return;
    }

    setPayments([
      {
        method: payments[0]?.method ?? "CASH",

        amount: payments[0]?.amount ?? "0",

        reference: payments[0]?.reference ?? "",

        remote: payments[0]?.remote ?? false,
      },
    ]);
  }

  //************************************************************** */

  function handlePaymentChange(index: number, payment: PosPaymentDraft) {
    setPayments((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? payment : item)),
    );
  }

  //************************************************************** */

  async function handleCheckout() {
    if (!organizationId) {
      toast.error("No organization is currently selected.");

      return;
    }

    if (cart.length === 0) {
      toast.error("Add at least one part to the sale.");

      return;
    }

    const selectedCustomer = customers.find(
      (customer) => customer.id === customerId,
    );

    const subtotal = money(
      cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
    );

    const discount = Math.min(
      Math.max(numberValue(discountAmount), 0),
      subtotal,
    );

    const taxableSubtotal = money(Math.max(subtotal - discount, 0));

    const effectiveTaxRate = selectedCustomer?.taxExempt
      ? 0
      : Math.max(numberValue(taxRate), 0);

    const taxAmount = money(taxableSubtotal * (effectiveTaxRate / 100));

    const total = money(taxableSubtotal + taxAmount);

    const normalizedPayments = payments.map((payment) => ({
      ...payment,

      amount: money(numberValue(payment.amount)),
    }));

    const paymentTotal = money(
      normalizedPayments.reduce((sum, payment) => sum + payment.amount, 0),
    );

    if (paymentTotal !== total) {
      toast.error(`Payment total must equal ${formatCurrency(total)}.`);

      return;
    }

    try {
      const sale = await createPosSale({
        organizationId,

        ...(customerId
          ? {
              customerId,
            }
          : {}),

        taxRate: effectiveTaxRate,

        discountAmount: discount,

        ...(discountReason.trim()
          ? {
              discountReason: discountReason.trim(),
            }
          : {}),

        lines: cart.map((line) => ({
          partId: line.partId,

          quantity: line.quantity,

          unitPrice: line.unitPrice,
        })),

        payments: normalizedPayments.map((payment) => ({
          method: payment.method,

          amount: payment.amount,

          ...(payment.reference.trim()
            ? {
                reference: payment.reference.trim(),
              }
            : {}),

          remote: payment.remote,
        })),
      }).unwrap();

      setCompletedSale(sale);

      setCart([]);

      setCustomerId("");

      setDiscountAmount("0");

      setDiscountReason("");

      setSplitPayment(false);

      setPayments([
        {
          method: "CASH",

          amount: "0",

          reference: "",

          remote: false,
        },
      ]);

      toast.success(`Sale #${sale.saleNumber} completed.`);
    } catch {
      toast.error("MotoDesk could not complete the sale.");
    }
  }

  //************************************************************** */

  if (completedSale) {
    return (
      <>
        <SaleReceipt
          sale={completedSale}
          onReturn={completedSale.type === "POS" ? setReturnSale : undefined}
          onClose={() => {
            setCompletedSale(null);

            setTab("new-sale");
          }}
        />

        {organizationId && returnSale ? (
          <SaleReturnDialog
            key={returnSale.id}
            organizationId={organizationId}
            sale={returnSale}
            open
            onClose={() => setReturnSale(null)}
            onCompleted={(refund) => {
              setReturnSale(null);

              setCompletedSale(refund);
            }}
          />
        ) : null}
      </>
    );
  }

  //************************************************************** */

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Point of Sale
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Sell parts over the counter, process payments, and review sale
            receipts.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-1">
          <TabButton
            active={tab === "new-sale"}
            icon={ShoppingCart}
            label="New Sale"
            onClick={() => setTab("new-sale")}
          />

          <TabButton
            active={tab === "history"}
            icon={History}
            label={`History (${sales.length})`}
            onClick={() => setTab("history")}
          />
        </div>
      </div>

      {tab === "new-sale" ? (
        <div className="grid min-h-[680px] gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          {partsLoading ? (
            <PanelMessage>Loading inventory...</PanelMessage>
          ) : partsError ? (
            <PanelMessage>MotoDesk could not load POS inventory.</PanelMessage>
          ) : (
            <PosCatalog
              parts={sellableParts}
              cartQuantityByPartId={cartQuantityByPartId}
              onAdd={handleAddPart}
            />
          )}

          <PosCart
            cart={cart}
            customers={customers}
            customerId={customerId}
            taxRate={taxRate}
            discountAmount={discountAmount}
            discountReason={discountReason}
            splitPayment={splitPayment}
            payments={payments}
            processing={processing}
            onCustomerChange={setCustomerId}
            onTaxRateChange={setTaxRate}
            onDiscountAmountChange={setDiscountAmount}
            onDiscountReasonChange={setDiscountReason}
            onSplitPaymentChange={handleSplitPaymentChange}
            onPaymentChange={handlePaymentChange}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
            onCheckout={() => void handleCheckout()}
          />
        </div>
      ) : (
        <>
          {salesFetching ? (
            <p className="text-xs text-zinc-400">Updating sales...</p>
          ) : null}

          <SalesHistory
            sales={sales}
            search={historySearch}
            onSearchChange={setHistorySearch}
            onView={setCompletedSale}
            onReturn={setReturnSale}
          />

          {organizationId && returnSale ? (
            <SaleReturnDialog
              key={returnSale.id}
              organizationId={organizationId}
              sale={returnSale}
              open
              onClose={() => setReturnSale(null)}
              onCompleted={(refund) => {
                setReturnSale(null);

                setCompletedSale(refund);
              }}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

//************************************************************** */

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;

  icon: typeof ShoppingCart;

  label: string;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
        active ? "bg-orange-500 text-white" : "text-zinc-600 hover:bg-zinc-50"
      }`}
    >
      <Icon className="h-4 w-4" />

      {label}
    </button>
  );
}

//************************************************************** */

function PanelMessage({ children }: { children: React.ReactNode }) {
  return (
    <section className="grid min-h-64 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
      {children}
    </section>
  );
}

//************************************************************** */

function numberValue(value: string): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

//************************************************************** */

function money(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

//************************************************************** */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",

    currency: "USD",
  }).format(value);
}

//************************************************************** */
