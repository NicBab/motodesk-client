export type MembershipRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "SERVICE_ADVISOR"
  | "TECHNICIAN"
  | "PARTS";

export type MembershipStatus = "INVITED" | "ACTIVE" | "SUSPENDED";

export type MembershipUser = {
  id: string;

  email: string;

  firstName: string;
  lastName: string;

  phone: string | null;

  isActive: boolean;
};

export type MembershipListItem = {
  id: string;

  role: MembershipRole;
  status: MembershipStatus;

  createdAt: string;
  updatedAt: string;

  user: MembershipUser;
};

export type MembershipListQuery = {
  organizationId: string;

  role?: MembershipRole;
  status?: MembershipStatus;
  search?: string;

  page?: number;
  pageSize?: number;
};
