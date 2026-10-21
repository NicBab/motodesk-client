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

interface BillingPlanSelectionProps {
  plans: BillingPlanOption[];
  assignedUsers: number;
  canManageBilling: boolean;
  disabled: boolean;
  pendingPlanId: BillingPlanId | null;
  onSelectPlan: (planId: BillingPlanId) => void;
}

//************************************************************** */

function formatPrice(plan: BillingPlanOption): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 2,
  }).format(plan.unitAmount / 100);
}

//************************************************************** */

export function BillingPlanSelection({
  plans,
  assignedUsers,
  canManageBilling,
  disabled,
  pendingPlanId,
  onSelectPlan,
}: BillingPlanSelectionProps) {
  return (
    <section aria-labelledby="billing-plans-heading">
      <div className="mb-4">
        <h2
          id="billing-plans-heading"
          className="text-base font-semibold text-zinc-900"
        >
          Choose a plan
        </h2>

        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Monthly billing for your organization. Trials are available
          to eligible organizations; eligibility is confirmed at checkout.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const tooManyUsers =
            assignedUsers > plan.usersIncluded;

          const selecting = pendingPlanId === plan.id;

          const buttonDisabled =
            disabled ||
            !canManageBilling ||
            tooManyUsers ||
            pendingPlanId !== null;

          return (
            <article
              key={plan.id}
              className={[
                "flex flex-col rounded-xl border bg-white p-5 shadow-sm",
                plan.recommended
                  ? "border-orange-300 ring-1 ring-orange-100"
                  : "border-zinc-200",
              ].join(" ")}
            >
              <div className="flex min-h-6 items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-zinc-900">
                  {plan.name}
                </h3>

                {plan.recommended ? (
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                    Recommended
                  </span>
                ) : null}
              </div>

              <p className="mt-5">
                <span className="text-3xl font-bold tracking-tight text-zinc-900">
                  {formatPrice(plan)}
                </span>

                <span className="ml-1 text-sm text-zinc-500">
                  / month
                </span>
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {plan.currency.toUpperCase()} · Per organization
              </p>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-zinc-600">
                <li className="flex items-start gap-2">
                  <Users
                    className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
                    aria-hidden="true"
                  />

                  <span>
                    Up to {plan.usersIncluded} application users,
                    including the owner
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />

                  <span>
                    {plan.trialDays}-day trial for eligible organizations
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />

                  <span>
                    Payment methods and invoices managed through Stripe
                  </span>
                </li>
              </ul>

              {tooManyUsers ? (
                <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                  Your organization has {assignedUsers} assigned users.
                  Choose a plan that includes enough users.
                </p>
              ) : null}

              <button
                type="button"
                disabled={buttonDisabled}
                onClick={() => onSelectPlan(plan.id)}
                className={[
                  "mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  plan.recommended
                    ? "bg-orange-600 text-white hover:bg-orange-700"
                    : "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50",
                ].join(" ")}
              >
                {selecting ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Preparing checkout…
                  </>
                ) : (
                  `Choose ${plan.name}`
                )}
              </button>
            </article>
          );
        })}
      </div>

      {!canManageBilling ? (
        <p className="mt-4 text-sm text-zinc-500">
          Contact an organization owner or a member with billing
          management permission to select a plan.
        </p>
      ) : null}
    </section>
  );
}

//************************************************************** */