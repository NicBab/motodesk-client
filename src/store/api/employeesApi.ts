import type {
  CreateEmployeeInput,
  Employee,
  EmployeeActionInput,
  EmployeeListQuery,
  UpdateEmployeeInput,
} from "@/features/employees/employee.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;

  data: T;
};

//************************************************************** */

export const employeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], EmployeeListQuery>({
      query: ({ organizationId, search, role, status, isSchedulable }) => ({
        url: `/organizations/${organizationId}/employees`,

        method: "GET",

        params: {
          ...(search
            ? {
                search,
              }
            : {}),

          ...(role
            ? {
                role,
              }
            : {}),

          ...(status
            ? {
                status,
              }
            : {}),

          ...(isSchedulable !== undefined
            ? {
                isSchedulable: String(isSchedulable),
              }
            : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<Employee[]>) =>
        response.data,

      providesTags: (result) =>
        result
          ? [
              {
                type: "Employee" as const,

                id: "LIST",
              },

              ...result.map((employee) => ({
                type: "Employee" as const,

                id: employee.id,
              })),
            ]
          : [
              {
                type: "Employee" as const,

                id: "LIST",
              },
            ],
    }),

    //************************************************************** */

    createEmployee: builder.mutation<Employee, CreateEmployeeInput>({
      query: ({ organizationId, data }) => ({
        url: `/organizations/${organizationId}/employees`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<Employee>) =>
        response.data,

      invalidatesTags: [
        {
          type: "Employee",

          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    updateEmployee: builder.mutation<Employee, UpdateEmployeeInput>({
      query: ({ organizationId, employeeId, data }) => ({
        url: `/organizations/${organizationId}/employees/${employeeId}`,

        method: "PATCH",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<Employee>) =>
        response.data,

      invalidatesTags: (_result, _error, { employeeId }) => [
        {
          type: "Employee",

          id: employeeId,
        },

        {
          type: "Employee",

          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    deactivateEmployee: builder.mutation<Employee, EmployeeActionInput>({
      query: ({ organizationId, employeeId }) => ({
        url: `/organizations/${organizationId}/employees/${employeeId}/deactivate`,

        method: "POST",

        body: {},
      }),

      transformResponse: (response: ApiSuccessResponse<Employee>) =>
        response.data,

      invalidatesTags: (_result, _error, { employeeId }) => [
        {
          type: "Employee",

          id: employeeId,
        },

        {
          type: "Employee",

          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    restoreEmployee: builder.mutation<Employee, EmployeeActionInput>({
      query: ({ organizationId, employeeId }) => ({
        url: `/organizations/${organizationId}/employees/${employeeId}/restore`,

        method: "POST",

        body: {},
      }),

      transformResponse: (response: ApiSuccessResponse<Employee>) =>
        response.data,

      invalidatesTags: (_result, _error, { employeeId }) => [
        {
          type: "Employee",

          id: employeeId,
        },

        {
          type: "Employee",

          id: "LIST",
        },
      ],
    }),
  }),
});

//************************************************************** */

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeactivateEmployeeMutation,
  useRestoreEmployeeMutation,
} = employeesApi;

//************************************************************** */
