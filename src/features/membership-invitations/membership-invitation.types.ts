import type {
  MembershipRole,
} from "@/features/memberships/membership.types";

//************************************************************** */

export type MembershipInvitation = {
  id: string;

  organizationId: string;

  invitedByMembershipId: string;

  email: string;

  role: MembershipRole;

  expiresAt: string;

  createdAt: string;

  updatedAt: string;
};

//************************************************************** */

export type CreateMembershipInvitationResult = {
  invitation: MembershipInvitation;

  token: string;
};

//************************************************************** */

export type CreateMembershipInvitationInput = {
  organizationId: string;

  employeeId?: string;

  email: string;

  role: MembershipRole;
};

//************************************************************** */