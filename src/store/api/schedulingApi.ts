import type {
  CancelRepairOrderScheduleInput,
  CancelServiceAppointmentInput,
  ConvertServiceAppointmentResult,
  CreateServiceAppointmentInput,
  GetSchedulingBoardInput,
  ListServiceAppointmentsInput,
  RescheduleRepairOrderInput,
  ScheduleRepairOrderInput,
  ScheduleWorkBlock,
  SchedulingBoard,
  ServiceAppointment,
  ServiceAppointmentActionInput,
} from "@/features/scheduling/scheduling.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;

  data: T;
};

//************************************************************** */

export const schedulingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    //************************************************************** */
    // Dispatch Board

    getSchedulingBoard: builder.query<SchedulingBoard, GetSchedulingBoardInput>(
      {
        query: ({ organizationId, start, end }) => ({
          url: `/organizations/${organizationId}/scheduling`,

          method: "GET",

          params: {
            start,
            end,
          },
        }),

        transformResponse: (response: ApiSuccessResponse<SchedulingBoard>) =>
          response.data,

        providesTags: [
          {
            type: "Schedule",
            id: "BOARD",
          },
        ],
      },
    ),

    //************************************************************** */
    // Schedule RO

    scheduleRepairOrder: builder.mutation<
      ScheduleWorkBlock,
      ScheduleRepairOrderInput
    >({
      query: ({ organizationId, repairOrderId, data }) => ({
        url: `/organizations/${organizationId}/scheduling/repair-orders/${repairOrderId}`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<ScheduleWorkBlock>) =>
        response.data,

      invalidatesTags: (_result, _error, { repairOrderId }) => [
        {
          type: "Schedule",
          id: "BOARD",
        },

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

    //************************************************************** */
    // Reschedule RO

    rescheduleRepairOrder: builder.mutation<
      ScheduleWorkBlock,
      RescheduleRepairOrderInput
    >({
      query: ({ organizationId, repairOrderId, data }) => ({
        url: `/organizations/${organizationId}/scheduling/repair-orders/${repairOrderId}/reschedule`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<ScheduleWorkBlock>) =>
        response.data,

      invalidatesTags: (_result, _error, { repairOrderId }) => [
        {
          type: "Schedule",
          id: "BOARD",
        },

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

    //************************************************************** */
    // Cancel RO Schedule

    cancelRepairOrderSchedule: builder.mutation<
      ScheduleWorkBlock,
      CancelRepairOrderScheduleInput
    >({
      query: ({ organizationId, repairOrderId, notes }) => ({
        url: `/organizations/${organizationId}/scheduling/repair-orders/${repairOrderId}/cancel`,

        method: "POST",

        body: {
          notes,
        },
      }),

      transformResponse: (response: ApiSuccessResponse<ScheduleWorkBlock>) =>
        response.data,

      invalidatesTags: (_result, _error, { repairOrderId }) => [
        {
          type: "Schedule",
          id: "BOARD",
        },

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

    //************************************************************** */
    // List Service Appointments

    getServiceAppointments: builder.query<
      ServiceAppointment[],
      ListServiceAppointmentsInput
    >({
      query: ({ organizationId, search, status, start, end }) => ({
        url: `/organizations/${organizationId}/scheduling/appointments`,

        method: "GET",

        params: {
          ...(search
            ? {
                search,
              }
            : {}),

          ...(status
            ? {
                status,
              }
            : {}),

          ...(start
            ? {
                start,
              }
            : {}),

          ...(end
            ? {
                end,
              }
            : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<ServiceAppointment[]>) =>
        response.data,

      providesTags: (result) =>
        result
          ? [
              {
                type: "ServiceAppointment" as const,

                id: "LIST",
              },

              ...result.map((appointment) => ({
                type: "ServiceAppointment" as const,

                id: appointment.id,
              })),
            ]
          : [
              {
                type: "ServiceAppointment" as const,

                id: "LIST",
              },
            ],
    }),

    //************************************************************** */
    // Service Appointment Detail

    getServiceAppointment: builder.query<
      ServiceAppointment,
      ServiceAppointmentActionInput
    >({
      query: ({ organizationId, appointmentId }) => ({
        url: `/organizations/${organizationId}/scheduling/appointments/${appointmentId}`,

        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<ServiceAppointment>) =>
        response.data,

      providesTags: (_result, _error, { appointmentId }) => [
        {
          type: "ServiceAppointment",
          id: appointmentId,
        },
      ],
    }),

    //************************************************************** */
    // Create Service Appointment

    createServiceAppointment: builder.mutation<
      ServiceAppointment,
      CreateServiceAppointmentInput
    >({
      query: ({ organizationId, data }) => ({
        url: `/organizations/${organizationId}/scheduling/appointments`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<ServiceAppointment>) =>
        response.data,

      invalidatesTags: [
        {
          type: "ServiceAppointment",
          id: "LIST",
        },
      ],
    }),

    //************************************************************** */
    // Confirm Appointment

    confirmServiceAppointment: builder.mutation<
      ServiceAppointment,
      ServiceAppointmentActionInput
    >({
      query: ({ organizationId, appointmentId }) => ({
        url: `/organizations/${organizationId}/scheduling/appointments/${appointmentId}/confirm`,

        method: "POST",
      }),

      transformResponse: (response: ApiSuccessResponse<ServiceAppointment>) =>
        response.data,

      invalidatesTags: (_result, _error, { appointmentId }) => [
        {
          type: "ServiceAppointment",
          id: appointmentId,
        },

        {
          type: "ServiceAppointment",
          id: "LIST",
        },
      ],
    }),

    //************************************************************** */
    // Check In Appointment

    checkInServiceAppointment: builder.mutation<
      ServiceAppointment,
      ServiceAppointmentActionInput
    >({
      query: ({ organizationId, appointmentId }) => ({
        url: `/organizations/${organizationId}/scheduling/appointments/${appointmentId}/check-in`,

        method: "POST",
      }),

      transformResponse: (response: ApiSuccessResponse<ServiceAppointment>) =>
        response.data,

      invalidatesTags: (_result, _error, { appointmentId }) => [
        {
          type: "ServiceAppointment",
          id: appointmentId,
        },

        {
          type: "ServiceAppointment",
          id: "LIST",
        },
      ],
    }),

    //************************************************************** */
    // Cancel Appointment

    cancelServiceAppointment: builder.mutation<
      ServiceAppointment,
      CancelServiceAppointmentInput
    >({
      query: ({ organizationId, appointmentId, reason }) => ({
        url: `/organizations/${organizationId}/scheduling/appointments/${appointmentId}/cancel`,

        method: "POST",

        body: {
          ...(reason
            ? {
                reason,
              }
            : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<ServiceAppointment>) =>
        response.data,

      invalidatesTags: (_result, _error, { appointmentId }) => [
        {
          type: "ServiceAppointment",
          id: appointmentId,
        },

        {
          type: "ServiceAppointment",
          id: "LIST",
        },
      ],
    }),

    //************************************************************** */
    // Convert Appointment To Repair Order

    convertServiceAppointmentToRepairOrder: builder.mutation<
      ConvertServiceAppointmentResult,
      ServiceAppointmentActionInput
    >({
      query: ({ organizationId, appointmentId }) => ({
        url: `/organizations/${organizationId}/scheduling/appointments/${appointmentId}/convert-to-repair-order`,

        method: "POST",
      }),

      transformResponse: (
        response: ApiSuccessResponse<ConvertServiceAppointmentResult>,
      ) => response.data,

      invalidatesTags: (result, _error, { appointmentId }) => [
        {
          type: "ServiceAppointment",
          id: appointmentId,
        },

        {
          type: "ServiceAppointment",
          id: "LIST",
        },

        {
          type: "RepairOrder",
          id: "LIST",
        },

        ...(result
          ? [
              {
                type: "RepairOrder" as const,

                id: result.repairOrder.id,
              },
            ]
          : []),
      ],
    }),
  }),

  overrideExisting: false,
});

//************************************************************** */

export const {
  useGetSchedulingBoardQuery,

  useScheduleRepairOrderMutation,

  useRescheduleRepairOrderMutation,

  useCancelRepairOrderScheduleMutation,

  useGetServiceAppointmentsQuery,

  useGetServiceAppointmentQuery,

  useCreateServiceAppointmentMutation,

  useConfirmServiceAppointmentMutation,

  useCheckInServiceAppointmentMutation,

  useCancelServiceAppointmentMutation,

  useConvertServiceAppointmentToRepairOrderMutation,
} = schedulingApi;

//************************************************************** */
