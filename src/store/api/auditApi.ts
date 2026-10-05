import type {
  AuditLogFilterOptions,
  AuditLogFilterOptionsInput,
  AuditLogListInput,
  AuditLogListResponse,
} from "@/features/settings/audit-log.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

//************************************************************** */

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      AuditLogListResponse,
      AuditLogListInput
    >({
      query: ({
        organizationId,
        page,
        pageSize,
        search,
        action,
        resourceType,
        resourceId,
        actorUserId,
        createdFrom,
        createdBefore,
      }) => ({
        url: `/organizations/${organizationId}/audit`,

        method: "GET",

        params: {
          page,
          pageSize,

          ...(search !== undefined
            ? { search }
            : {}),

          ...(action !== undefined
            ? { action }
            : {}),

          ...(resourceType !== undefined
            ? { resourceType }
            : {}),

          ...(resourceId !== undefined
            ? { resourceId }
            : {}),

          ...(actorUserId !== undefined
            ? { actorUserId }
            : {}),

          ...(createdFrom !== undefined
            ? { createdFrom }
            : {}),

          ...(createdBefore !== undefined
            ? { createdBefore }
            : {}),
        },
      }),

      transformResponse: (
        response: ApiSuccessResponse<AuditLogListResponse>,
      ) => response.data,

      // Fetch current events whenever the viewer mounts or its
      // organization/filter/page arguments change.
      keepUnusedDataFor: 0,
    }),

    //************************************************************** */

    getAuditLogFilterOptions: builder.query<
      AuditLogFilterOptions,
      AuditLogFilterOptionsInput
    >({
      query: ({ organizationId }) => ({
        url: `/organizations/${organizationId}/audit/filter-options`,

        method: "GET",
      }),

      transformResponse: (
        response: ApiSuccessResponse<AuditLogFilterOptions>,
      ) => response.data,

      keepUnusedDataFor: 0,
    }),
  }),

  overrideExisting: false,
});

//************************************************************** */

export const {
  useGetAuditLogsQuery,
  useGetAuditLogFilterOptionsQuery,
} = auditApi;

//************************************************************** */