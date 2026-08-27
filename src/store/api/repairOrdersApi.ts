import type {
  ApproveRepairOrderInput,
  DeclineRepairOrderApprovalInput,
  RepairOrder,
  RepairOrderListQuery,
  RepairOrderMutationInput,
  RepairOrderNotesMutationInput,
  UpdateRepairOrderStatusInput,
  CreateRepairOrderInput,
  GetRepairOrderInput,
  RepairOrderQualityCheckInput,
  FailRepairOrderQualityCheckInput,
  CashierRepairOrderInput,
  CloseRepairOrderInput,
  CompleteRepairOrderPickupInput,
  ReopenRepairOrderInput,
  PauseRepairOrderInput,
ResumeRepairOrderInput,
UpdateRepairOrderInput,
} from "@/features/repair-orders/repair-order.types";

import type {
  CreateRepairOrderLaborLineInput,
  RepairOrderLaborActionInput,
  RepairOrderLaborActionResult,
  RepairOrderLaborLine,
  RepairOrderLaborListInput,
  UpdateRepairOrderLaborLineInput,
} from "@/features/repair-orders/repair-order-labor.types";

import type {
  ApproveAdditionalWorkInput,
  DeclineAdditionalWorkInput,
  RequestAdditionalWorkApprovalInput,
  SendAdditionalWorkToPartsReviewInput,
} from "@/features/repair-orders/repair-order-additional-work.types";

import type {
  CreateRepairOrderPartLineInput,
  RepairOrderPartActionInput,
  RepairOrderPartLine,
  RepairOrderPartListInput,
  RepairOrderPartQuantityActionInput,
  UpdateRepairOrderPartLineInput,
} from "@/features/repair-orders/repair-order-parts.types";

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

    updateRepairOrder: builder.mutation<
  RepairOrder,
  UpdateRepairOrderInput
