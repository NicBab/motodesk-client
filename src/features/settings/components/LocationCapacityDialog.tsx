
"use client";

import { useState } from "react";

import {
  Building2,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

import {
  useCreateBillingLocationCapacityPreviewMutation,
  useConfirmBillingLocationCapacityChangeMutation,
  type BillingLocationCapacityPreview,
} from "@/store/api/billingLocationCapacityApi";

//************************************************************** */

type LocationCapacityDialogProps = {
  organizationId: string;
  currentAdditionalLocationQuantity: number;
  onClose: () => void;
  onApplied: () => void;
};

//************************************************************** */

type PurchaseStatus =
  | "SELECT"
  | "REVIEW"
  | "APPLIED"
  | "PENDING_PAYMENT"
  | "UNCONFIRMED";

//************************************************************** */

function formatMoney(
  amount: number,
  currency: string,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

//************************************************************** */

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error
  ) {
    const data = error.data;

    if (typeof data === "object" && data !== null) {
      if (
        "message" in data &&
        typeof data.message === "string"
      ) {
        return data.message;
      }

      if (
        "error" in data &&
        typeof data.error === "object" &&
        data.error !== null &&
        "message" in data.error &&
        typeof data.error.message === "string"
      ) {
        return data.error.message;
      }
    }
  }

  return "MotoDesk could not complete the billing request.";
}

//************************************************************** */

