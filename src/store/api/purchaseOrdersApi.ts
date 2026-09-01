import type {
  CancelPurchaseOrderInput,
  CreatePurchaseOrderInput,
  GetPurchaseOrderInput,
  PurchaseOrder,
  PurchaseOrderActionInput,
  PurchaseOrderListQuery,
  ReceivePurchaseOrderInput,
  UpdatePurchaseOrderInput,
} from "@/features/parts/purchase-order.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

//************************************************************** */

export const purchaseOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query<PurchaseOrder[], PurchaseOrderListQuery>({
      query: ({ organizationId, search, vendorId, status, isActive }) => ({
        url: `/organizations/${organizationId}/purchase-orders`,

        method: "GET",

        params: {
          ...(search ? { search } : {}),

          ...(vendorId ? { vendorId } : {}),

          ...(status ? { status } : {}),

          ...(isActive !== undefined
            ? {
                isActive: String(isActive),
              }
            : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<PurchaseOrder[]>) =>
        response.data,

      providesTags: (result) =>
        result
          ? [
              {
                type: "PurchaseOrder" as const,
                id: "LIST",
              },

              ...result.map((purchaseOrder) => ({
                type: "PurchaseOrder" as const,

                id: purchaseOrder.id,
              })),
            ]
          : [
              {
                type: "PurchaseOrder" as const,
                id: "LIST",
              },
            ],
    }),

    //************************************************************** */

    getPurchaseOrder: builder.query<PurchaseOrder, GetPurchaseOrderInput>({
      query: ({ organizationId, purchaseOrderId }) => ({
        url: `/organizations/${organizationId}/purchase-orders/${purchaseOrderId}`,

        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<PurchaseOrder>) =>
        response.data,

      providesTags: (_result, _error, { purchaseOrderId }) => [
        {
          type: "PurchaseOrder",

          id: purchaseOrderId,
        },
      ],
    }),

    //************************************************************** */

    createPurchaseOrder: builder.mutation<
      PurchaseOrder,
      CreatePurchaseOrderInput
    >({
      query: ({ organizationId, ...data }) => ({
        url: `/organizations/${organizationId}/purchase-orders`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<PurchaseOrder>) =>
        response.data,

      invalidatesTags: [
        {
          type: "PurchaseOrder",

          id: "LIST",
        },

        {
          type: "RepairOrder",

          id: "PART_ORDER_DEMAND",
        },
      ],
    }),

    //************************************************************** */

    updatePurchaseOrder: builder.mutation<
      PurchaseOrder,
      UpdatePurchaseOrderInput
    >({
      query: ({ organizationId, purchaseOrderId, data }) => ({
        url: `/organizations/${organizationId}/purchase-orders/${purchaseOrderId}`,

        method: "PATCH",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<PurchaseOrder>) =>
        response.data,

      invalidatesTags: (_result, _error, { purchaseOrderId }) => [
        {
          type: "PurchaseOrder",

          id: purchaseOrderId,
        },

        {
          type: "PurchaseOrder",

          id: "LIST",
        },

        {
          type: "RepairOrder",

          id: "PART_ORDER_DEMAND",
        },
      ],
    }),

    //************************************************************** */

    orderPurchaseOrder: builder.mutation<
      PurchaseOrder,
      PurchaseOrderActionInput
    >({
      query: ({ organizationId, purchaseOrderId }) => ({
        url: `/organizations/${organizationId}/purchase-orders/${purchaseOrderId}/order`,

        method: "POST",

        body: {},
      }),

      transformResponse: (response: ApiSuccessResponse<PurchaseOrder>) =>
        response.data,

      invalidatesTags: (_result, _error, { purchaseOrderId }) => [
        {
          type: "PurchaseOrder",

          id: purchaseOrderId,
        },

        {
          type: "PurchaseOrder",

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

        {
          type: "RepairOrder",

          id: "PART_ORDER_DEMAND",
        },
      ],
    }),

    //************************************************************** */

    receivePurchaseOrder: builder.mutation<
      PurchaseOrder,
      ReceivePurchaseOrderInput
    >({
      query: ({ organizationId, purchaseOrderId, data }) => ({
        url: `/organizations/${organizationId}/purchase-orders/${purchaseOrderId}/receive`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<PurchaseOrder>) =>
        response.data,

      invalidatesTags: (_result, _error, { purchaseOrderId }) => [
        {
          type: "PurchaseOrder",

          id: purchaseOrderId,
        },

        {
          type: "PurchaseOrder",

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

        {
          type: "RepairOrder",

          id: "LIST",
        },

        {
          type: "RepairOrder",

          id: "PART_ORDER_DEMAND",
        },
      ],
    }),

    //************************************************************** */

    cancelPurchaseOrder: builder.mutation<
      PurchaseOrder,
      CancelPurchaseOrderInput
    >({
      query: ({ organizationId, purchaseOrderId, notes }) => ({
        url: `/organizations/${organizationId}/purchase-orders/${purchaseOrderId}/cancel`,

        method: "POST",

        body: {
          ...(notes ? { notes } : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<PurchaseOrder>) =>
        response.data,

      invalidatesTags: (_result, _error, { purchaseOrderId }) => [
        {
          type: "PurchaseOrder",

          id: purchaseOrderId,
        },

        {
          type: "PurchaseOrder",

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

        {
          type: "RepairOrder",

          id: "LIST",
        },

        {
          type: "RepairOrder",

          id: "PART_ORDER_DEMAND",
        },
      ],
    }),
  }),
});

//************************************************************** */

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useOrderPurchaseOrderMutation,
  useReceivePurchaseOrderMutation,
  useCancelPurchaseOrderMutation,
} = purchaseOrdersApi;

//************************************************************** */
