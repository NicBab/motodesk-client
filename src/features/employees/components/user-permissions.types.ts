import type { Employee } from "../employee.types";

import type {
  MembershipListItem,
  MembershipRole,
  MembershipStatus,
} from "@/features/memberships/membership.types";

//************************************************************** */

export type AccountFilter =
  | "ALL"
  | "ACTIVE"
  | "INVITED"
  | "SUSPENDED"
  | "NO_ACCOUNT";

//************************************************************** */

export type EmployeeAccessMembership =
  | MembershipListItem
  | NonNullable<Employee["membership"]>;

//************************************************************** */

export type EmployeeAccessItem = {
  employee: Employee;

  membership: EmployeeAccessMembership | null;
};

//************************************************************** */

export type EmployeeAccessRoleOption = {
  value: MembershipRole;

  label: string;
};

//************************************************************** */

export const EMPLOYEE_ACCESS_ROLES: EmployeeAccessRoleOption[] = [
  {
    value: "ADMIN",

    label: "Administrator",
  },

  {
    value: "MANAGER",

    label: "Manager",
  },

  {
    value: "SERVICE_ADVISOR",

    label: "Service Advisor",
  },

  {
    value: "TECHNICIAN",

    label: "Technician",
  },

  {
    value: "PARTS",

    label: "Parts",
  },
];

//************************************************************** */

export type EmployeeAccountStatus = MembershipStatus | null;

//************************************************************** */
