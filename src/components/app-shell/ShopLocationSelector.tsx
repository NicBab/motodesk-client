
"use client";

import { useEffect } from "react";

import {
  Building2,
  ChevronDown,
} from "lucide-react";

import {
  useGetAccessibleLocationsQuery,
} from "@/store/api/locationsApi";

import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

import {
  selectActiveOrganizationId,
  selectActiveLocationId,
  setActiveLocation,
} from "@/store/slices/workspaceSlice";

//************************************************************** */

type ShopLocationSelectorProps = {
  switchingEnabled: boolean;
};

//************************************************************** */

export function ShopLocationSelector({
  switchingEnabled,
}: ShopLocationSelectorProps) {
  const dispatch = useAppDispatch();

  const organizationId = useAppSelector(
    selectActiveOrganizationId,
  );

  const activeLocationId = useAppSelector(
    selectActiveLocationId,
  );

  const {
    currentData: locations,
    isLoading,
    isFetching,
    isError,
  } = useGetAccessibleLocationsQuery(
    organizationId ?? "",
    {
      skip: !organizationId,

      refetchOnMountOrArgChange: true,

      refetchOnFocus: true,

      refetchOnReconnect: true,

      pollingInterval: 60_000,
    },
  );

  //************************************************************** */

  const activeLocations = locations?.filter(
    (location) =>
      location.organizationId === organizationId &&
      location.status === "ACTIVE",
  );

  const selectedLocation = activeLocations?.find(
    (location) => location.id === activeLocationId,
  );

  const defaultLocation =
    activeLocations?.find(
      (location) => location.isDefault,
    ) ?? activeLocations?.[0];

  //************************************************************** */

  useEffect(() => {
    if (!organizationId || isError) {
      if (activeLocationId !== null) {
        dispatch(setActiveLocation(null));
      }

      return;
    }

    if (!locations || isFetching) {
      return;
    }

    if (selectedLocation) {
      return;
    }

    const nextLocationId =
      defaultLocation?.id ?? null;

    if (activeLocationId !== nextLocationId) {
      dispatch(
        setActiveLocation(nextLocationId),
      );
    }
  }, [
    dispatch,
    organizationId,
    activeLocationId,
    locations,
    selectedLocation,
    defaultLocation,
    isFetching,
    isError,
  ]);

  //************************************************************** */

  function handleLocationChange(locationId: string) {
    if (
      !switchingEnabled ||
      isFetching ||
      isError
    ) {
      return;
    }

    const accessibleLocation = activeLocations?.find(
      (location) => location.id === locationId,
    );

    if (!accessibleLocation) {
      return;
    }

    dispatch(
      setActiveLocation(accessibleLocation.id),
    );
  }

  //************************************************************** */

  if (!organizationId) {
    return null;
  }

  if (isLoading || (!locations && !isError)) {
    return (
      <div
        role="status"
        className="flex h-9 items-center gap-2 text-xs text-muted-foreground"
      >
        <Building2 className="h-4 w-4" />

        Loading shops...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="status"
        className="flex h-9 items-center gap-2 text-xs text-red-600"
      >
        <Building2 className="h-4 w-4" />

        Shops unavailable
      </div>
    );
  }

  if (!activeLocations?.length) {
    return (
      <div
        role="status"
        className="flex h-9 items-center gap-2 text-xs text-amber-600"
      >
        <Building2 className="h-4 w-4" />

        No assigned shops
      </div>
    );
  }

  //************************************************************** */

  const canSwitch =
    switchingEnabled &&
    activeLocations.length > 1 &&
    !isFetching;

  //************************************************************** */

  return (
    <div
      className="relative flex min-w-0 items-center"
      title={
        !switchingEnabled
          ? "Operational shop switching is not yet enabled."
          : undefined
      }
    >
      <Building2
        aria-hidden="true"
        className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
      />

      <select
        aria-label="Active shop location"
        value={
          selectedLocation?.id ??
          defaultLocation?.id ??
          ""
        }
        disabled={!canSwitch}
        onChange={(event) =>
          handleLocationChange(event.target.value)
        }
        className="h-9 w-full min-w-36 max-w-60 appearance-none rounded-lg border bg-background pl-9 pr-8 text-sm font-medium outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 disabled:cursor-default"
      >
        {activeLocations.map((location) => (
          <option
            key={location.id}
            value={location.id}
          >
            {location.name}
          </option>
        ))}
      </select>

      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 h-4 w-4 text-muted-foreground"
      />
    </div>
  );
}

//************************************************************** */
