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

      transformResponse: (
        response: ApiSuccessResponse<AuthSession>,
      ) => response.data,

      providesTags: ["Auth"],
    }),

    //************************************************************** */

    updateProfile: builder.mutation<
      UpdateProfileResponse,
      UpdateProfileInput
    >({
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
  useUpdateProfileMutation,
} = authApi;

//************************************************************** */