import type {
  ApproveRepairOrderInput,
  DeclineRepairOrderApprovalInput,
  RepairOrder,
  RepairOrderListQuery,
  RepairOrderMutationInput,
  RepairOrderNotesMutationInput,
  UpdateRepairOrderStatusInput,
  CreateRepairOrderInput,
} from "@/features/repair-orders/repair-order.types";

import { baseApi } from "./baseApi";

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export const repairOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRepairOrders: builder.query<RepairOrder[], RepairOrderListQuery>({
      query: ({
        organizationId,
        search,
        customerId,
        vehicleId,
        status,
        priority,
        serviceAdvisorMembershipId,
        primaryTechnicianMembershipId,
        isActive,
      }) => ({
        url: `/organizations/${organizationId}/repair-orders`,

        method: "GET",

        params: {
          ...(search ? { search } : {}),

          ...(customerId ? { customerId } : {}),

          ...(vehicleId ? { vehicleId } : {}),

          ...(status ? { status } : {}),

          ...(priority ? { priority } : {}),

          ...(serviceAdvisorMembershipId
            ? {
                serviceAdvisorMembershipId,
              }
            : {}),

          ...(primaryTechnicianMembershipId
            ? {
                primaryTechnicianMembershipId,
              }
            : {}),

          ...(isActive !== undefined
            ? {
                isActive: String(isActive),
              }
            : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrder[]>) =>
        response.data,

      providesTags: (result) =>
        result
          ? [
              {
                type: "RepairOrder" as const,
                id: "LIST",
              },

              ...result.map((repairOrder) => ({
                type: "RepairOrder" as const,
                id: repairOrder.id,
              })),
            ]
          : [
              {
                type: "RepairOrder" as const,
                id: "LIST",
              },
            ],
    }),

    createRepairOrder: builder.mutation<RepairOrder, CreateRepairOrderInput>({
      query: ({ organizationId, ...data }) => ({
        url: `/organizations/${organizationId}/repair-orders`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrder>) =>
        response.data,

      invalidatesTags: [
        {
          type: "RepairOrder",
          id: "LIST",
        },
      ],
    }),

    updateRepairOrderStatus: builder.mutation<
      RepairOrder,
      UpdateRepairOrderStatusInput
    >({
      query: ({ organizationId, repairOrderId, status, notes, automatic }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/status`,

        method: "POST",

        body: {
          status,

          ...(notes !== undefined ? { notes } : {}),

          ...(automatic !== undefined ? { automatic } : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrder>) =>
        response.data,

      invalidatesTags: (_result, _error, { repairOrderId }) => [
        {
          type: "RepairOrder",
          id: repairOrderId,
        },
        {
          type: "RepairOrder",
          id: "LIST",
        },
      ],
    }),

    requestRepairOrderApproval: builder.mutation<
      RepairOrder,
      RepairOrderNotesMutationInput
    >({
      query: ({ organizationId, repairOrderId, notes }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/approval/request`,

        method: "POST",

        body: {
          ...(notes !== undefined ? { notes } : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrder>) =>
        response.data,

      invalidatesTags: (_result, _error, { repairOrderId }) => [
        {
          type: "RepairOrder",
          id: repairOrderId,
        },
        {
          type: "RepairOrder",
          id: "LIST",
        },
      ],
    }),

    approveRepairOrder: builder.mutation<RepairOrder, ApproveRepairOrderInput>({
      query: ({
        organizationId,
        repairOrderId,
        approvalMethod,
        approvedBy,
        approvedAmount,
        notes,
      }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/approval/approve`,

        method: "POST",

        body: {
          approvalMethod,
          approvedBy,

          ...(approvedAmount !== undefined
            ? {
                approvedAmount,
              }
            : {}),

          ...(notes !== undefined ? { notes } : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrder>) =>
        response.data,

      invalidatesTags: (_result, _error, { repairOrderId }) => [
        {
          type: "RepairOrder",
          id: repairOrderId,
        },
        {
          type: "RepairOrder",
          id: "LIST",
        },
      ],
    }),

    declineRepairOrderApproval: builder.mutation<
      RepairOrder,
      DeclineRepairOrderApprovalInput
    >({
      query: ({ organizationId, repairOrderId, notes }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/approval/decline`,

        method: "POST",

        body: {
          notes,
        },
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrder>) =>
        response.data,

      invalidatesTags: (_result, _error, { repairOrderId }) => [
        {
          type: "RepairOrder",
          id: repairOrderId,
        },
        {
          type: "RepairOrder",
          id: "LIST",
        },
      ],
    }),

    completeRepairOrderPartsReview: builder.mutation<
      RepairOrder,
      RepairOrderMutationInput
    >({
      query: ({ organizationId, repairOrderId }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/parts-review/complete`,

        method: "POST",

        body: {},
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrder>) =>
        response.data,

      invalidatesTags: (_result, _error, { repairOrderId }) => [
        {
          type: "RepairOrder",
          id: repairOrderId,
        },
        {
          type: "RepairOrder",
          id: "LIST",
        },
      ],
    }),
  }),
});

export const {
  useGetRepairOrdersQuery,
  useCreateRepairOrderMutation,
  useUpdateRepairOrderStatusMutation,
  useRequestRepairOrderApprovalMutation,
  useApproveRepairOrderMutation,
  useDeclineRepairOrderApprovalMutation,
  useCompleteRepairOrderPartsReviewMutation,
} = repairOrdersApi;
