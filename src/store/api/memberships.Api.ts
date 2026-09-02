import type {
  MembershipListItem,
  MembershipListQuery,
  MembershipRole,
  MembershipStatus,
} from "@/features/memberships/membership.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;

  data: T;
};

//************************************************************** */

type CreateMembershipInput = {
  organizationId: string;

  email: string;

  role: MembershipRole;
};

//************************************************************** */

type UpdateMembershipInput = {
  organizationId: string;

  membershipId: string;

  data: {
    role?: MembershipRole;

    status?: MembershipStatus;
  };
};

//************************************************************** */

export const membershipsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMemberships: builder.query<MembershipListItem[], MembershipListQuery>({
      query: ({ organizationId, role, status, search, page, pageSize }) => ({
        url: `/organizations/${organizationId}/memberships`,

        method: "GET",

        params: {
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

          ...(search
            ? {
                search,
              }
            : {}),

          ...(page !== undefined
            ? {
                page,
              }
            : {}),

          ...(pageSize !== undefined
            ? {
                pageSize,
              }
            : {}),
        },
      }),

      transformResponse: (
        response: ApiSuccessResponse<{
          items: MembershipListItem[];
        }>,
      ) => response.data.items,

      providesTags: (result) =>
        result
          ? [
              {
                type: "Membership" as const,

                id: "LIST",
              },

              ...result.map((membership) => ({
                type: "Membership" as const,

                id: membership.id,
              })),
            ]
          : [
              {
                type: "Membership" as const,

                id: "LIST",
              },
            ],
    }),

    //************************************************************** */

    createMembership: builder.mutation<
      MembershipListItem,
      CreateMembershipInput
    >({
      query: ({ organizationId, email, role }) => ({
        url: `/organizations/${organizationId}/memberships`,

        method: "POST",

        body: {
          email,

          role,
        },
      }),

      transformResponse: (response: ApiSuccessResponse<MembershipListItem>) =>
        response.data,

      invalidatesTags: [
        {
          type: "Membership",

          id: "LIST",
        },
      ],
    }),

    //************************************************************** */

    updateMembership: builder.mutation<
      MembershipListItem,
      UpdateMembershipInput
    >({
      query: ({ organizationId, membershipId, data }) => ({
        url: `/organizations/${organizationId}/memberships/${membershipId}`,

        method: "PATCH",

        body: data,
      }),

      transformResponse: (response: ApiSuccessResponse<MembershipListItem>) =>
        response.data,

      invalidatesTags: (_result, _error, { membershipId }) => [
        {
          type: "Membership",

          id: membershipId,
        },

        {
          type: "Membership",

          id: "LIST",
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
  useGetMembershipsQuery,
  useCreateMembershipMutation,
  useUpdateMembershipMutation,
} = membershipsApi;

//************************************************************** */
