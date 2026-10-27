import {
  Check,
  Loader2,
  Users,
} from "lucide-react";

import type {
  BillingPlanId,
  BillingPlanOption,
} from "../billing.types";

//************************************************************** */

interface BillingPlanChangeSelectionProps {
  plans: BillingPlanOption[];
  currentPlanId: BillingPlanId;
  currentAdditionalUserQuantity: number;
  assignedUsers: number;
  additionalUserQuantity: string;
  canManageBilling: boolean;
  disabled: boolean;
  pendingPlanId: BillingPlanId | null;
  onAdditionalUserQuantityChange: (value: string) => void;
  onSelectPlan: (planId: BillingPlanId) => void;
}

const PLAN_ORDER: Record<BillingPlanId, number> = {
  starter: 0,
  business: 1,
  pro: 2,
};

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

//************************************************************** */

export function BillingPlanChangeSelection({
  plans,
  currentPlanId,
  currentAdditionalUserQuantity,
  assignedUsers,
  additionalUserQuantity,
  canManageBilling,
  disabled,
  pendingPlanId,
  onAdditionalUserQuantityChange,
  onSelectPlan,
}: BillingPlanChangeSelectionProps) {
  const parsedQuantity = Number(additionalUserQuantity);

  const validQuantity =
    /^\d+$/.test(additionalUserQuantity) &&
    Number.isSafeInteger(parsedQuantity) &&
    parsedQuantity >= 0 &&
    parsedQuantity <= 2_147_483_647;

  const controlsDisabled =
    disabled ||
    !canManageBilling ||
    pendingPlanId !== null;

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-900">
          Compare plans
        </h3>

        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Review pricing before changing your existing subscription.
          Your organization’s data stays in place.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isPro = plan.id === "pro";

          const quantity = isPro
            ? isCurrent
              ? currentAdditionalUserQuantity
              : validQuantity
                ? parsedQuantity
                : 0
            : 0;

          const additionalUnitAmount =
            plan.additionalUserPricing?.unitAmount ?? 0;

          const monthlyAmount =
            plan.unitAmount + quantity * additionalUnitAmount;

          const userLimit = plan.usersIncluded + quantity;

          const invalidProQuantity =
            isPro &&
            !isCurrent &&
            (
              !validQuantity ||
              !Number.isSafeInteger(monthlyAmount) ||
              (
                parsedQuantity > 0 &&
                !plan.additionalUserPricing
              )
            );

          const tooManyUsers = assignedUsers > userLimit;

          const selecting = pendingPlanId === plan.id;

          const upgrading =
            PLAN_ORDER[plan.id] > PLAN_ORDER[currentPlanId];

          const buttonDisabled =
            controlsDisabled ||
            isCurrent ||
            invalidProQuantity ||
            tooManyUsers;

          return (
            <article
              key={plan.id}
              className={[
                "flex flex-col rounded-xl border bg-white p-5 shadow-sm",
                isCurrent
                  ? "border-orange-300 ring-1 ring-orange-100"
                  : "border-zinc-200",
              ].join(" ")}
            >
              <div className="flex min-h-6 items-center justify-between gap-2">
                <h4 className="text-base font-semibold text-zinc-900">
                  {plan.name}
                </h4>

                {isCurrent ? (
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                    Current plan
                  </span>
                ) : plan.recommended ? (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                    Recommended
                  </span>
                ) : null}
              </div>

              <p className="mt-5">
                <span className="text-3xl font-bold tracking-tight text-zinc-900">
                  {invalidProQuantity
                    ? "—"
                    : money(monthlyAmount, plan.currency)}
                </span>

                <span className="ml-1 text-sm text-zinc-500">
                  / month
                </span>
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {plan.currency.toUpperCase()} · Before taxes,
                discounts, and credits.
              </p>

              <ul className="mt-5 space-y-3 text-sm text-zinc-600">
                <li className="flex items-start gap-2">
                  <Users
                    className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
                    aria-hidden="true"
                  />

                  <span>
                    {invalidProQuantity
                      ? `${plan.usersIncluded} included users`
                      : `${userLimit} application users`}
                    , including the owner.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />

                  <span>
                    {money(plan.unitAmount, plan.currency)} base
                    monthly price.
                  </span>
                </li>
              </ul>

              {isPro && !isCurrent ? (
                <div className="mt-5">
                  <label
                    htmlFor="billing-plan-pro-additional-users"
                    className="block text-sm font-medium text-zinc-700"
                  >
                    Additional users
                  </label>

                  <input
                    id="billing-plan-pro-additional-users"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={additionalUserQuantity}
                    disabled={controlsDisabled}
                    aria-invalid={invalidProQuantity}
                    aria-describedby="billing-plan-pro-additional-users-help"
                    onChange={(event) => {
                      onAdditionalUserQuantityChange(event.target.value);
                    }}
                    className="mt-2 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <p
                    id="billing-plan-pro-additional-users-help"
                    className="mt-2 text-xs leading-5 text-zinc-500"
                  >
                    {plan.additionalUserPricing
                      ? `${money(
                          additionalUnitAmount,
                          plan.currency,
                        )} per month for each user beyond the ten included. Enter 0 for ten users.`
                      : "Additional-user pricing is unavailable."}
                  </p>

                  {invalidProQuantity ? (
                    <p className="mt-2 text-xs text-red-700">
                      Enter a valid whole number of additional users.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {isCurrent && isPro && quantity > 0 ? (
                <p className="mt-4 text-xs leading-5 text-zinc-500">
                  Includes {quantity} additional users. Use the
                  additional-user controls to adjust this quantity.
                </p>
              ) : null}

              <div className="flex-1" />

              {!isCurrent && tooManyUsers && !invalidProQuantity ? (
                <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                  You have {assignedUsers} active users. This selection
                  supports {userLimit}. Remove users or select more
                  capacity before continuing.
                </p>
              ) : null}

              <button
                type="button"
                disabled={buttonDisabled}
                onClick={() => onSelectPlan(plan.id)}
                className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {selecting ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Preparing preview…
                  </>
                ) : isCurrent ? (
                  "Current plan"
                ) : (
                  `${upgrading ? "Upgrade" : "Downgrade"} to ${plan.name}`
                )}
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-zinc-500">
        Pending invitations also reserve user capacity. MotoDesk checks
        the complete usage again before confirming a plan change.
        Changing plans does not start a new trial.
      </p>

      {!canManageBilling ? (
        <p className="mt-3 text-sm text-zinc-500">
          Contact an organization owner or a member with billing
          management permission to change plans.
        </p>
      ) : null}
    </div>
  );
}

//************************************************************** */