import type {
  AdjustPartInventoryInput,
  ArchivePartInput,
  CreatePartInput,
  CycleCountPartInventoryInput,
  GetPartInput,
  Part,
  PartInventoryMutationResult,
  PartListQuery,
  UpdatePartInput,
} from "@/features/parts/part.types";

import { baseApi } from "./baseApi";

import type {
  PartOrderDemandItem,
  PartOrderDemandQuery,
} from "@/features/parts/part-order-demand.types";

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export const partsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getParts: builder.query<Part[], PartListQuery>({
      query: ({
        organizationId,
        search,
        brand,
        category,
        lowStock,
        isActive,
      }) => ({
        url: `/organizations/${organizationId}/parts`,

        method: "GET",

        params: {
          ...(search ? { search } : {}),

          ...(brand ? { brand } : {}),

          ...(category ? { category } : {}),

          ...(lowStock !== undefined
            ? {
                lowStock: String(lowStock),
              }
            : {}),

          ...(isActive !== undefined
            ? {
                isActive: String(isActive),
              }
            : {}),
        },
      }),

      transformResponse: (response: ApiSuccessResponse<Part[]>) =>
        response.data,

      providesTags: (result) =>
        result
          ? [
              {
                type: "Part" as const,
                id: "LIST",
              },

              ...result.map((part) => ({
                type: "Part" as const,
                id: part.id,
              })),
            ]
          : [
              {
                type: "Part" as const,
                id: "LIST",
              },
            ],
    }),

    getPartOrderDemand: builder.query<
      PartOrderDemandItem[],
      PartOrderDemandQuery
    >({
      query: ({ organizationId, search }) => ({
        url: `/organizations/${organizationId}/parts/order-demand`,

        method: "GET",

        params: {
          ...(search
            ? {
                search,
              }
            : {}),
        },
      }),

      transformResponse: (
        response: ApiSuccessResponse<PartOrderDemandItem[]>,
      ) => response.data,

      providesTags: [
        {
          type: "RepairOrder",
          id: "PART_ORDER_DEMAND",
        },
      ],
    }),

    getPart: builder.query<Part, GetPartInput>({
      query: ({ organizationId, partId }) => ({
        url: `/organizations/${organizationId}/parts/${partId}`,

        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<Part>) => response.data,

      providesTags: (_result, _error, { partId }) => [
        {
          type: "Part",
          id: partId,
        },
      ],
    }),

    createPart: builder.mutation<Part, CreatePartInput>({
      query: ({ organizationId, ...data }) => ({
        url: `/organizations/${organizationId}/parts`,

        method: "POST",

        body: {
          alternatePartNumbers: [],

          qtyOnHand: 0,

          qtyAllocated: 0,

          qtyOnOrder: 0,

          reorderPoint: 0,

          costPrice: 0,

          sellPrice: 0,

          ...data,
        },
      }),

      transformResponse: (response: ApiSuccessResponse<Part>) => response.data,

      invalidatesTags: [
        {
          type: "Part",
          id: "LIST",
        },
      ],
    }),

    updatePart: builder.mutation<Part, UpdatePartInput>({
      query: ({ organizationId, partId, data }) => ({
        url: `/organizations/${organizationId}/parts/${partId}`,

        method: "PATCH",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<Part>) => response.data,

      invalidatesTags: (_result, _error, { partId }) => [
        {
          type: "Part",
          id: partId,
        },
        {
          type: "Part",
          id: "LIST",
        },
      ],
    }),

    archivePart: builder.mutation<Part, ArchivePartInput>({
      query: ({ organizationId, partId }) => ({
        url: `/organizations/${organizationId}/parts/${partId}/archive`,

        method: "POST",

        body: {},
      }),

      transformResponse: (response: ApiSuccessResponse<Part>) => response.data,

      invalidatesTags: (_result, _error, { partId }) => [
        {
          type: "Part",
          id: partId,
        },
        {
          type: "Part",
          id: "LIST",
        },
      ],
    }),

    adjustPartInventory: builder.mutation<
      PartInventoryMutationResult,
      AdjustPartInventoryInput
    >({
      query: ({ organizationId, partId, quantity, notes }) => ({
        url: `/organizations/${organizationId}/parts/${partId}/inventory/adjust`,

        method: "POST",

        body: {
          quantity,

          ...(notes ? { notes } : {}),
        },
      }),

      transformResponse: (
        response: ApiSuccessResponse<PartInventoryMutationResult>,
      ) => response.data,

      invalidatesTags: (_result, _error, { partId }) => [
        {
          type: "Part",
          id: partId,
        },
        {
          type: "Inventory",
          id: partId,
        },
        {
          type: "Part",
          id: "LIST",
        },
      ],
    }),

    cycleCountPartInventory: builder.mutation<
      PartInventoryMutationResult,
      CycleCountPartInventoryInput
    >({
      query: ({ organizationId, partId, countedQuantity, notes }) => ({
        url: `/organizations/${organizationId}/parts/${partId}/inventory/cycle-count`,

        method: "POST",

        body: {
          countedQuantity,

          ...(notes ? { notes } : {}),
        },
      }),

      transformResponse: (
        response: ApiSuccessResponse<PartInventoryMutationResult>,
      ) => response.data,

      invalidatesTags: (_result, _error, { partId }) => [
        {
          type: "Part",
          id: partId,
        },
        {
          type: "Inventory",
          id: partId,
        },
        {
          type: "Part",
          id: "LIST",
        },
      ],
    }),
  }),
});

export const {
  useGetPartsQuery,
  useGetPartQuery,
  useCreatePartMutation,
  useUpdatePartMutation,
  useArchivePartMutation,
  useAdjustPartInventoryMutation,
  useCycleCountPartInventoryMutation,
  useGetPartOrderDemandQuery,
} = partsApi;
