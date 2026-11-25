
"use client";

import { useState, type FormEvent } from "react";

import {
  MapPin,
  Plus,
  Users,
  Building2,
  RefreshCw,
} from "lucide-react";

import { toast } from "sonner";
import Link from "next/link";
import { useGetBillingOverviewQuery, useGetSubscriptionAccessQuery } from "@/store/api/billingApi";
import { LocationCapacityDialog } from "./LocationCapacityDialog";

import {
  useGetLocationsQuery,
  useGetLocationEmployeesQuery,
  useCreateLocationMutation,
  useAssignLocationEmployeesMutation,
  type ShopLocationSummary,
  type LocationEmployee,
} from "@/store/api/locationsApi";

//************************************************************** */

type SettingsLocationsProps = {
  organizationId: string;
  isOwner: boolean;
};

//************************************************************** */

const initialForm = {
  name: "",
  code: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  timezone: "America/Chicago",
};

type LocationForm = typeof initialForm;

//************************************************************** */

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
];

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

  return "MotoDesk could not complete the request.";
}

//************************************************************** */

export function SettingsLocations(
  props: SettingsLocationsProps,
) {
  return (
    <LocationManagement
      key={props.organizationId}
      {...props}
    />
  );
}

//************************************************************** */

function LocationManagement({
  organizationId,
  isOwner,
}: SettingsLocationsProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const billingQuery = useGetBillingOverviewQuery(organizationId, {
    skip: !organizationId || !isOwner,
    refetchOnMountOrArgChange: true,
  });
  const accessQuery = useGetSubscriptionAccessQuery(organizationId, {
    skip: !organizationId || !isOwner,
    refetchOnMountOrArgChange: true,
  });
  const billing = billingQuery.currentData;
  const billingReady = !!billing && !billingQuery.isFetching && !billingQuery.isError;
  const fullAccess = accessQuery.currentData?.accessMode === "FULL" && !accessQuery.isError && !accessQuery.isFetching;
  const pending = !!(billing?.locationCapacityChangePending || billing?.pendingChange || billing?.checkoutPending);
  const canCreate = isOwner && billingReady && fullAccess && !pending &&
    (billing.billingExempt || (billing.usage.availableLocations ?? 0) > 0);
  const canPurchase = isOwner && billingReady && fullAccess && !pending &&
    !billing.billingExempt && billing.subscription.plan?.id === "pro" &&
    !!billing.subscription.plan.additionalLocationPricing;

  const [selectedLocationId, setSelectedLocationId] =
    useState<string | null>(null);

  const {
    currentData: locations,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetLocationsQuery(organizationId, {
    skip: !organizationId,
    refetchOnMountOrArgChange: true,
  });

  const selectedLocation = locations?.find(
    (location) => location.id === selectedLocationId,
  );

  const activeCount =
    locations?.filter(
      (location) => location.status === "ACTIVE",
    ).length ?? 0;

  //************************************************************** */

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Shop Locations
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your organization&apos;s shops and
            employee location assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isFetching || billingQuery.isFetching || accessQuery.isFetching}
            onClick={() => {
              void refetch();
              if (isOwner) {
                void billingQuery.refetch();
                void accessQuery.refetch();
              }
            }}
            className={secondaryButton}
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isFetching ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>

          {canCreate ? (
            <button
              type="button"
              onClick={() => {
                setSelectedLocationId(null);
                setShowCreate((value) => !value);
              }}
              className={primaryButton}
            >
              <Plus className="h-4 w-4" />

              Add Location
            </button>
          ) : null}
        </div>
      </div>

      {isOwner ? (
        <section className="space-y-3 rounded-xl border bg-card p-5">
          <h3 className="font-semibold">Subscription Capacity</h3>
          {!billingReady || accessQuery.isFetching ? (
            <p className="text-sm text-muted-foreground">
              {billingQuery.isError || accessQuery.isError
                ? "Unable to verify subscription capacity. Refresh to try again."
                : "Checking subscription capacity..."}
            </p>
          ) : billing ? (
            <>
              <p className="text-lg font-semibold">
                {billing.usage.activeLocations} / {billing.billingExempt ? "Unlimited" : billing.usage.locationLimit ?? "Unavailable"} shops
              </p>
              <p className="text-sm text-muted-foreground">
                {billing.billingExempt ? "Billing-exempt organization" : billing.subscription.plan?.name ?? "No subscription plan"}
              </p>
              {pending ? (
                <p className="text-sm text-amber-600">A billing change is pending. Refresh after it is resolved.</p>
              ) : !fullAccess ? (
                <p className="text-sm text-muted-foreground">Subscription access must be restored before adding shops.</p>
              ) : !canCreate && !canPurchase && !billing.billingExempt ? (
                <p className="text-sm text-muted-foreground">Upgrade your subscription to add more shops.</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {canPurchase ? (
                  <button type="button" className={primaryButton} onClick={() => {
                    setShowCreate(false);
                    setShowPurchase(true);
                  }}>
                    Purchase Additional Capacity
                  </button>
                ) : null}
                {!billing.billingExempt ? (
                  <Link href="/settings?tab=billing" className={secondaryButton}>Manage Billing</Link>
                ) : null}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {showPurchase && billing && isOwner ? (
        <LocationCapacityDialog
          organizationId={organizationId}
          currentAdditionalLocationQuantity={billing.subscription.additionalLocationQuantity}
          onApplied={() => { void refetch(); }}
          onClose={() => {
            setShowPurchase(false);
            void billingQuery.refetch();
            void accessQuery.refetch();
          }}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Active Locations
          </div>

          <p className="mt-2 text-2xl font-semibold">
            {locations ? activeCount : "—"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Default Location
          </div>

          <p className="mt-2 text-lg font-semibold">
            {locations?.find(
              (location) => location.isDefault,
            )?.name ?? "—"}
          </p>
        </div>
      </div>

      {showCreate && canCreate ? (
        <CreateLocationForm
          organizationId={organizationId}
          onClose={() => {
            setShowCreate(false);
            void billingQuery.refetch();
          }}
        />
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          Loading shop locations...
        </div>
      ) : isError ? (
        <div className="space-y-3 rounded-xl border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Unable to load shop locations.
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            className={secondaryButton}
          >
            Try Again
          </button>
        </div>
      ) : locations?.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          No shop locations found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {locations?.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              isOwner={isOwner}
              onManage={() => {
                setShowCreate(false);
                setSelectedLocationId(location.id);
              }}
            />
          ))}
        </div>
      )}

      {selectedLocation &&
      selectedLocation.status === "ACTIVE" &&
      isOwner ? (
        <LocationAssignments
          key={selectedLocation.id}
          organizationId={organizationId}
          location={selectedLocation}
          onClose={() => setSelectedLocationId(null)}
        />
      ) : null}
    </div>
  );
}

//************************************************************** */

function LocationCard({
  location,
  isOwner,
  onManage,
}: {
  location: ShopLocationSummary;
  isOwner: boolean;
  onManage: () => void;
}) {
  const address = [
    location.addressLine1,
    location.addressLine2,
    location.city,
    location.state,
    location.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
            <Building2 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold">
              {location.name}
            </h3>

            <p className="text-xs text-muted-foreground">
              {location.code}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            location.status === "ACTIVE"
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {location.status === "ACTIVE"
            ? "Active"
            : "Archived"}
        </span>
      </div>

      {location.isDefault ? (
        <span className="mt-3 inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium">
          Default Shop
        </span>
      ) : null}

      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        {address ? <p>{address}</p> : null}

        {location.phone ? (
          <p>{location.phone}</p>
        ) : null}

        {location.email ? (
          <p>{location.email}</p>
        ) : null}

        <p>{location.timezone}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />

          {location._count.membershipLocations} assigned
        </div>

        {isOwner && location.status === "ACTIVE" ? (
          <button
            type="button"
            onClick={onManage}
            className={secondaryButton}
          >
            Manage Employees
          </button>
        ) : null}
      </div>
    </div>
  );
}

//************************************************************** */

function CreateLocationForm({
  organizationId,
  onClose,
}: {
  organizationId: string;
  onClose: () => void;
}) {
  const [form, setForm] =
    useState<LocationForm>(initialForm);

  const [error, setError] = useState<string | null>(null);

  const [createLocation, { isLoading }] =
    useCreateLocationMutation();

  function updateField(
    field: keyof LocationForm,
    value: string,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (isLoading) return;

    setError(null);

    try {
      await createLocation({
        organizationId,

        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),

        email: form.email.trim() || null,
        phone: form.phone.trim() || null,

        addressLine1:
          form.addressLine1.trim() || null,

        addressLine2:
          form.addressLine2.trim() || null,

        city: form.city.trim() || null,
        state: form.state.trim() || null,
        postalCode: form.postalCode.trim() || null,

        country: form.country.trim().toUpperCase(),

        timezone: form.timezone,
      }).unwrap();

      toast.success("Shop location created.");

      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border bg-card p-5"
    >
      <div>
        <h3 className="font-semibold">
          Create Shop Location
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Additional locations require available
          subscription capacity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <LocationField
          label="Location Name"
          value={form.name}
          onChange={(value) => updateField("name", value)}
          required
          maxLength={120}
        />

        <LocationField
          label="Location Code"
          value={form.code}
          onChange={(value) =>
            updateField("code", value.toUpperCase())
          }
          required
          maxLength={30}
          pattern="[A-Z0-9_-]{2,30}"
          placeholder="SHOP-02"
        />

        <LocationField
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
        />

        <LocationField
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(value) => updateField("phone", value)}
          maxLength={30}
        />

        <LocationField
          label="Street Address"
          value={form.addressLine1}
          onChange={(value) =>
            updateField("addressLine1", value)
          }
          maxLength={200}
        />

        <LocationField
          label="Address Line 2"
          value={form.addressLine2}
          onChange={(value) =>
            updateField("addressLine2", value)
          }
          maxLength={200}
        />

        <LocationField
          label="City"
          value={form.city}
          onChange={(value) => updateField("city", value)}
          maxLength={120}
        />

        <LocationField
          label="State"
          value={form.state}
          onChange={(value) => updateField("state", value)}
          maxLength={120}
        />

        <LocationField
          label="Postal Code"
          value={form.postalCode}
          onChange={(value) =>
            updateField("postalCode", value)
          }
          maxLength={30}
        />

        <LocationField
          label="Country Code"
          value={form.country}
          onChange={(value) =>
            updateField("country", value.toUpperCase())
          }
          required
          maxLength={2}
          pattern="[A-Z]{2}"
        />

        <label className="space-y-1.5 text-sm font-medium">
          <span>Timezone</span>

          <select
            value={form.timezone}
            onChange={(event) =>
              updateField("timezone", event.target.value)
            }
            className={inputClassName}
          >
            {timezones.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600"
        >
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 border-t pt-4">
        <button
          type="button"
          disabled={isLoading}
          onClick={onClose}
          className={secondaryButton}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className={primaryButton}
        >
          {isLoading ? "Creating..." : "Create Location"}
        </button>
      </div>
    </form>
  );
}

//************************************************************** */

function LocationAssignments({
  organizationId,
  location,
  onClose,
}: {
  organizationId: string;
  location: ShopLocationSummary;
  onClose: () => void;
}) {
  const {
    currentData: employees,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetLocationEmployeesQuery(organizationId, {
    refetchOnMountOrArgChange: true,
  });

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div>
        <h3 className="font-semibold">
          Manage Employees — {location.name}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Employees may be assigned to multiple shops
          without consuming additional user seats.
        </p>
      </div>

      {isLoading || isFetching ? (
        <p className="py-6 text-sm text-muted-foreground">
          Loading employee assignments...
        </p>
      ) : isError ? (
        <div className="space-y-3">
          <p className="text-sm text-red-600">
            Unable to load employee assignments.
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            className={secondaryButton}
          >
            Try Again
          </button>
        </div>
      ) : employees ? (
        <AssignmentEditor
          organizationId={organizationId}
          locationId={location.id}
          employees={employees}
          onClose={onClose}
        />
      ) : null}
    </div>
  );
}

//************************************************************** */

function AssignmentEditor({
  organizationId,
  locationId,
  employees,
  onClose,
}: {
  organizationId: string;
  locationId: string;
  employees: LocationEmployee[];
  onClose: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    () =>
      employees
        .filter((employee) =>
          employee.membershipLocations.some(
            (assignment) =>
              assignment.shopLocationId === locationId,
          ),
        )
        .map((employee) => employee.id),
  );

  const [search, setSearch] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [assignEmployees, { isLoading }] =
    useAssignLocationEmployeesMutation();

  const filteredEmployees = employees.filter((employee) => {
    const query = search.trim().toLowerCase();

    const name =
      `${employee.user.firstName} ${employee.user.lastName}`;

    return (
      name.toLowerCase().includes(query) ||
      employee.user.email.toLowerCase().includes(query)
    );
  });

  function toggleEmployee(id: string) {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((value) => value !== id)
        : [...previous, id],
    );
  }

  async function handleSave() {
    if (isLoading) return;

    setError(null);

    try {
      await assignEmployees({
        organizationId,
        locationId,
        membershipIds: selectedIds,
      }).unwrap();

      toast.success("Employee assignments updated.");

      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <div className="space-y-4">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search employees..."
        aria-label="Search employees"
        className={inputClassName}
      />

      <p className="text-sm text-muted-foreground">
        {selectedIds.length} employees selected
      </p>

      <div className="max-h-96 divide-y overflow-y-auto rounded-lg border">
        {filteredEmployees.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No employees found.
          </p>
        ) : (
          filteredEmployees.map((employee) => (
            <label
              key={employee.id}
              className="flex cursor-pointer items-center gap-3 p-4 hover:bg-muted/50"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(employee.id)}
                disabled={isLoading}
                onChange={() => toggleEmployee(employee.id)}
                className="h-4 w-4 accent-orange-500"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {employee.user.firstName}{" "}
                  {employee.user.lastName}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {employee.user.email}
                </p>
              </div>

              <span className="text-xs capitalize text-muted-foreground">
                {employee.role
                  .toLowerCase()
                  .replaceAll("_", " ")}
              </span>
            </label>
          ))
        )}
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600"
        >
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 border-t pt-4">
        <button
          type="button"
          disabled={isLoading}
          onClick={onClose}
          className={secondaryButton}
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => void handleSave()}
          className={primaryButton}
        >
          {isLoading ? "Saving..." : "Save Assignments"}
        </button>
      </div>
    </div>
  );
}

//************************************************************** */

function LocationField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength,
  pattern,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1.5 text-sm font-medium">
      <span>
        {label}
        {required ? " *" : ""}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        maxLength={maxLength}
        pattern={pattern}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      />
    </label>
  );
}

//************************************************************** */

const inputClassName =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10";

const primaryButton =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";

//************************************************************** */
