//************************************************************** */

import {
  apiRequest,
} from "@/lib/api/api-client";

//************************************************************** */

export type ResendEmailVerificationInput = {
  email: string;
};

//************************************************************** */

export type ResendEmailVerificationResponse = {
  message: string;
};

//************************************************************** */

export function resendEmailVerification(
  input: ResendEmailVerificationInput,
): Promise<ResendEmailVerificationResponse> {
  return apiRequest<ResendEmailVerificationResponse>(
    "/auth/resend-email-verification",
    {
      method: "POST",
      body: input,
    },
  );
}

//************************************************************** */