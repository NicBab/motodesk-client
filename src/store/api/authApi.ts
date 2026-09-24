//************************************************************** */

import type {
  AuthSession,
  AuthenticatedUser,
  DisplayMode,
} from "@/features/auth/auth.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

//************************************************************** */

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  jobTitle?: string | null;
  preferredTimezone?: string;
  displayMode?: DisplayMode;
};

//************************************************************** */

type UpdateProfileResponse = {
  message: string;
  user: AuthenticatedUser;
};

//************************************************************** */

export type RequestPasswordResetInput = {
  email: string;
};

//************************************************************** */

export type RequestPasswordResetResponse = {
  message: string;
};

//************************************************************** */

export type ResetPasswordInput = {
  token: string;

  password: string;

  confirmPassword: string;
};

//************************************************************** */

export type ResetPasswordResponse = {
  message: string;
};

//************************************************************** */

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<AuthSession, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),

      transformResponse: (response: ApiSuccessResponse<AuthSession>) =>
        response.data,

      providesTags: ["Auth"],
    }),

    //************************************************************** */

    refreshSession: builder.mutation<AuthSession, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),

      transformResponse: (response: ApiSuccessResponse<AuthSession>) =>
        response.data,

      async onQueryStarted(_argument, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            authApi.util.updateQueryData(
              "getCurrentUser",
              undefined,
              () => data,
            ),
          );
        } catch {
          // The session-expiration manager handles refresh failure.
        }
      },
    }),

    //************************************************************** */

    updateProfile: builder.mutation<UpdateProfileResponse, UpdateProfileInput>({
      query: (body) => ({
        url: "/auth/profile",
        method: "PATCH",
        body,
      }),

      transformResponse: (
        response: ApiSuccessResponse<UpdateProfileResponse>,
      ) => response.data,

      invalidatesTags: ["Auth"],
    }),
    //************************************************************** */

    requestPasswordReset: builder.mutation<
      RequestPasswordResetResponse,
      RequestPasswordResetInput
    >({
      query: (body) => ({
        url: "/auth/request-password-reset",
        method: "POST",
        body,
      }),

      transformResponse: (
        response: ApiSuccessResponse<RequestPasswordResetResponse>,
      ) => response.data,
    }),

    //************************************************************** */

    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordInput>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),

      transformResponse: (
        response: ApiSuccessResponse<ResetPasswordResponse>,
      ) => response.data,
    }),
  }),
});

//************************************************************** */

export const {
  useGetCurrentUserQuery,
  useRefreshSessionMutation,
  useUpdateProfileMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} = authApi;

//************************************************************** */
