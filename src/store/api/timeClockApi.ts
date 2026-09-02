import type {
  EmployeeClockStatus,
  EmployeeTimeEntry,
  TimeClockActionInput,
  TimeClockEmployeeInput,
  TimeClockReport,
  TimeClockReportQuery,
} from "@/features/time-clock/time-clock.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;

  data: T;
};

//************************************************************** */

export type CreateManualTimeEntryInput = {
  organizationId: string;

  employeeId: string;

  clockInAt: string;

  clockOutAt: string;

  breakMinutes: number;

  notes?: string;

  reason: string;
};

//************************************************************** */

export type CorrectTimeEntryInput = {
  organizationId: string;

  timeEntryId: string;

  employeeId: string;

  clockInAt?: string;

  clockOutAt?: string | null;

  breakMinutes?: number;

  notes?: string | null;

  reason: string;
};

//************************************************************** */

export const timeClockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentlyClockedIn: builder.query<
      EmployeeTimeEntry[],
      {
        organizationId: string;
      }
    >({
      query: ({ organizationId }) => ({
        url: `/organizations/${organizationId}/time-clock/current`,

        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<EmployeeTimeEntry[]>) =>
        response.data,

      providesTags: [
        {
          type: "TimeClock",

          id: "CURRENT",
        },
      ],
    }),

    //************************************************************** */

    getEmployeeClockStatus: builder.query<
      EmployeeClockStatus,
      TimeClockEmployeeInput
    >({
      query: ({ organizationId, employeeId }) => ({
        url: `/organizations/${organizationId}/time-clock/employees/${employeeId}/status`,

        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<EmployeeClockStatus>) =>
        response.data,

      providesTags: (_result, _error, { employeeId }) => [
        {
          type: "TimeClock",

          id: employeeId,
        },
      ],
    }),

    //************************************************************** */

    getEmployeeTimeHistory: builder.query<
      EmployeeTimeEntry[],
      TimeClockEmployeeInput
    >({
      query: ({ organizationId, employeeId }) => ({
        url: `/organizations/${organizationId}/time-clock/employees/${employeeId}/history`,

        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<EmployeeTimeEntry[]>) =>
        response.data,

      providesTags: (_result, _error, { employeeId }) => [
        {
          type: "TimeClock",

          id: `HISTORY-${employeeId}`,
        },
      ],
    }),

    //************************************************************** */

    getTimeClockReport: builder.query<TimeClockReport, TimeClockReportQuery>({
      query: ({
        organizationId,
        range,
        employeeId,
        includeInactive,
        anchorDate,
        startDate,
        endDate,
      }) => ({
        url: `/organizations/${organizationId}/time-clock/report`,

        method: "GET",

        params: {
          range,

          includeInactive: String(includeInactive ?? false),

          ...(employeeId
            ? {
                employeeId,
              }
            : {}),

          ...(anchorDate
            ? {
                anchorDate,
              }
            : {}),

          ...(startDate
            ? {
                startDate,
              }
            : {}),

          ...(endDate
            ? {
                endDate,
              }
            : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<TimeClockReport>) =>
        response.data,

      providesTags: [
        {
          type: "TimeClock",

          id: "REPORT",
        },
      ],
    }),

    //************************************************************** */

    clockEmployeeIn: builder.mutation<EmployeeTimeEntry, TimeClockActionInput>({
      query: ({ organizationId, employeeId, pin }) => ({
        url: `/organizations/${organizationId}/time-clock/employees/${employeeId}/clock-in`,

        method: "POST",

        body: {
          pin,
        },
      }),

      transformResponse: (response: ApiSuccessResponse<EmployeeTimeEntry>) =>
        response.data,

      invalidatesTags: (_result, _error, { employeeId }) => [
        {
          type: "TimeClock",

          id: "CURRENT",
        },

        {
          type: "TimeClock",

          id: employeeId,
        },

        {
          type: "TimeClock",

          id: `HISTORY-${employeeId}`,
        },

        {
          type: "TimeClock",

          id: "REPORT",
        },
      ],
    }),

    //************************************************************** */

    clockEmployeeOut: builder.mutation<EmployeeTimeEntry, TimeClockActionInput>(
      {
        query: ({ organizationId, employeeId, pin }) => ({
          url: `/organizations/${organizationId}/time-clock/employees/${employeeId}/clock-out`,

          method: "POST",

          body: {
            pin,
          },
        }),

        transformResponse: (response: ApiSuccessResponse<EmployeeTimeEntry>) =>
          response.data,

        invalidatesTags: (_result, _error, { employeeId }) => [
          {
            type: "TimeClock",

            id: "CURRENT",
          },

          {
            type: "TimeClock",

            id: employeeId,
          },

          {
            type: "TimeClock",

            id: `HISTORY-${employeeId}`,
          },

          {
            type: "TimeClock",

            id: "REPORT",
          },
        ],
      },
    ),

    //************************************************************** */

    createManualTimeEntry: builder.mutation<
      EmployeeTimeEntry,
      CreateManualTimeEntryInput
    >({
      query: ({ organizationId, ...data }) => ({
        url: `/organizations/${organizationId}/time-clock/entries/manual`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<EmployeeTimeEntry>) =>
        response.data,

      invalidatesTags: (_result, _error, { employeeId }) => [
        {
          type: "TimeClock",

          id: `HISTORY-${employeeId}`,
        },

        {
          type: "TimeClock",

          id: "CURRENT",
        },

        {
          type: "TimeClock",

          id: "REPORT",
        },
      ],
    }),

    //************************************************************** */

    correctTimeEntry: builder.mutation<
      EmployeeTimeEntry,
      CorrectTimeEntryInput
    >({
      query: ({
        organizationId,
        timeEntryId,
        employeeId: _employeeId,
        ...data
      }) => ({
        url: `/organizations/${organizationId}/time-clock/entries/${timeEntryId}/correction`,

        method: "PATCH",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<EmployeeTimeEntry>) =>
        response.data,

      invalidatesTags: (_result, _error, { employeeId }) => [
        {
          type: "TimeClock",

          id: "CURRENT",
        },

        {
          type: "TimeClock",

          id: `HISTORY-${employeeId}`,
        },

        {
          type: "TimeClock",

          id: "REPORT",
        },
      ],
    }),
  }),
});

//************************************************************** */

export const {
  useGetCurrentlyClockedInQuery,
  useGetEmployeeClockStatusQuery,
  useGetEmployeeTimeHistoryQuery,
  useGetTimeClockReportQuery,
  useClockEmployeeInMutation,
  useClockEmployeeOutMutation,
  useCreateManualTimeEntryMutation,
  useCorrectTimeEntryMutation,
} = timeClockApi;

//************************************************************** */
