//************************************************************** */

import { apiRequest } from "@/lib/api/api-client";

//************************************************************** */

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

//************************************************************** */

export type ChangePasswordResult = {
  message: string;
  revokedSessionCount: number;
};

//************************************************************** */

export function changePassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  return apiRequest<ChangePasswordResult>(
    "/auth/change-password",
    {
      method: "POST",
      body: input,
    },
  );
}

//************************************************************** */