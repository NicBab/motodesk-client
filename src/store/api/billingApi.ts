import type {
  BillingOverview,
  BillingRedirectResult,
  CreateBillingCheckoutInput,
} from "@/features/settings/billing.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

interface CreateBillingCheckoutRequest
  extends CreateBillingCheckoutInput {
  organizationId: string;
}

//************************************************************** */

function billingPath(organizationId: string): string {
  return `/organizations/${encodeURIComponent(organizationId)}/billing`;
}

//************************************************************** */

export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingOverview: builder.query<
      BillingOverview,
      string
    >({
      query: (organizationId) => ({
        url: billingPath(organizationId),
        method: "GET",
        cache: "no-store",
      }),

      transformResponse: (
        response: ApiSuccessResponse<BillingOverview>,
      ) => response.data,

      keepUnusedDataFor: 0,
    }),

    //************************************************************** */

    createBillingCheckout: builder.mutation<
      BillingRedirectResult,
      CreateBillingCheckoutRequest
    >({
      query: ({ organizationId, planId }) => ({
        url: `${billingPath(organizationId)}/checkout`,
        method: "POST",
        cache: "no-store",

        body: {
          planId,
        },
      }),

      transformResponse: (
        response: ApiSuccessResponse<BillingRedirectResult>,
      ) => response.data,
    }),

    //************************************************************** */

    createBillingPortal: builder.mutation<
      BillingRedirectResult,
      string
    >({
      query: (organizationId) => ({
        url: `${billingPath(organizationId)}/portal`,
        method: "POST",
        cache: "no-store",
        body: {},
      }),

      transformResponse: (
        response: ApiSuccessResponse<BillingRedirectResult>,
      ) => response.data,
    }),
  }),
});

//************************************************************** */

export const {
  useGetBillingOverviewQuery,
  useCreateBillingCheckoutMutation,
  useCreateBillingPortalMutation,
} = billingApi;

//************************************************************** */