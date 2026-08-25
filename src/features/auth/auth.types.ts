export type MembershipRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "SERVICE_ADVISOR"
  | "TECHNICIAN"
  | "PARTS";

  //************************************************************** */

export type MembershipStatus =
  | "INVITED"
  | "ACTIVE"
  | "SUSPENDED";

//************************************************************** */

export type AuthenticatedUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
};

//************************************************************** */

export type AuthenticatedMembership = {
  id: string;
  organizationId: string;
  organizationName: string;
  role: MembershipRole;
  status: MembershipStatus;
};

//************************************************************** */

export type AuthSession = {
  user: AuthenticatedUser;
  membership: AuthenticatedMembership | null;
  permissions: string[];
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
};

//************************************************************** */

export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;

  organization: {
    name: string;
    slug: string;
    email?: string;
    phone?: string;
  };
};

//************************************************************** */

export type LoginInput = {
  email: string;
  password: string;
};

//************************************************************** */