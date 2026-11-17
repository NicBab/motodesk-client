
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
  const result = await rawBaseQuery(
    args,
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
