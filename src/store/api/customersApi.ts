import type {
  ArchiveCustomerInput,
  CreateCustomerInput,
  Customer,
  CustomerListQuery,
  GetCustomerInput,
  UpdateCustomerInput,
} from "@/features/customers/customer.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

//************************************************************** */

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], CustomerListQuery>({
      query: ({ organizationId, search, type, isActive }) => ({
        url: `/organizations/${organizationId}/customers`,

        method: "GET",

        params: {
          ...(search ? { search } : {}),

          ...(type ? { type } : {}),

          ...(isActive !== undefined
            ? {
                isActive: String(isActive),
              }
            : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<Customer[]>) =>
        response.data,

      providesTags: (result) =>
        result
          ? [
              {
                type: "Customer" as const,
                id: "LIST",
              },

              ...result.map((customer) => ({
                type: "Customer" as const,
                id: customer.id,
              })),
            ]
          : [
              {
                type: "Customer" as const,
                id: "LIST",
              },
            ],
    }),

    //************************************************************** */

    getCustomer: builder.query<Customer, GetCustomerInput>({
      query: ({ organizationId, customerId }) => ({
        url: `/organizations/${organizationId}/customers/${customerId}`,

        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<Customer>) =>
        response.data,

      providesTags: (_result, _error, { customerId }) => [
        {
          type: "Customer",
          id: customerId,
        },
      ],
    }),

    //************************************************************** */

    createCustomer: builder.mutation<Customer, CreateCustomerInput>({
      query: ({ organizationId, ...data }) => ({
        url: `/organizations/${organizationId}/customers`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<Customer>) =>
        response.data,

      invalidatesTags: [
        {
          type: "Customer",
          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    updateCustomer: builder.mutation<Customer, UpdateCustomerInput>({
      query: ({ organizationId, customerId, data }) => ({
        url: `/organizations/${organizationId}/customers/${customerId}`,

        method: "PATCH",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<Customer>) =>
        response.data,

      invalidatesTags: (_result, _error, { customerId }) => [
        {
          type: "Customer",
          id: customerId,
        },

        {
          type: "Customer",
          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    archiveCustomer: builder.mutation<Customer, ArchiveCustomerInput>({
      query: ({ organizationId, customerId }) => ({
        url: `/organizations/${organizationId}/customers/${customerId}/archive`,

        method: "POST",

        body: {},
      }),

      transformResponse: (response: ApiSuccessResponse<Customer>) =>
        response.data,

      invalidatesTags: (_result, _error, { customerId }) => [
        {
          type: "Customer",
          id: customerId,
        },

        {
          type: "Customer",
          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    restoreCustomer: builder.mutation<Customer, ArchiveCustomerInput>({
      query: ({ organizationId, customerId }) => ({
        url: `/organizations/${organizationId}/customers/${customerId}/restore`,

        method: "POST",

        body: {},
      }),

      transformResponse: (response: ApiSuccessResponse<Customer>) =>
        response.data,

      invalidatesTags: (_result, _error, { customerId }) => [
        {
          type: "Customer",
          id: customerId,
        },

        {
          type: "Customer",
          id: "LIST",
        },
      ],
    }),
  }),
});

//************************************************************** */

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useArchiveCustomerMutation,
  useRestoreCustomerMutation,
} = customersApi;

//************************************************************** */
