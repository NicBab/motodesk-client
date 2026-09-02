//************************************************************** */

import { apiRequest } from "@/lib/api/api-client";

import type { AuthenticatedMembership } from "@/features/auth/auth.types";

//************************************************************** */

type SwitchOrganizationResult = {
  membership: AuthenticatedMembership;

  permissions: string[];

  accessTokenExpiresAt: string;
};

//************************************************************** */

export function switchInvitedOrganization(
  organizationId: string,
): Promise<SwitchOrganizationResult> {
  return apiRequest<SwitchOrganizationResult>("/auth/switch-organization", {
    method: "POST",

    body: {
      organizationId,
    },
  });
}

//************************************************************** */
