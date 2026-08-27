import type {
  CreatePartReturnInput,
  GetPartReturnInput,
  PartReturn,
  PartReturnActionInput,
  PartReturnListQuery,
  UpdatePartReturnCreditInput,
  UpdatePartReturnInput,
} from "@/features/parts/part-return.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;

  data: T;
};

//************************************************************** */

export const partReturnsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartReturns: builder.query<PartReturn[], PartReturnListQuery>({
      query: ({
        organizationId,
        search,
        returnType,
        status,
        creditStatus,
        vendorId,
        partId,
        purchaseOrderId,
        repairOrderId,
        isActive,
      }) => ({
        url: `/organizations/${organizationId}/part-returns`,

        method: "GET",

        params: {
          ...(search
            ? {
                search,
              }
            : {}),

          ...(returnType
            ? {
                returnType,
              }
            : {}),

          ...(status
            ? {
                status,
              }
            : {}),

          ...(creditStatus
            ? {
                creditStatus,
              }
            : {}),

          ...(vendorId
            ? {
                vendorId,
              }
            : {}),

          ...(partId
            ? {
                partId,
              }
            : {}),

          ...(purchaseOrderId
            ? {
                purchaseOrderId,
              }
            : {}),

          ...(repairOrderId
            ? {
                repairOrderId,
              }
            : {}),

          ...(isActive !== undefined
            ? {
                isActive: String(isActive),
              }
            : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<PartReturn[]>) =>
        response.data,

      providesTags: (result) =>
        result
          ? [
              {
                type: "PartReturn" as const,

                id: "LIST",
              },

              ...result.map((partReturn) => ({
                type: "PartReturn" as const,

                id: partReturn.id,
              })),
            ]
          : [
              {
                type: "PartReturn" as const,

                id: "LIST",
              },
            ],
    }),

    //************************************************************** */

    getPartReturn: builder.query<PartReturn, GetPartReturnInput>({
      query: ({ organizationId, partReturnId }) => ({
        url: `/organizations/${organizationId}/part-returns/${partReturnId}`,

        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<PartReturn>) =>
        response.data,

      providesTags: (_result, _error, { partReturnId }) => [
        {
          type: "PartReturn",

          id: partReturnId,
        },
      ],
    }),

    //************************************************************** */

    createPartReturn: builder.mutation<PartReturn, CreatePartReturnInput>({
      query: ({ organizationId, ...data }) => ({
        url: `/organizations/${organizationId}/part-returns`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<PartReturn>) =>
        response.data,

      invalidatesTags: [
        {
          type: "PartReturn",

          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    updatePartReturn: builder.mutation<PartReturn, UpdatePartReturnInput>({
      query: ({ organizationId, partReturnId, data }) => ({
        url: `/organizations/${organizationId}/part-returns/${partReturnId}`,

        method: "PATCH",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<PartReturn>) =>
        response.data,

      invalidatesTags: (_result, _error, { partReturnId }) => [
        {
          type: "PartReturn",

          id: partReturnId,
        },

        {
          type: "PartReturn",

          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    shipPartReturn: builder.mutation<PartReturn, PartReturnActionInput>({
      query: ({ organizationId, partReturnId }) => ({
        url: `/organizations/${organizationId}/part-returns/${partReturnId}/ship`,

        method: "POST",

        body: {},
      }),

      transformResponse: (response: ApiSuccessResponse<PartReturn>) =>
        response.data,

      invalidatesTags: (_result, _error, { partReturnId }) => [
        {
          type: "PartReturn",

          id: partReturnId,
        },

        {
          type: "PartReturn",

          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    updatePartReturnCredit: builder.mutation<
      PartReturn,
      UpdatePartReturnCreditInput
    >({
      query: ({ organizationId, partReturnId, data }) => ({
        url: `/organizations/${organizationId}/part-returns/${partReturnId}/credit`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<PartReturn>) =>
        response.data,

      invalidatesTags: (_result, _error, { partReturnId }) => [
        {
          type: "PartReturn",

          id: partReturnId,
        },

        {
          type: "PartReturn",

          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    closePartReturn: builder.mutation<PartReturn, PartReturnActionInput>({
      query: ({ organizationId, partReturnId }) => ({
        url: `/organizations/${organizationId}/part-returns/${partReturnId}/close`,

        method: "POST",

        body: {},
      }),

      transformResponse: (response: ApiSuccessResponse<PartReturn>) =>
        response.data,

      invalidatesTags: (_result, _error, { partReturnId }) => [
        {
          type: "PartReturn",

          id: partReturnId,
        },

        {
          type: "PartReturn",

          id: "LIST",
        },

        {
          type: "Part",

          id: "LIST",
        },

        {
          type: "Inventory",

          id: "LIST",
        },
      ],
    }),
  }),
});

//************************************************************** */

export const {
  useGetPartReturnsQuery,
  useGetPartReturnQuery,
  useCreatePartReturnMutation,
  useUpdatePartReturnMutation,
  useShipPartReturnMutation,
  useUpdatePartReturnCreditMutation,
  useClosePartReturnMutation,
} = partReturnsApi;

//************************************************************** */
