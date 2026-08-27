import type {
  ArchiveVendorInput,
  CreateVendorInput,
  GetVendorInput,
  RestoreVendorInput,
  UpdateVendorInput,
  Vendor,
  VendorListQuery,
} from "@/features/parts/vendor.types";

import { baseApi } from "./baseApi";

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export const vendorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query<Vendor[], VendorListQuery>({
      query: ({ organizationId, search, isActive }) => ({
        url: `/organizations/${organizationId}/vendors`,

        method: "GET",

        params: {
          ...(search
            ? {
                search,
              }
            : {}),

          ...(isActive !== undefined
            ? {
                isActive: String(isActive),
              }
            : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<Vendor[]>) =>
        response.data,

      providesTags: (result) =>
        result
          ? [
              {
                type: "Vendor" as const,

                id: "LIST",
              },

              ...result.map((vendor) => ({
                type: "Vendor" as const,

                id: vendor.id,
              })),
            ]
          : [
              {
                type: "Vendor" as const,

                id: "LIST",
              },
            ],
    }),

    getVendor: builder.query<Vendor, GetVendorInput>({
      query: ({ organizationId, vendorId }) => ({
        url: `/organizations/${organizationId}/vendors/${vendorId}`,

        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<Vendor>) =>
        response.data,

      providesTags: (_result, _error, { vendorId }) => [
        {
          type: "Vendor",
          id: vendorId,
        },
      ],
    }),

    createVendor: builder.mutation<Vendor, CreateVendorInput>({
      query: ({ organizationId, ...data }) => ({
        url: `/organizations/${organizationId}/vendors`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<Vendor>) =>
        response.data,

      invalidatesTags: [
        {
          type: "Vendor",
          id: "LIST",
        },
      ],
    }),

    updateVendor: builder.mutation<Vendor, UpdateVendorInput>({
      query: ({ organizationId, vendorId, data }) => ({
        url: `/organizations/${organizationId}/vendors/${vendorId}`,

        method: "PATCH",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<Vendor>) =>
        response.data,

      invalidatesTags: (_result, _error, { vendorId }) => [
        {
          type: "Vendor",
          id: vendorId,
        },

        {
          type: "Vendor",
          id: "LIST",
        },
      ],
    }),

    archiveVendor: builder.mutation<Vendor, ArchiveVendorInput>({
      query: ({ organizationId, vendorId }) => ({
        url: `/organizations/${organizationId}/vendors/${vendorId}/archive`,

        method: "POST",

        body: {},
      }),

      transformResponse: (response: ApiSuccessResponse<Vendor>) =>
        response.data,

      invalidatesTags: (_result, _error, { vendorId }) => [
        {
          type: "Vendor",
          id: vendorId,
        },

        {
          type: "Vendor",
          id: "LIST",
        },
      ],
    }),

    restoreVendor: builder.mutation<Vendor, RestoreVendorInput>({
      query: ({ organizationId, vendorId }) => ({
        url: `/organizations/${organizationId}/vendors/${vendorId}/restore`,

        method: "POST",

        body: {},
      }),

      transformResponse: (response: ApiSuccessResponse<Vendor>) =>
        response.data,

      invalidatesTags: (_result, _error, { vendorId }) => [
        {
          type: "Vendor",
          id: vendorId,
        },

        {
          type: "Vendor",
          id: "LIST",
        },
      ],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useArchiveVendorMutation,
  useRestoreVendorMutation,
} = vendorsApi;
