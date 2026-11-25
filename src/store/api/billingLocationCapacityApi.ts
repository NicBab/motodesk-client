
import { billingApi } from "./billingApi";

//************************************************************** */

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

//************************************************************** */

export interface BillingLocationCapacityPreview {
  changeId: string;
  currency: string;

  currentAdditionalLocationQuantity: number;
  targetAdditionalLocationQuantity: number;

  currentLocationLimit: number;
  targetLocationLimit: number;

  additionalLocationUnitAmount: number;

  monthlyTotalAmount: number;
  estimatedInvoiceAmountDue: number;

  invoiceEstimateScope: "next_invoice";

  trialEndsAt: string | null;
  expiresAt: string;
}

//************************************************************** */

export interface BillingLocationCapacityConfirmation {
  changeId: string;

  status: "APPLIED" | "PENDING_PAYMENT";

  currency: string;

  targetAdditionalLocationQuantity: number;
  targetLocationLimit: number;

  monthlyTotalAmount: number;
}

//************************************************************** */

export interface CreateBillingLocationCapacityPreviewRequest {
  organizationId: string;

  additionalLocationQuantity: number;
}

//************************************************************** */

export interface ConfirmBillingLocationCapacityChangeRequest {
  organizationId: string;

  changeId: string;
}

//************************************************************** */

function billingLocationCapacityPath(
  organizationId: string,
): string {
  return `/organizations/${encodeURIComponent(
    organizationId,
  )}/billing/location-capacity`;
}

//************************************************************** */

export const billingLocationCapacityApi =
  billingApi.injectEndpoints({
    endpoints: (builder) => ({
      //************************************************************** */
      // Preview Additional Location Capacity
      //************************************************************** */

      createBillingLocationCapacityPreview:
        builder.mutation<
          BillingLocationCapacityPreview,
          CreateBillingLocationCapacityPreviewRequest
        >({
          query: ({
            organizationId,
            additionalLocationQuantity,
          }) => ({
            url: `${billingLocationCapacityPath(
              organizationId,
            )}/preview`,

            method: "POST",

            cache: "no-store",

            body: {
              additionalLocationQuantity,
            },
          }),

          transformResponse: (
            response: ApiSuccessResponse<
              BillingLocationCapacityPreview
            >,
          ) => response.data,
        }),

      //************************************************************** */
      // Confirm Additional Location Capacity
      //************************************************************** */

      confirmBillingLocationCapacityChange:
        builder.mutation<
          BillingLocationCapacityConfirmation,
          ConfirmBillingLocationCapacityChangeRequest
        >({
          query: ({
            organizationId,
            changeId,
          }) => ({
            url: `${billingLocationCapacityPath(
              organizationId,
            )}/confirm`,

            method: "POST",

            cache: "no-store",

            body: {
              changeId,
            },
          }),

          transformResponse: (
            response: ApiSuccessResponse<
              BillingLocationCapacityConfirmation
            >,
          ) => response.data,

          async onQueryStarted(
            { organizationId },
            { dispatch, queryFulfilled },
          ) {
            try {
              await queryFulfilled;

              await dispatch(
                billingApi.endpoints.getBillingOverview.initiate(
                  organizationId,
                  {
                    subscribe: false,
                    forceRefetch: true,
                  },
                ),
              );

              await dispatch(
                billingApi.endpoints.getSubscriptionAccess.initiate(
                  organizationId,
                  {
                    subscribe: false,
                    forceRefetch: true,
                  },
                ),
              );
            } catch {
              // The calling component handles request errors.
              // Do not apply optimistic billing changes.
            }
          },
        }),
    }),

    overrideExisting: false,
  });

//************************************************************** */

export const {
  useCreateBillingLocationCapacityPreviewMutation,
  useConfirmBillingLocationCapacityChangeMutation,
} = billingLocationCapacityApi;

//************************************************************** */
