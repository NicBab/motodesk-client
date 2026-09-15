import type {
  DashboardOverview,
  GetDashboardOverviewInput,
} from "@/features/dashboard/dashboard.types";

import { baseApi } from "./baseApi";

//************************************************************** */

export const dashboardApi =
  baseApi.injectEndpoints({
    endpoints: (builder) => ({
      getDashboardOverview:
        builder.query<
          DashboardOverview,
          GetDashboardOverviewInput
        >({
          query: ({
            organizationId,
          }) => ({
            url: `/organizations/${organizationId}/dashboard`,

            method: "GET",
          }),
        }),
    }),

    overrideExisting: false,
  });

//************************************************************** */

export const {
  useGetDashboardOverviewQuery,
} = dashboardApi;

//************************************************************** */