
import { baseApi } from "./baseApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ShopLocationStatus = "ACTIVE" | "ARCHIVED";

//************************************************************** */

export interface AccessibleShopLocation {
  id: string;
  organizationId: string;

  name: string;
  code: string;
  timezone: string;

  isDefault: boolean;
  status: ShopLocationStatus;
}

//************************************************************** */

export interface ShopLocation extends AccessibleShopLocation {
  email: string | null;
  phone: string | null;

  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;

  createdAt: string;
  updatedAt: string;
}

//************************************************************** */

export interface ShopLocationSummary extends ShopLocation {
  _count: {
    membershipLocations: number;
  };
}

//************************************************************** */

export interface LocationEmployeeUser {
  id: string;

  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string | null;
}

//************************************************************** */

export interface LocationEmployee {
  id: string;
  role: string;

  user: LocationEmployeeUser;

  membershipLocations: {
    shopLocationId: string;
  }[];
}

//************************************************************** */

export interface ShopLocationDetail extends ShopLocation {
  membershipLocations: {
    membershipId: string;

    membership: {
      id: string;
      role: string;
      status: string;

      user: LocationEmployeeUser;
    };
  }[];
}

//************************************************************** */

export interface LocationEmployeeAssignment {
  id: string;
  organizationId: string;
  membershipId: string;
  shopLocationId: string;

  createdAt: string;
}

//************************************************************** */

export interface CreateShopLocationInput {
  organizationId: string;

  name: string;
  code: string;

  email?: string | null;
  phone?: string | null;

  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string;

  timezone?: string;
}

//************************************************************** */

export interface ShopLocationQuery {
  organizationId: string;
  locationId: string;
}

//************************************************************** */

export interface AssignLocationEmployeesInput
  extends ShopLocationQuery {
  membershipIds: string[];
}

//************************************************************** */

export const locationsApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["ShopLocation"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      //************************************************************** */
      // Organization Locations
      //************************************************************** */

      getLocations: builder.query<
        ShopLocationSummary[],
        string
      >({
        query: (organizationId) => ({
          url: `/organizations/${organizationId}/locations`,
          method: "GET",
        }),

        transformResponse: (
          response: ApiSuccessResponse<ShopLocationSummary[]>,
        ) => response.data,

        providesTags: (result, _error, organizationId) => [
          {
            type: "ShopLocation",
            id: `LIST-${organizationId}`,
          },

          ...(result ?? []).map((location) => ({
            type: "ShopLocation" as const,
            id: `${organizationId}-${location.id}`,
          })),
        ],
      }),

      //************************************************************** */
      // Accessible Locations
      //************************************************************** */

      getAccessibleLocations: builder.query<
        AccessibleShopLocation[],
        string
      >({
        query: (organizationId) => ({
          url: `/organizations/${organizationId}/locations/accessible`,
          method: "GET",
        }),

        transformResponse: (
          response: ApiSuccessResponse<AccessibleShopLocation[]>,
        ) => response.data,

        providesTags: (
          _result,
          _error,
          organizationId,
        ) => [
          {
            type: "ShopLocation",
            id: `ACCESSIBLE-${organizationId}`,
          },
        ],
      }),

      //************************************************************** */
      // Location Details
      //************************************************************** */

      getLocation: builder.query<
        ShopLocationDetail,
        ShopLocationQuery
      >({
        query: ({
          organizationId,
          locationId,
        }) => ({
          url: `/organizations/${organizationId}/locations/${locationId}`,
          method: "GET",
        }),

        transformResponse: (
          response: ApiSuccessResponse<ShopLocationDetail>,
        ) => response.data,

        providesTags: (
          _result,
          _error,
          { organizationId, locationId },
        ) => [
          {
            type: "ShopLocation",
            id: `${organizationId}-${locationId}`,
          },
        ],
      }),

      //************************************************************** */
      // Available Employees
      //************************************************************** */

      getLocationEmployees: builder.query<
        LocationEmployee[],
        string
      >({
        query: (organizationId) => ({
          url: `/organizations/${organizationId}/locations/employees`,
          method: "GET",
        }),

        transformResponse: (
          response: ApiSuccessResponse<LocationEmployee[]>,
        ) => response.data,

        providesTags: (
          _result,
          _error,
          organizationId,
        ) => [
          {
            type: "ShopLocation",
            id: `EMPLOYEES-${organizationId}`,
          },
          "Membership",
        ],
      }),

      //************************************************************** */
      // Create Location
      //************************************************************** */

      createLocation: builder.mutation<
        ShopLocation,
        CreateShopLocationInput
      >({
        query: ({
          organizationId,
          ...input
        }) => ({
          url: `/organizations/${organizationId}/locations`,
          method: "POST",

          body: input,
        }),

        transformResponse: (
          response: ApiSuccessResponse<ShopLocation>,
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
                  type: "ShopLocation",
                  id: `LIST-${organizationId}`,
                },
                {
                  type: "ShopLocation",
                  id: `ACCESSIBLE-${organizationId}`,
                },
                {
                  type: "ShopLocation",
                  id: `EMPLOYEES-${organizationId}`,
                },
                "Organization",
              ],
      }),

      //************************************************************** */
      // Replace Location Employee Assignments
      //************************************************************** */

      assignLocationEmployees: builder.mutation<
        LocationEmployeeAssignment[],
        AssignLocationEmployeesInput
      >({
        query: ({
          organizationId,
          locationId,
          membershipIds,
        }) => ({
          url: `/organizations/${organizationId}/locations/${locationId}/employees`,
          method: "PUT",

          body: {
            locationId,
            membershipIds,
          },
        }),

        transformResponse: (
          response: ApiSuccessResponse<LocationEmployeeAssignment[]>,
        ) => response.data,

        invalidatesTags: (
          _result,
          error,
          { organizationId, locationId },
        ) =>
          error
            ? []
            : [
                {
                  type: "ShopLocation",
                  id: `${organizationId}-${locationId}`,
                },
                {
                  type: "ShopLocation",
                  id: `LIST-${organizationId}`,
                },
                {
                  type: "ShopLocation",
                  id: `ACCESSIBLE-${organizationId}`,
                },
                {
                  type: "ShopLocation",
                  id: `EMPLOYEES-${organizationId}`,
                },
                "Membership",
              ],
      }),
    }),

    overrideExisting: false,
  });

//************************************************************** */

export const {
  useGetLocationsQuery,
  useLazyGetLocationsQuery,

  useGetAccessibleLocationsQuery,
  useLazyGetAccessibleLocationsQuery,

  useGetLocationQuery,
  useLazyGetLocationQuery,

  useGetLocationEmployeesQuery,

  useCreateLocationMutation,
  useAssignLocationEmployeesMutation,
} = locationsApi;

//************************************************************** */
