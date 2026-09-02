import type { MembershipRole } from "@/features/memberships/membership.types";

//************************************************************** */

export type Permission = string;

//************************************************************** */

export type PermissionCatalogItem = {
  permission: Permission;

  group: string;

  action: string;
};

//************************************************************** */

export type PermissionRoleDefaults = Record<MembershipRole, Permission[]>;

//************************************************************** */

export type PermissionCatalog = {
  permissions: PermissionCatalogItem[];

  roleDefaults: PermissionRoleDefaults;
};

//************************************************************** */

export type MembershipPermissions = {
  permissions: Permission[];
};

//************************************************************** */

export type MembershipPermissionInput = {
  organizationId: string;

  membershipId: string;
};

//************************************************************** */

export type UpdateMembershipPermissionsInput = {
  organizationId: string;

  membershipId: string;

  permissions: Permission[];
};

//************************************************************** */
