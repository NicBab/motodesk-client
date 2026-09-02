//************************************************************** */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { clientEnv } from "@/config/env";

//************************************************************** */

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: clientEnv.apiUrl,
    credentials: "include",
  }),

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
],

  endpoints: () => ({}),
});

//************************************************************** */
