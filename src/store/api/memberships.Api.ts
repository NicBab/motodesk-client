import type {
  MembershipListItem,
  MembershipListQuery,
} from "@/features/memberships/membership.types";

import { baseApi } from "./baseApi";

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export const membershipsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMemberships: builder.query<MembershipListItem[], MembershipListQuery>({
      query: ({ organizationId, role, status, search, page, pageSize }) => ({
        url: `/organizations/${organizationId}/memberships`,
        method: "GET",
        params: {
          ...(role ? { role } : {}),
          ...(status ? { status } : {}),
          ...(search ? { search } : {}),
          ...(page !== undefined ? { page } : {}),
          ...(pageSize !== undefined ? { pageSize } : {}),
        },
      }),

      transformResponse: (
        response: ApiSuccessResponse<{
          items: MembershipListItem[];
        }>,
      ) => response.data.items,
    }),
  }),
});

export const { useGetMembershipsQuery } = membershipsApi;