>({
  query: ({
    organizationId,
    repairOrderId,
    data,
  }) => ({
    url: `/organizations/${organizationId}/repair-orders/${repairOrderId}`,
    method: "PATCH",
    body: data,
  }),

  transformResponse: (
    response: ApiSuccessResponse<RepairOrder>,
  ) => response.data,

  invalidatesTags: (
    _result,
    _error,
    { repairOrderId },
  ) => [
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
    getRepairOrder: builder.query<RepairOrder, GetRepairOrderInput>({
      query: ({ organizationId, repairOrderId }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}`,
        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrder>) =>
        response.data,

      providesTags: (_result, _error, { repairOrderId }) => [
        {
          type: "RepairOrder",
          id: repairOrderId,
        },
      ],
    }),
    passRepairOrderQualityCheck: builder.mutation<
      RepairOrder,
      RepairOrderQualityCheckInput
    >({
      query: ({ organizationId, repairOrderId, notes }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/quality-check/pass`,
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

    failRepairOrderQualityCheck: builder.mutation<
      RepairOrder,
      FailRepairOrderQualityCheckInput
    >({
      query: ({ organizationId, repairOrderId, notes }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/quality-check/fail`,
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
    cashierRepairOrder: builder.mutation<RepairOrder, CashierRepairOrderInput>({
      query: ({
        organizationId,
        repairOrderId,
        paymentReference,
        paymentRemote,
        remainingBalance,
      }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/cashier`,
        method: "POST",
        body: {
          ...(paymentReference !== undefined ? { paymentReference } : {}),

          ...(paymentRemote !== undefined ? { paymentRemote } : {}),

          ...(remainingBalance !== undefined ? { remainingBalance } : {}),
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

    completeRepairOrderPickup: builder.mutation<
      RepairOrder,
      CompleteRepairOrderPickupInput
    >({
      query: ({ organizationId, repairOrderId, pickupRecipient, notes }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/pickup`,
        method: "POST",
        body: {
          ...(pickupRecipient !== undefined ? { pickupRecipient } : {}),

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

    closeRepairOrder: builder.mutation<RepairOrder, CloseRepairOrderInput>({
      query: ({ organizationId, repairOrderId, notes }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/close`,
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
    getRepairOrderLaborLines: builder.query<
      RepairOrderLaborLine[],
      RepairOrderLaborListInput
    >({
      query: ({ organizationId, repairOrderId }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/labor-lines`,
        method: "GET",
      }),

      transformResponse: (
        response: ApiSuccessResponse<RepairOrderLaborLine[]>,
      ) => response.data,

      providesTags: (result) =>
        result
          ? [
              {
                type: "RepairOrder" as const,
                id: "LABOR",
              },

              ...result.map((laborLine) => ({
                type: "RepairOrder" as const,
                id: `LABOR-${laborLine.id}`,
              })),
            ]
          : [
              {
                type: "RepairOrder" as const,
                id: "LABOR",
              },
            ],
    }),

    createRepairOrderLaborLine: builder.mutation<
      RepairOrderLaborLine,
      CreateRepairOrderLaborLineInput
    >({
      query: ({ organizationId, repairOrderId, ...data }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/labor-lines`,
        method: "POST",
        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrderLaborLine>) =>
        response.data,

      invalidatesTags: [
        {
          type: "RepairOrder",
          id: "LABOR",
        },
      ],
    }),

    updateRepairOrderLaborLine: builder.mutation<
      RepairOrderLaborLine,
      UpdateRepairOrderLaborLineInput
    >({
      query: ({ organizationId, repairOrderId, laborLineId, data }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/labor-lines/${laborLineId}`,
        method: "PATCH",
        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrderLaborLine>) =>
        response.data,

      invalidatesTags: (_result, _error, { laborLineId }) => [
        {
          type: "RepairOrder",
          id: "LABOR",
        },
        {
          type: "RepairOrder",
          id: `LABOR-${laborLineId}`,
        },
      ],
    }),

    startRepairOrderLaborLine: builder.mutation<
      RepairOrderLaborActionResult,
      RepairOrderLaborActionInput
    >({
      query: ({ organizationId, repairOrderId, laborLineId, notes }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/labor-lines/${laborLineId}/start`,
        method: "POST",
        body: {
          ...(notes !== undefined ? { notes } : {}),
        },
      }),

      transformResponse: (
        response: ApiSuccessResponse<RepairOrderLaborActionResult>,
      ) => response.data,

      invalidatesTags: (_result, _error, { repairOrderId }) => [
        {
          type: "RepairOrder",
          id: repairOrderId,
        },
        {
          type: "RepairOrder",
          id: "LIST",
        },
        {
          type: "RepairOrder",
          id: "LABOR",
        },
      ],
    }),

completeRepairOrderLaborLine: builder.mutation<
  RepairOrderLaborLine,
  RepairOrderLaborActionInput
>({
  query: ({
    organizationId,
    repairOrderId,
    laborLineId,
    notes,
  }) => ({
    url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/labor-lines/${laborLineId}/complete`,
    method: "POST",
    body: {
      ...(notes !== undefined
        ? { notes }
        : {}),
    },
  }),

  transformResponse: (
    response: ApiSuccessResponse<
      RepairOrderLaborLine
    >,
  ) => response.data,

  invalidatesTags: (
    _result,
    _error,
    { repairOrderId },
  ) => [
    {
      type: "RepairOrder",
      id: repairOrderId,
    },
    {
      type: "RepairOrder",
      id: "LIST",
    },
    {
      type: "RepairOrder",
      id: "LABOR",
    },
  ],
}),
    deleteRepairOrderLaborLine: builder.mutation<
      { success: true },
      RepairOrderLaborActionInput
    >({
      query: ({ organizationId, repairOrderId, laborLineId }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/labor-lines/${laborLineId}`,
        method: "DELETE",
      }),

      invalidatesTags: (_result, _error, { laborLineId }) => [
        {
          type: "RepairOrder",
          id: "LABOR",
        },
        {
          type: "RepairOrder",
          id: `LABOR-${laborLineId}`,
        },
      ],
    }),
    sendAdditionalWorkToPartsReview: builder.mutation<
      RepairOrder,
      SendAdditionalWorkToPartsReviewInput
    >({
      query: ({ organizationId, repairOrderId, notes }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/additional-work/parts-review`,
        method: "POST",
        body: { notes },
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

    requestAdditionalWorkApproval: builder.mutation<
      RepairOrder,
      RequestAdditionalWorkApprovalInput
    >({
      query: ({ organizationId, repairOrderId, notes }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/additional-approval/request`,
        method: "POST",
        body: { notes },
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

    approveAdditionalWork: builder.mutation<
      RepairOrder,
      ApproveAdditionalWorkInput
    >({
      query: ({
        organizationId,
        repairOrderId,
        approvalMethod,
        approvedBy,
        approvedAmount,
        notes,
      }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/additional-approval/approve`,
        method: "POST",
        body: {
          approvalMethod,
          approvedBy,
          ...(approvedAmount !== undefined ? { approvedAmount } : {}),
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

    declineAdditionalWork: builder.mutation<
      RepairOrder,
      DeclineAdditionalWorkInput
    >({
      query: ({ organizationId, repairOrderId, notes }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/additional-approval/decline`,
        method: "POST",
        body: { notes },
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
    reopenRepairOrder: builder.mutation<RepairOrder, ReopenRepairOrderInput>({
      query: ({ organizationId, repairOrderId, notes }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/reopen`,
        method: "POST",
        body: { notes },
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

    getRepairOrderPartLines: builder.query<
      RepairOrderPartLine[],
      RepairOrderPartListInput
    >({
      query: ({ organizationId, repairOrderId }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/part-lines`,
        method: "GET",
      }),

      transformResponse: (
        response: ApiSuccessResponse<RepairOrderPartLine[]>,
      ) => response.data,

      providesTags: [
        {
          type: "RepairOrder",
          id: "PARTS",
        },
      ],
    }),

    createRepairOrderPartLine: builder.mutation<
      RepairOrderPartLine,
      CreateRepairOrderPartLineInput
    >({
      query: ({ organizationId, repairOrderId, ...data }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/part-lines`,
        method: "POST",
        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrderPartLine>) =>
        response.data,

      invalidatesTags: [
        {
          type: "RepairOrder",
          id: "PARTS",
        },
      ],
    }),

    updateRepairOrderPartLine: builder.mutation<
      RepairOrderPartLine,
      UpdateRepairOrderPartLineInput
    >({
      query: ({ organizationId, repairOrderId, partLineId, data }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/part-lines/${partLineId}`,
        method: "PATCH",
        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrderPartLine>) =>
        response.data,

      invalidatesTags: [
        {
          type: "RepairOrder",
          id: "PARTS",
        },
      ],
    }),

    deleteRepairOrderPartLine: builder.mutation<
      { success: true },
      RepairOrderPartActionInput
    >({
      query: ({ organizationId, repairOrderId, partLineId }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/part-lines/${partLineId}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "RepairOrder",
          id: "PARTS",
        },
      ],
    }),

    allocateRepairOrderPartLine: builder.mutation<
      RepairOrderPartLine,
      RepairOrderPartQuantityActionInput
    >({
      query: ({
        organizationId,
        repairOrderId,
        partLineId,
        quantity,
        notes,
      }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/part-lines/${partLineId}/allocate`,
        method: "POST",
        body: {
          quantity,
          ...(notes !== undefined ? { notes } : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrderPartLine>) =>
        response.data,

      invalidatesTags: [
        {
          type: "RepairOrder",
          id: "PARTS",
        },
      ],
    }),

    // orderRepairOrderPartLine: builder.mutation<
    //   RepairOrderPartLine,
    //   RepairOrderPartQuantityActionInput
    // >({
    //   query: ({
    //     organizationId,
    //     repairOrderId,
    //     partLineId,
    //     quantity,
    //     notes,
    //   }) => ({
    //     url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/part-lines/${partLineId}/order`,
    //     method: "POST",
    //     body: {
    //       quantity,
    //       ...(notes !== undefined ? { notes } : {}),
    //     },
    //   }),

    //   transformResponse: (response: ApiSuccessResponse<RepairOrderPartLine>) =>
    //     response.data,

    //   invalidatesTags: [
    //     {
    //       type: "RepairOrder",
    //       id: "PARTS",
    //     },
    //   ],
    // }),

    markRepairOrderPartToBeOrdered: builder.mutation<
      RepairOrderPartLine,
      RepairOrderPartActionInput
    >({
      query: ({ organizationId, repairOrderId, partLineId, notes }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/part-lines/${partLineId}/to-be-ordered`,
        method: "POST",
        body: {
          ...(notes !== undefined ? { notes } : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrderPartLine>) =>
        response.data,

      invalidatesTags: [
        {
          type: "RepairOrder",
          id: "PARTS",
        },
      ],
    }),

    receiveRepairOrderPartLine: builder.mutation<
      RepairOrderPartLine,
      RepairOrderPartQuantityActionInput
    >({
      query: ({
        organizationId,
        repairOrderId,
        partLineId,
        quantity,
        notes,
      }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/part-lines/${partLineId}/receive`,
        method: "POST",
        body: {
          quantity,
          ...(notes !== undefined ? { notes } : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrderPartLine>) =>
        response.data,

      invalidatesTags: [
        {
          type: "RepairOrder",
          id: "PARTS",
        },
      ],
    }),

    pullRepairOrderPartLine: builder.mutation<
      RepairOrderPartLine,
      RepairOrderPartQuantityActionInput
    >({
      query: ({
        organizationId,
        repairOrderId,
        partLineId,
        quantity,
        notes,
      }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/part-lines/${partLineId}/pull`,
        method: "POST",
        body: {
          quantity,
          ...(notes !== undefined ? { notes } : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrderPartLine>) =>
        response.data,

      invalidatesTags: [
        {
          type: "RepairOrder",
          id: "PARTS",
        },
      ],
    }),

    stageRepairOrderPartLine: builder.mutation<
      RepairOrderPartLine,
      RepairOrderPartActionInput
    >({
      query: ({ organizationId, repairOrderId, partLineId, notes }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/part-lines/${partLineId}/stage`,
        method: "POST",
        body: {
          ...(notes !== undefined ? { notes } : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrderPartLine>) =>
        response.data,

      invalidatesTags: [
        {
          type: "RepairOrder",
          id: "PARTS",
        },
      ],
    }),

    installRepairOrderPartLine: builder.mutation<
      RepairOrderPartLine,
      RepairOrderPartQuantityActionInput
    >({
      query: ({
        organizationId,
        repairOrderId,
        partLineId,
        quantity,
        notes,
      }) => ({
        url: `/organizations/${organizationId}/repair-orders/${repairOrderId}/part-lines/${partLineId}/install`,
        method: "POST",
        body: {
          quantity,
          ...(notes !== undefined ? { notes } : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<RepairOrderPartLine>) =>
        response.data,

      invalidatesTags: [
        {
          type: "RepairOrder",
          id: "PARTS",
        },
      ],
    }),
    pauseRepairOrder: builder.mutation<
  RepairOrder,
  PauseRepairOrderInput
>({
  query: ({
    organizationId,
    repairOrderId,
    notes,
  }) => ({
    url: `/organizations/${organizationId}/repair-order-work-status/repair-orders/${repairOrderId}/pause`,
    method: "POST",
    body: { notes },
  }),

  transformResponse: (
    response: ApiSuccessResponse<RepairOrder>,
  ) => response.data,

  invalidatesTags: (
    _result,
    _error,
    { repairOrderId },
  ) => [
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

resumeRepairOrder: builder.mutation<
  RepairOrder,
  ResumeRepairOrderInput
>({
  query: ({
    organizationId,
    repairOrderId,
    notes,
  }) => ({
    url: `/organizations/${organizationId}/repair-order-work-status/repair-orders/${repairOrderId}/resume`,
    method: "POST",
    body: {
      ...(notes !== undefined
        ? { notes }
        : {}),
    },
  }),

  transformResponse: (
    response: ApiSuccessResponse<RepairOrder>,
  ) => response.data,

  invalidatesTags: (
    _result,
    _error,
    { repairOrderId },
  ) => [
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
  useGetRepairOrderQuery,
  usePassRepairOrderQualityCheckMutation,
  useFailRepairOrderQualityCheckMutation,
  useCashierRepairOrderMutation,
  useCompleteRepairOrderPickupMutation,
  useCloseRepairOrderMutation,

  useGetRepairOrderLaborLinesQuery,
  useUpdateRepairOrderMutation,
  useCreateRepairOrderLaborLineMutation,
  useUpdateRepairOrderLaborLineMutation,
  useStartRepairOrderLaborLineMutation,
  useCompleteRepairOrderLaborLineMutation,

  useDeleteRepairOrderLaborLineMutation,

  useSendAdditionalWorkToPartsReviewMutation,
  useRequestAdditionalWorkApprovalMutation,
  useApproveAdditionalWorkMutation,
  useDeclineAdditionalWorkMutation,

  useReopenRepairOrderMutation,

  useGetRepairOrderPartLinesQuery,
  useCreateRepairOrderPartLineMutation,
  useUpdateRepairOrderPartLineMutation,
  useDeleteRepairOrderPartLineMutation,

  useAllocateRepairOrderPartLineMutation,
  // useOrderRepairOrderPartLineMutation,
  useMarkRepairOrderPartToBeOrderedMutation,
  useReceiveRepairOrderPartLineMutation,
  usePullRepairOrderPartLineMutation,
  useStageRepairOrderPartLineMutation,
  useInstallRepairOrderPartLineMutation,
  
  usePauseRepairOrderMutation,
useResumeRepairOrderMutation,
} = repairOrdersApi;
