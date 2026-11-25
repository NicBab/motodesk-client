
import type {
  CreateMembershipInvitationInput,
  CreateMembershipInvitationResult,
  MembershipInvitation,
} from "@/features/membership-invitations/membership-invitation.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type MembershipInvitationRecord = MembershipInvitation & {
  employeeId?: string | null;
  acceptedAt: string | null;
  revokedAt: string | null;
};

export type MembershipInvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "EXPIRED"
  | "REVOKED";

export type MembershipInvitationListQuery = {
  organizationId: string;
  page?: number;
  pageSize?: number;
};

export type MembershipInvitationListResult = {
  items: MembershipInvitationRecord[];

  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type MembershipInvitationActionInput = {
  organizationId: string;
  invitationId: string;
};

//************************************************************** */

export function getMembershipInvitationStatus(
  invitation: MembershipInvitationRecord,
): MembershipInvitationStatus {
  if (invitation.acceptedAt) {
    return "ACCEPTED";
  }

  if (invitation.revokedAt) {
    return "REVOKED";
  }

  if (
    new Date(invitation.expiresAt).getTime() <= Date.now()
  ) {
    return "EXPIRED";
  }

  return "PENDING";
}

//************************************************************** */

export const membershipInvitationsApi =
  baseApi.injectEndpoints({
    endpoints: (builder) => ({
      getMembershipInvitations: builder.query<
        MembershipInvitationListResult,
        MembershipInvitationListQuery
      >({
        query: ({
          organizationId,
          page = 1,
          pageSize = 25,
        }) => ({
          url: `/organizations/${organizationId}/membership-invitations`,

          method: "GET",

          params: {
            page,
            pageSize,
          },
        }),

        transformResponse: (
          response: ApiSuccessResponse<MembershipInvitationListResult>,
        ) => response.data,

        providesTags: (result, _error, { organizationId }) => [
          {
            type: "MembershipInvitation" as const,
            id: `LIST-${organizationId}`,
          },
          {
            type: "MembershipInvitation" as const,
            id: "LIST",
          },
          ...(result?.items.map((invitation) => ({
            type: "MembershipInvitation" as const,
            id: invitation.id,
          })) ?? []),
        ],
      }),

      //************************************************************** */

      createMembershipInvitation: builder.mutation<
        CreateMembershipInvitationResult,
        CreateMembershipInvitationInput
      >({
        query: ({
          organizationId,
          employeeId,
          email,
          role,
        }) => ({
          url: `/organizations/${organizationId}/membership-invitations`,

          method: "POST",

          body: {
            email,
            role,

            ...(employeeId
              ? {
                  employeeId,
                }
              : {}),
          },
        }),

        transformResponse: (
          response: ApiSuccessResponse<CreateMembershipInvitationResult>,
        ) => response.data,

        invalidatesTags: (
          _result,
          error,
          { organizationId },
        ) =>
          error
            ? []
            : [
                {
                  type: "MembershipInvitation",
                  id: `LIST-${organizationId}`,
                },
                {
                  type: "MembershipInvitation",
                  id: "LIST",
                },
              ],
      }),

      //************************************************************** */

      refreshMembershipInvitation: builder.mutation<
        CreateMembershipInvitationResult,
        MembershipInvitationActionInput
      >({
        query: ({
          organizationId,
          invitationId,
        }) => ({
          url: `/organizations/${organizationId}/membership-invitations/${invitationId}/refresh`,

          method: "POST",
        }),

        transformResponse: (
          response: ApiSuccessResponse<CreateMembershipInvitationResult>,
        ) => response.data,

        invalidatesTags: (
          _result,
          error,
          { organizationId, invitationId },
        ) =>
          error
            ? []
            : [
                {
                  type: "MembershipInvitation",
                  id: invitationId,
                },
                {
                  type: "MembershipInvitation",
                  id: `LIST-${organizationId}`,
                },
                {
                  type: "MembershipInvitation",
                  id: "LIST",
                },
              ],
      }),

      //************************************************************** */

      revokeMembershipInvitation: builder.mutation<
        MembershipInvitationRecord,
        MembershipInvitationActionInput
      >({
        query: ({
          organizationId,
          invitationId,
        }) => ({
          url: `/organizations/${organizationId}/membership-invitations/${invitationId}`,

          method: "DELETE",
        }),

        transformResponse: (
          response: ApiSuccessResponse<MembershipInvitationRecord>,
        ) => response.data,

        invalidatesTags: (
          _result,
          error,
          { organizationId, invitationId },
        ) =>
          error
            ? []
            : [
                {
                  type: "MembershipInvitation",
                  id: invitationId,
                },
                {
                  type: "MembershipInvitation",
                  id: `LIST-${organizationId}`,
                },
                {
                  type: "MembershipInvitation",
                  id: "LIST",
                },
              ],
      }),
    }),
  });

//************************************************************** */

export const {
  useGetMembershipInvitationsQuery,
  useLazyGetMembershipInvitationsQuery,
  useCreateMembershipInvitationMutation,
  useRefreshMembershipInvitationMutation,
  useRevokeMembershipInvitationMutation,
} = membershipInvitationsApi;

//************************************************************** */