export function LocationCapacityDialog({
  organizationId,
  currentAdditionalLocationQuantity,
  onClose,
  onApplied,
}: LocationCapacityDialogProps) {
  const [quantity, setQuantity] = useState("1");

  const [status, setStatus] =
    useState<PurchaseStatus>("SELECT");

  const [preview, setPreview] =
    useState<BillingLocationCapacityPreview | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [acknowledged, setAcknowledged] =
    useState(false);

  const [createPreview, { isLoading: isPreviewing }] =
    useCreateBillingLocationCapacityPreviewMutation();

  const [confirmChange, { isLoading: isConfirming }] =
    useConfirmBillingLocationCapacityChangeMutation();

  const isBusy = isPreviewing || isConfirming;

  const requestedQuantity = Number(quantity);

  const targetQuantity =
    currentAdditionalLocationQuantity + requestedQuantity;

  const validQuantity =
    Number.isSafeInteger(requestedQuantity) &&
    requestedQuantity > 0 &&
    Number.isSafeInteger(targetQuantity) &&
    targetQuantity <= 2_147_483_647;

  //************************************************************** */

  async function handlePreview() {
    if (isBusy || !validQuantity) return;

    setError(null);
    setPreview(null);
    setAcknowledged(false);

    try {
      const result = await createPreview({
        organizationId,
        additionalLocationQuantity: targetQuantity,
      }).unwrap();

      if (
        result.currentAdditionalLocationQuantity !==
        currentAdditionalLocationQuantity
      ) {
        setError(
          "Your subscription capacity has changed. Close this dialog and refresh your billing information.",
        );

        return;
      }

      if (
        result.targetAdditionalLocationQuantity !==
        targetQuantity
      ) {
        setError(
          "The returned quote does not match the requested capacity.",
        );

        return;
      }

      setPreview(result);
      setStatus("REVIEW");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  //************************************************************** */

  async function handleConfirm() {
    if (!preview || !acknowledged || isBusy) return;

    setError(null);

    if (
      new Date(preview.expiresAt).getTime() <= Date.now()
    ) {
      setPreview(null);
      setAcknowledged(false);
      setStatus("SELECT");

      setError(
        "Your billing quote has expired. Request a new quote.",
      );

      return;
    }

    try {
      const result = await confirmChange({
        organizationId,
        changeId: preview.changeId,
      }).unwrap();

      if (result.status === "APPLIED") {
        setStatus("APPLIED");
        return;
      }

      if (result.status === "PENDING_PAYMENT") {
        setStatus("PENDING_PAYMENT");
        return;
      }

      setStatus("UNCONFIRMED");
    } catch (requestError) {
      setError(getErrorMessage(requestError));

      // A failed HTTP response does not necessarily mean
      // Stripe failed to process the subscription change.
      // Do not automatically submit another purchase.

      setStatus("UNCONFIRMED");
    }
  }

  //************************************************************** */

  function handleBack() {
    if (isBusy) return;

    setPreview(null);
    setAcknowledged(false);
    setError(null);
    setStatus("SELECT");
  }

  //************************************************************** */

  function handleClose() {
    if (isBusy) return;

    if (status === "APPLIED") {
      onApplied();
    }

    onClose();
  }

  //************************************************************** */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-capacity-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-background shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <h2
                id="location-capacity-title"
                className="text-lg font-semibold"
              >
                Additional Shop Locations
              </h2>

              <p className="text-sm text-muted-foreground">
                MotoDesk Pro subscription
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close"
            disabled={isBusy}
            onClick={handleClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          {status === "SELECT" ? (
            <>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  Current Purchased Capacity
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {2 + currentAdditionalLocationQuantity}
                  {" shops"}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Includes two shops with your Pro plan.
                </p>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium">
                  Number of Additional Shops to Purchase
                </span>

                <input
                  type="number"
                  min={1}
                  step={1}
                  value={quantity}
                  disabled={isBusy}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-orange-500"
                />
              </label>

              {validQuantity ? (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <span className="text-sm text-muted-foreground">
                    Requested Shop Capacity
                  </span>

                  <span className="font-semibold">
                    {2 + targetQuantity} shops
                  </span>
                </div>
              ) : null}

              <p className="text-sm text-muted-foreground">
                Review your updated subscription pricing
                and Stripe invoice estimate before
                authorizing any payment.
              </p>
            </>
          ) : null}

          {status === "REVIEW" && preview ? (
            <>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  New Monthly Subscription
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  {formatMoney(
                    preview.monthlyTotalAmount,
                    preview.currency,
                  )}

                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Recurring subscription price before
                  taxes, discounts and credits.
                </p>
              </div>

              <div className="divide-y rounded-lg border px-4">
                <SummaryRow
                  label="Current shop limit"
                  value={String(preview.currentLocationLimit)}
                />

                <SummaryRow
                  label="New shop limit"
                  value={String(preview.targetLocationLimit)}
                />

                <SummaryRow
                  label="Additional shops purchased"
                  value={String(
                    preview.targetAdditionalLocationQuantity -
                      preview.currentAdditionalLocationQuantity,
                  )}
                />

                <SummaryRow
                  label="Monthly price per additional shop"
                  value={formatMoney(
                    preview.additionalLocationUnitAmount,
                    preview.currency,
                  )}
                />

                <SummaryRow
                  label="Estimated next invoice"
                  value={formatMoney(
                    preview.estimatedInvoiceAmountDue,
                    preview.currency,
                  )}
                />
              </div>

              {preview.trialEndsAt ? (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm">
                  Trial ends{" "}
                  {new Date(
                    preview.trialEndsAt,
                  ).toLocaleDateString()}.
                  Your subscription remains subject to
                  the existing trial and billing terms.
                </div>
              ) : null}

              <p className="text-xs text-muted-foreground">
                The invoice estimate is provided by Stripe
                and may include prorations, taxes and
                credits. It is not a guarantee of the
                exact amount charged immediately.
              </p>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  disabled={isBusy}
                  onChange={(event) =>
                    setAcknowledged(event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
                />

                <span className="text-sm">
                  I authorize this subscription change
                  and applicable Stripe charges, including
                  the updated recurring monthly cost.
                </span>
              </label>
            </>
          ) : null}

          {status === "APPLIED" ? (
            <div className="space-y-3 py-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />

              <h3 className="text-lg font-semibold">
                Shop Capacity Updated
              </h3>

              <p className="text-sm text-muted-foreground">
                Your subscription now supports{" "}
                {preview?.targetLocationLimit} shops.
                You can create additional locations from
                your location settings.
              </p>
            </div>
          ) : null}

          {status === "PENDING_PAYMENT" ? (
            <div className="space-y-3 py-6 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />

              <h3 className="text-lg font-semibold">
                Payment Pending
              </h3>

              <p className="text-sm text-muted-foreground">
                Stripe has not yet confirmed payment.
                Additional shop capacity will become
                available once payment is verified.
              </p>

              <p className="text-sm text-muted-foreground">
                Review your subscription in Billing.
                Do not submit another purchase while
                this payment is pending.
              </p>
            </div>
          ) : null}

          {status === "UNCONFIRMED" ? (
            <div className="space-y-3 py-6 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />

              <h3 className="text-lg font-semibold">
                Purchase Status Unconfirmed
              </h3>

              <p className="text-sm text-muted-foreground">
                MotoDesk could not confirm the final
                subscription status. Review your billing
                information before attempting another
                purchase.
              </p>
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{error}</span>
            </div>
          ) : null}
        </div>

        <footer className="flex justify-end gap-2 border-t p-5">
          {status === "SELECT" ? (
            <>
              <button
                type="button"
                disabled={isBusy}
                onClick={handleClose}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isBusy || !validQuantity}
                onClick={() => void handlePreview()}
                className={primaryButton}
              >
                {isPreviewing
                  ? "Calculating..."
                  : "Review Pricing"}
              </button>
            </>
          ) : null}

          {status === "REVIEW" ? (
            <>
              <button
                type="button"
                disabled={isBusy}
                onClick={handleBack}
                className={secondaryButton}
              >
                Back
              </button>

              <button
                type="button"
                disabled={
                  isBusy ||
                  !acknowledged ||
                  !preview
                }
                onClick={() => void handleConfirm()}
                className={primaryButton}
              >
                <CreditCard className="h-4 w-4" />

                {isConfirming
                  ? "Processing..."
                  : "Confirm Purchase"}
              </button>
            </>
          ) : null}

          {status === "APPLIED" ||
          status === "PENDING_PAYMENT" ||
          status === "UNCONFIRMED" ? (
            <button
              type="button"
              onClick={handleClose}
              className={primaryButton}
            >
              Done
            </button>
          ) : null}
        </footer>
      </section>
    </div>
  );
}

//************************************************************** */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="text-right text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}

//************************************************************** */

const primaryButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";

//************************************************************** */
