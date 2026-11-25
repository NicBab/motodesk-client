
//************************************************************** */

import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

import { toast } from "sonner";

import { clientEnv } from "@/config/env";

import type { RootState } from "@/store/store";

//************************************************************** */

const rawBaseQuery = fetchBaseQuery({
  baseUrl: clientEnv.apiUrl,

  credentials: "include",
});

//************************************************************** */

const baseQueryWithSubscriptionAccess: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;

  const {
    activeOrganizationId,
    activeLocationId,
  } = state.workspace;

  const request: FetchArgs =
    typeof args === "string"
      ? { url: args }
      : { ...args };

  const headers = new Headers();

if (request.headers instanceof Headers) {
  request.headers.forEach((value, key) => {
    headers.set(key, value);
  });
} else if (Array.isArray(request.headers)) {
  for (const [key, value] of request.headers) {
    if (key !== undefined && value !== undefined) {
      headers.append(key, value);
    }
  }
} else if (request.headers) {
  for (const [key, value] of Object.entries(request.headers)) {
    if (value !== undefined) {
      headers.set(key, value);
    }
  }
}

  //************************************************************** */
  // Shop Location Context
  //************************************************************** */

  const organizationMatch = request.url.match(
    /^\/?organizations\/([^/?#]+)(?:\/|[?#]|$)/,
  );

  const requestOrganizationId =
    organizationMatch?.[1];

  headers.delete("X-Shop-Location-Id");

  if (
    activeOrganizationId &&
    activeLocationId &&
    requestOrganizationId ===
      encodeURIComponent(activeOrganizationId)
  ) {
    headers.set(
      "X-Shop-Location-Id",
      activeLocationId,
    );
  }

  request.headers = headers;

  //************************************************************** */

  const result = await rawBaseQuery(
    request,
    api,
    extraOptions,
  );

  if (
    result.error?.status === 403 &&
    typeof result.error.data === "object" &&
    result.error.data !== null &&
    "code" in result.error.data &&
    result.error.data.code ===
      "SUBSCRIPTION_ACCESS_RESTRICTED"
  ) {
    if (typeof window !== "undefined") {
      toast.error(
        "Subscription requires attention",
        {
          id: "subscription-access-restricted",

          description:
            "Your workspace is currently read-only. Contact your organization owner or administrator to restore full access.",

          duration: 7000,
        },
      );
    }
  }

  return result;
};

//************************************************************** */

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithSubscriptionAccess,

  tagTypes: [
    "Auth",
    "Organization",
    "Membership",
    "Customer",
    "Vehicle",
    "RepairOrder",
    "Part",
    "Inventory",
    "Vendor",
    "PurchaseOrder",
    "PartReturn",
    "Sale",
    "Employee",
    "TimeClock",
    "Permission",
    "MembershipInvitation",

    "Schedule",
    "ServiceAppointment",

    "Report",
  ],

  endpoints: () => ({}),
});

//************************************************************** */
