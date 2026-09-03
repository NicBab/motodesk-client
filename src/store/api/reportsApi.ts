import type {
  GetReportsOverviewInput,
  ReportsOverview,
} from "@/features/reports/report.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;

  data: T;
};

//************************************************************** */

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReportsOverview: builder.query<ReportsOverview, GetReportsOverviewInput>(
      {
        query: ({ organizationId, start, end, mode }) => ({
          url: `/organizations/${organizationId}/reports/overview`,

          method: "GET",

          params: {
            start,

            end,

            mode,
          },
        }),

        transformResponse: (response: ApiSuccessResponse<ReportsOverview>) =>
          response.data,

        providesTags: [
          {
            type: "Report",

            id: "OVERVIEW",
          },
        ],
      },
    ),
  }),

  overrideExisting: false,
});

//************************************************************** */

export const { useGetReportsOverviewQuery } = reportsApi;

//************************************************************** */
