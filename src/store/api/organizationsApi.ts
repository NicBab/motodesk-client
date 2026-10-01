//************************************************************** */

import {
  baseApi,
} from "./baseApi";

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

  applicationTheme:
    | ApplicationTheme
    | "default";

  taxRate: string;

  shopSuppliesRate: string;

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

export type CreateOrganizationInput = {
  name: string;

  slug: string;

  email?: string;

  phone?: string;
};

//************************************************************** */

export type UpdateOrganizationInput = {
  organizationId: string;

  name?: string;

  email?: string;

  phone?: string;

  applicationTheme?: ApplicationTheme;

  taxRate?: number;

  shopSuppliesRate?: number;
};

//************************************************************** */

export const organizationsApi =
  baseApi.injectEndpoints({
    endpoints: (
      builder,
    ) => ({
      //************************************************************** */
      // Create Organization

      createOrganization:
        builder.mutation<
          Organization,
          CreateOrganizationInput
        >({
          query: (
            body,
          ) => ({
            url: "/organizations",

            method: "POST",

            body,
          }),

          transformResponse: (
            response: ApiSuccessResponse<Organization>,
          ) =>
            response.data,

          invalidatesTags: [
            "Organization",
          ],
        }),

      //************************************************************** */
      // My Organizations

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
            response: ApiListResponse<OrganizationMembership>,
          ) =>
            response.data,

          providesTags: [
            "Organization",
          ],
        }),

      //************************************************************** */
      // Organization

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

            method: "GET",
          }),

          transformResponse: (
            response: ApiSuccessResponse<Organization>,
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
      // Update Organization
      //
      // Company financial settings are persisted onto open repair
      // orders by the server. Therefore every cached RepairOrder must
      // be invalidated after an organization update so mounted/open
      // RO queries retrieve the persisted financial values again.
      //
      // This is intentionally a general RepairOrder invalidation.
      // Company Settings can affect multiple open repair orders at
      // once, so invalidating only LIST or one repair-order ID would
      // leave other cached RO detail queries stale.

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
            response: ApiSuccessResponse<Organization>,
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

            "RepairOrder",
          ],
        }),
    }),

    overrideExisting:
      false,
  });

//************************************************************** */

export const {
  useCreateOrganizationMutation,

  useGetMyOrganizationsQuery,

  useGetOrganizationQuery,

  useUpdateOrganizationMutation,
} =
  organizationsApi;

//************************************************************** */