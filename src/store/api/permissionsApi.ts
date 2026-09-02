import type {
  MembershipPermissionInput,
  MembershipPermissions,
  PermissionCatalog,
  UpdateMembershipPermissionsInput,
} from "@/features/permissions/permission.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;

  data: T;
};

//************************************************************** */

export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPermissionCatalog: builder.query<
      PermissionCatalog,
      {
        organizationId: string;
      }
    >({
      query: ({ organizationId }) => ({
        url: `/organizations/${organizationId}/permission-catalog`,

        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<PermissionCatalog>) =>
        response.data,

      providesTags: [
        {
          type: "Permission",

          id: "CATALOG",
        },
      ],
    }),

    //************************************************************** */

    getMembershipPermissions: builder.query<
      string[],
      MembershipPermissionInput
    >({
      query: ({ organizationId, membershipId }) => ({
        url: `/organizations/${organizationId}/memberships/${membershipId}/permissions`,

        method: "GET",
      }),

      transformResponse: (
        response: ApiSuccessResponse<MembershipPermissions>,
      ) => response.data.permissions,

      providesTags: (_result, _error, { membershipId }) => [
        {
          type: "Permission",

          id: membershipId,
        },
      ],
    }),

    //************************************************************** */

    updateMembershipPermissions: builder.mutation<
      string[],
      UpdateMembershipPermissionsInput
    >({
      query: ({ organizationId, membershipId, permissions }) => ({
        url: `/organizations/${organizationId}/memberships/${membershipId}/permissions`,

        method: "PUT",

        body: {
          permissions,
        },
      }),

      transformResponse: (
        response: ApiSuccessResponse<MembershipPermissions>,
      ) => response.data.permissions,

      invalidatesTags: (_result, _error, { membershipId }) => [
        {
          type: "Permission",

          id: membershipId,
        },

        {
          type: "Auth",
        },
      ],
    }),
  }),
});

//************************************************************** */

export const {
  useGetPermissionCatalogQuery,
  useGetMembershipPermissionsQuery,
  useUpdateMembershipPermissionsMutation,
} = permissionsApi;

//************************************************************** */
