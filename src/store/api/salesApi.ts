import type {
  CreatePosSaleInput,
  CreateSaleReturnInput,
  GetSaleInput,
  Sale,
  SaleListQuery,
} from "@/features/sales/sale.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;

  data: T;
};

//************************************************************** */

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query<Sale[], SaleListQuery>({
      query: ({
        organizationId,
        search,
        type,
        status,
        customerId,
        repairOrderId,
      }) => ({
        url: `/organizations/${organizationId}/sales`,

        method: "GET",

        params: {
          ...(search
            ? {
                search,
              }
            : {}),

          ...(type
            ? {
                type,
              }
            : {}),

          ...(status
            ? {
                status,
              }
            : {}),

          ...(customerId
            ? {
                customerId,
              }
            : {}),

          ...(repairOrderId
            ? {
                repairOrderId,
              }
            : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<Sale[]>) =>
        response.data,

      providesTags: (result) =>
        result
          ? [
              {
                type: "Sale" as const,
                id: "LIST",
              },

              ...result.map((sale) => ({
                type: "Sale" as const,
                id: sale.id,
              })),
            ]
          : [
              {
                type: "Sale" as const,
                id: "LIST",
              },
            ],
    }),

    //************************************************************** */

    getSale: builder.query<Sale, GetSaleInput>({
      query: ({ organizationId, saleId }) => ({
        url: `/organizations/${organizationId}/sales/${saleId}`,

        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<Sale>) => response.data,

      providesTags: (_result, _error, { saleId }) => [
        {
          type: "Sale",

          id: saleId,
        },
      ],
    }),

    //************************************************************** */

    createPosSale: builder.mutation<Sale, CreatePosSaleInput>({
      query: ({ organizationId, ...data }) => ({
        url: `/organizations/${organizationId}/sales`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<Sale>) => response.data,

      invalidatesTags: [
        {
          type: "Sale",

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

    //************************************************************** */

    createSaleReturn: builder.mutation<Sale, CreateSaleReturnInput>({
      query: ({ organizationId, saleId, ...data }) => ({
        url: `/organizations/${organizationId}/sales/${saleId}/returns`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<Sale>) => response.data,

      invalidatesTags: (result, _error, { saleId }) => [
        {
          type: "Sale",

          id: saleId,
        },

        ...(result
          ? [
              {
                type: "Sale" as const,

                id: result.id,
              },
            ]
          : []),

        {
          type: "Sale",

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
  useGetSalesQuery,
  useGetSaleQuery,
  useCreatePosSaleMutation,
  useCreateSaleReturnMutation,
} = salesApi;

//************************************************************** */
