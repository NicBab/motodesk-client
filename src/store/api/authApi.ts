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
  }),
});

//************************************************************** */

export const {
  useGetCurrentUserQuery,
  useRefreshSessionMutation,
  useUpdateProfileMutation,
} = authApi;

//************************************************************** */
