import type {
  CreateMembershipInvitationInput,
  CreateMembershipInvitationResult,
} from "@/features/membership-invitations/membership-invitation.types";

import {
  baseApi,
} from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;

  data: T;
};

//************************************************************** */

export const membershipInvitationsApi =
  baseApi.injectEndpoints({
    endpoints: (
      builder,
    ) => ({
      createMembershipInvitation:
        builder.mutation<
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

            method:
              "POST",

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
            response:
              ApiSuccessResponse<CreateMembershipInvitationResult>,
          ) =>
            response.data,

          invalidatesTags: [
            {
              type:
                "MembershipInvitation",

              id:
                "LIST",
            },
          ],
        }),
    }),
  });

//************************************************************** */

export const {
  useCreateMembershipInvitationMutation,
} = membershipInvitationsApi;

//************************************************************** */