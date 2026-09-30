"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { Building2, Percent } from "lucide-react";

import { toast } from "sonner";

import {
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
} from "@/store/api/organizationsApi";

//************************************************************** */

type CompanySettingsProps = {
  organizationId: string;

  permissions: string[];
};

//************************************************************** */

export function CompanySettings({
  organizationId,
  permissions,
}: CompanySettingsProps) {
  const {
    data: organization,
    isLoading,
    isError,
    refetch,
  } = useGetOrganizationQuery(organizationId);

  const [updateOrganization, { isLoading: isSaving }] =
    useUpdateOrganizationMutation();

  //************************************************************** */
  // Local Overrides
  //
  // Null means the user has not edited the field. Until then,
  // organization data remains the source of truth.

  const [taxRate, setTaxRate] = useState<string | null>(null);

  const [shopSuppliesRate, setShopSuppliesRate] = useState<string | null>(null);

  //************************************************************** */

  const canUpdate = permissions.includes("organization:update");

  //************************************************************** */
  // Loading

  if (isLoading) {
    return <SettingsState>Loading company settings...</SettingsState>;
  }

  //************************************************************** */
  // Error

  if (isError || !organization) {
    return (
      <section className="grid min-h-64 place-items-center rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <div>
          <p className="text-sm font-semibold text-red-700">
            MotoDesk could not load Company Settings.
          </p>

          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            className="mt-4 h-9 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  //************************************************************** */
  // Organization Financial Values
  //
  // At this point organization is guaranteed to exist. Resolve the
  // server values once here so event handlers do not need to access
  // a possibly undefined query result.

  const organizationTaxRate = Number(organization.taxRate ?? 0);

  const organizationShopSuppliesRate = Number(
    organization.shopSuppliesRate ?? 0,
  );

  //************************************************************** */
  // Display Values

  const displayedTaxRate = taxRate ?? String(organizationTaxRate);

  const displayedShopSuppliesRate =
    shopSuppliesRate ?? String(organizationShopSuppliesRate);

  //************************************************************** */
  // Save

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!canUpdate) {
      return;
    }

    const parsedTaxRate = Number(taxRate ?? organizationTaxRate);

    const parsedShopSuppliesRate = Number(
      shopSuppliesRate ?? organizationShopSuppliesRate,
    );

    //************************************************************** */
    // Tax Validation

    if (
      !Number.isFinite(parsedTaxRate) ||
      parsedTaxRate < 0 ||
      parsedTaxRate > 100
    ) {
      toast.error("Tax percentage must be between 0 and 100.");

      return;
    }

    //************************************************************** */
    // Shop Supplies Validation

    if (
      !Number.isFinite(parsedShopSuppliesRate) ||
      parsedShopSuppliesRate < 0 ||
      parsedShopSuppliesRate > 100
    ) {
      toast.error("Shop supplies percentage must be between 0 and 100.");

      return;
    }

    //************************************************************** */
    // Persist Company Settings

    try {
      await updateOrganization({
        organizationId,

        taxRate: parsedTaxRate,

        shopSuppliesRate: parsedShopSuppliesRate,
      }).unwrap();

      //************************************************************** */
      // Return Display Control To RTK Query
      //
      // The successful organization mutation invalidates/refetches
      // organization data. Clearing the local overrides means the
      // refreshed server values become the displayed values again.

      setTaxRate(null);

      setShopSuppliesRate(null);

      toast.success("Company settings updated");
    } catch {
      toast.error("Failed to save company settings");
    }
  }

  //************************************************************** */

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        {/* Header */}

        <div className="border-b border-zinc-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-orange-50 text-orange-600">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Company Settings
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Configure organization-wide defaults used by MotoDesk.
              </p>
            </div>
          </div>
        </div>

        {/* Repair Order Financial Defaults */}

        <div className="space-y-6 p-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Repair Order Financial Defaults
            </h3>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-500">
              These percentages are copied onto new repair orders when they are
              created. Changing these defaults does not alter existing repair
              orders.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <PercentageField
              id="company-tax-rate"
              label="Tax Percentage"
              description="Default tax rate applied to new repair orders."
              value={displayedTaxRate}
              disabled={!canUpdate || isSaving}
              onChange={setTaxRate}
            />

            <PercentageField
              id="company-shop-supplies-rate"
              label="Shop Supplies Percentage"
              description="Default shop supplies rate applied to new repair orders."
              value={displayedShopSuppliesRate}
              disabled={!canUpdate || isSaving}
              onChange={setShopSuppliesRate}
            />
          </div>

          {!canUpdate ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You do not have permission to change company settings.
            </p>
          ) : null}
        </div>

        {/* Save */}

        <div className="flex justify-end border-t border-zinc-200 bg-zinc-50/50 px-6 py-4">
          <button
            type="submit"
            disabled={!canUpdate || isSaving}
            className="h-9 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </section>
    </form>
  );
}

//************************************************************** */

function PercentageField({
  id,
  label,
  description,
  value,
  disabled,
  onChange,
}: {
  id: string;

  label: string;

  description: string;

  value: string;

  disabled: boolean;

  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-900">
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={id}
          type="number"
          min="0"
          max="100"
          step="0.01"
          inputMode="decimal"
          value={value}
          disabled={disabled}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 pr-10 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
        />

        <Percent className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      </div>

      <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
    </div>
  );
}

//************************************************************** */

function SettingsState({ children }: { children: ReactNode }) {
  return (
    <section className="grid min-h-64 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm text-zinc-500">{children}</p>
    </section>
  );
}

//************************************************************** */
