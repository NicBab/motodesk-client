import type {
  BillingOverview,
  BillingRedirectResult,
  CreateBillingCheckoutInput,
  CreateBillingUserCapacityPreviewInput,
  ConfirmBillingUserCapacityChangeInput,
  BillingUserCapacityPreview,
  BillingUserCapacityConfirmation,
  CreateBillingPlanChangePreviewInput,
  ConfirmBillingPlanChangeInput,
  BillingPlanChangePreview,
  BillingPlanChangeConfirmation,
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

interface CreateBillingUserCapacityPreviewRequest
  extends CreateBillingUserCapacityPreviewInput {
  organizationId: string;
}

interface ConfirmBillingUserCapacityChangeRequest
  extends ConfirmBillingUserCapacityChangeInput {
  organizationId: string;
}

interface CreateBillingPlanChangePreviewRequest
  extends CreateBillingPlanChangePreviewInput {
  organizationId: string;
}

interface ConfirmBillingPlanChangeRequest
  extends ConfirmBillingPlanChangeInput {
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

    //************************************************************** */

    createBillingUserCapacityPreview: builder.mutation<
      BillingUserCapacityPreview,
      CreateBillingUserCapacityPreviewRequest
    >({
      query: ({
        organizationId,
        additionalUserQuantity,
      }) => ({
        url: `${billingPath(organizationId)}/user-capacity/preview`,
        method: "POST",
        cache: "no-store",

        body: {
          additionalUserQuantity,
        },
      }),

      transformResponse: (
        response: ApiSuccessResponse<BillingUserCapacityPreview>,
      ) => response.data,
    }),

    //************************************************************** */

    confirmBillingUserCapacityChange: builder.mutation<
      BillingUserCapacityConfirmation,
      ConfirmBillingUserCapacityChangeRequest
    >({
      query: ({
        organizationId,
        changeId,
      }) => ({
        url: `${billingPath(organizationId)}/user-capacity/confirm`,
        method: "POST",
        cache: "no-store",

        body: {
          changeId,
        },
      }),

      transformResponse: (
        response: ApiSuccessResponse<BillingUserCapacityConfirmation>,
      ) => response.data,
    }),

    //************************************************************** */

    createBillingPlanChangePreview: builder.mutation<
      BillingPlanChangePreview,
      CreateBillingPlanChangePreviewRequest
    >({
      query: ({
        organizationId,
        planId,
        additionalUserQuantity,
      }) => ({
        url: `${billingPath(organizationId)}/plan-change/preview`,
        method: "POST",
        cache: "no-store",

        body: {
          planId,
          additionalUserQuantity,
        },
      }),

      transformResponse: (
        response: ApiSuccessResponse<BillingPlanChangePreview>,
      ) => response.data,
    }),

    //************************************************************** */

    confirmBillingPlanChange: builder.mutation<
      BillingPlanChangeConfirmation,
      ConfirmBillingPlanChangeRequest
    >({
      query: ({
        organizationId,
        changeId,
      }) => ({
        url: `${billingPath(organizationId)}/plan-change/confirm`,
        method: "POST",
        cache: "no-store",

        body: {
          changeId,
        },
      }),

      transformResponse: (
        response: ApiSuccessResponse<BillingPlanChangeConfirmation>,
      ) => response.data,
    }),
  }),
});

//************************************************************** */

export const {
  useGetBillingOverviewQuery,
  useCreateBillingCheckoutMutation,
  useCreateBillingPortalMutation,
  useCreateBillingUserCapacityPreviewMutation,
  useConfirmBillingUserCapacityChangeMutation,
  useCreateBillingPlanChangePreviewMutation,
  useConfirmBillingPlanChangeMutation,
} = billingApi;

//************************************************************** */