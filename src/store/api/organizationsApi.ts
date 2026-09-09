//************************************************************** */

import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

//************************************************************** */

type ApiListResponse<T> = {
  success: true;
  data: T[];
};

//************************************************************** */

export type ApplicationTheme =
  | "offroad"
  | "marine"
  | "lawn"
  | "sport";

//************************************************************** */

export type OrganizationStatus =
  | "ACTIVE"
  | "ARCHIVED";

//************************************************************** */

export type Organization = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  applicationTheme: ApplicationTheme | "default";
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
};

//************************************************************** */

export type OrganizationMembership = {
  id: string;
  role: string;
  status: string;
  createdAt: string;

  organization: Organization;
};

//************************************************************** */

export type UpdateOrganizationInput = {
  organizationId: string;

  name?: string;
  email?: string;
  phone?: string;
  applicationTheme?: ApplicationTheme;
};

//************************************************************** */

export const organizationsApi =
  baseApi.injectEndpoints({
    endpoints: (builder) => ({
      getMyOrganizations:
        builder.query<
          OrganizationMembership[],
          void
        >({
          query: () => ({
            url: "/organizations/me",
            method: "GET",
          }),

          transformResponse: (
            response:
              ApiListResponse<OrganizationMembership>,
          ) =>
            response.data,

          providesTags: [
            "Organization",
          ],
        }),

      //************************************************************** */

      getOrganization:
        builder.query<
          Organization,
          string
        >({
          query: (
            organizationId,
          ) => ({
            url:
              `/organizations/${organizationId}`,

            method:
              "GET",
          }),

          transformResponse: (
            response:
              ApiSuccessResponse<Organization>,
          ) =>
            response.data,

          providesTags: (
            _result,
            _error,
            organizationId,
          ) => [
            {
              type:
                "Organization",

              id:
                organizationId,
            },
          ],
        }),

      //************************************************************** */

      updateOrganization:
        builder.mutation<
          Organization,
          UpdateOrganizationInput
        >({
          query: ({
            organizationId,
            ...body
          }) => ({
            url:
              `/organizations/${organizationId}`,

            method:
              "PATCH",

            body,
          }),

          transformResponse: (
            response:
              ApiSuccessResponse<Organization>,
          ) =>
            response.data,

          invalidatesTags: (
            _result,
            _error,
            {
              organizationId,
            },
          ) => [
            "Organization",

            {
              type:
                "Organization",

              id:
                organizationId,
            },
          ],
        }),
    }),

    overrideExisting:
      false,
  });

//************************************************************** */

export const {
  useGetMyOrganizationsQuery,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
} =
  organizationsApi;

//************************************************************** */