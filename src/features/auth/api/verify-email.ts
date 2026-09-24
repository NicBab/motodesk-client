//************************************************************** */

import {
  apiRequest,
} from "@/lib/api/api-client";

//************************************************************** */

export type VerifyEmailInput = {
  token: string;
};

//************************************************************** */

export type VerifyEmailResponse = {
  message: string;
};

//************************************************************** */

export function verifyEmail(
  input: VerifyEmailInput,
): Promise<VerifyEmailResponse> {
  return apiRequest<VerifyEmailResponse>(
    "/auth/verify-email",
    {
      method: "POST",
      body: input,
    },
  );
}

//************************************************************** */