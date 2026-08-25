import type { AuthSession } from "@/features/auth/auth.types";

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
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
  }),
});

export const {
  useGetCurrentUserQuery,
} = authApi;

//************************************************************** */