import type {
  ArchiveVehicleInput,
  CreateVehicleInput,
  GetVehicleInput,
  UpdateVehicleInput,
  Vehicle,
  VehicleListQuery,
} from "@/features/vehicles/vehicle.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

//************************************************************** */

export const vehiclesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicles: builder.query<Vehicle[], VehicleListQuery>({
      query: ({
        organizationId,
        search,
        customerId,
        type,
        classification,
        inventoryStatus,
        isActive,
      }) => ({
        url: `/organizations/${organizationId}/vehicles`,

        method: "GET",

        params: {
          ...(search ? { search } : {}),

          ...(customerId ? { customerId } : {}),

          ...(type ? { type } : {}),

          ...(classification ? { classification } : {}),

          ...(inventoryStatus ? { inventoryStatus } : {}),

          ...(isActive !== undefined
            ? {
                isActive: String(isActive),
              }
            : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<Vehicle[]>) =>
        response.data,

      providesTags: (result) =>
        result
          ? [
              {
                type: "Vehicle" as const,
                id: "LIST",
              },

              ...result.map((vehicle) => ({
                type: "Vehicle" as const,
                id: vehicle.id,
              })),
            ]
          : [
              {
                type: "Vehicle" as const,
                id: "LIST",
              },
            ],
    }),

    //************************************************************** */

    getVehicle: builder.query<Vehicle, GetVehicleInput>({
      query: ({ organizationId, vehicleId }) => ({
        url: `/organizations/${organizationId}/vehicles/${vehicleId}`,

        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<Vehicle>) =>
        response.data,

      providesTags: (_result, _error, { vehicleId }) => [
        {
          type: "Vehicle",
          id: vehicleId,
        },
      ],
    }),

    //************************************************************** */

    createVehicle: builder.mutation<Vehicle, CreateVehicleInput>({
      query: ({ organizationId, ...data }) => ({
        url: `/organizations/${organizationId}/vehicles`,

        method: "POST",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<Vehicle>) =>
        response.data,

      invalidatesTags: [
        {
          type: "Vehicle",
          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    updateVehicle: builder.mutation<Vehicle, UpdateVehicleInput>({
      query: ({ organizationId, vehicleId, data }) => ({
        url: `/organizations/${organizationId}/vehicles/${vehicleId}`,

        method: "PATCH",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<Vehicle>) =>
        response.data,

      invalidatesTags: (_result, _error, { vehicleId }) => [
        {
          type: "Vehicle",
          id: vehicleId,
        },

        {
          type: "Vehicle",
          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    archiveVehicle: builder.mutation<Vehicle, ArchiveVehicleInput>({
      query: ({ organizationId, vehicleId }) => ({
        url: `/organizations/${organizationId}/vehicles/${vehicleId}/archive`,

        method: "POST",

        body: {},
      }),

      transformResponse: (response: ApiSuccessResponse<Vehicle>) =>
        response.data,

      invalidatesTags: (_result, _error, { vehicleId }) => [
        {
          type: "Vehicle",
          id: vehicleId,
        },

        {
          type: "Vehicle",
          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    restoreVehicle: builder.mutation<Vehicle, ArchiveVehicleInput>({
      query: ({ organizationId, vehicleId }) => ({
        url: `/organizations/${organizationId}/vehicles/${vehicleId}/restore`,
        method: "POST",
        body: {},
      }),

      transformResponse: (response: ApiSuccessResponse<Vehicle>) =>
        response.data,

      invalidatesTags: (_result, _error, { vehicleId }) => [
        {
          type: "Vehicle",
          id: vehicleId,
        },
        {
          type: "Vehicle",
          id: "LIST",
        },
      ],
    }),
  }),
});

//************************************************************** */

export const {
  useGetVehiclesQuery,
  useGetVehicleQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useArchiveVehicleMutation,
  useRestoreVehicleMutation,
} = vehiclesApi;

//************************************************************** */
