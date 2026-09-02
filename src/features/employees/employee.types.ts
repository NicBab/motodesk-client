import type {
  MembershipRole,
  MembershipStatus,
} from "@/features/memberships/membership.types";

export type EmployeeRole =
  | "TECHNICIAN"
  | "SERVICE_ADVISOR"
  | "SHOP_MANAGER"
  | "CASHIER"
  | "PARTS_SPECIALIST";

//************************************************************** */

export type EmployeeStatus =
  | "ACTIVE"
  | "INACTIVE";

//************************************************************** */

export type EmployeeMembership = {
  id: string;

  role: MembershipRole;

  status: MembershipStatus;

  user: {
    id: string;

    firstName: string;

    lastName: string;

    email: string;
  };
};

//************************************************************** */

export type Employee = {
  id: string;

  organizationId: string;

  membershipId: string | null;

  firstName: string;

  lastName: string;

  role: EmployeeRole;

  status: EmployeeStatus;

  phone: string | null;

  email: string | null;

  hourlyRate: string;

  laborRate: string;

  hireDate: string | null;

  isSchedulable: boolean;

  dailyStartTime: string;

  dailyEndTime: string;

  maxDailyHours: string;

  skills: string | null;

  membership: EmployeeMembership | null;

  hasPin: boolean;

  createdAt: string;

  updatedAt: string;
};

//************************************************************** */

export type CreateEmployeeData = {
  firstName: string;

  lastName: string;

  role: EmployeeRole;

  status?: EmployeeStatus;

  phone?: string;

  email?: string;

  hourlyRate?: number;

  laborRate?: number;

  hireDate?: string;

  pin?: string;

  membershipId?: string;

  isSchedulable?: boolean;

  dailyStartTime?: string;

  dailyEndTime?: string;

  maxDailyHours?: number;

  skills?: string;
};

//************************************************************** */

export type UpdateEmployeeData = {
  firstName?: string;

  lastName?: string;

  role?: EmployeeRole;

  status?: EmployeeStatus;

  phone?: string | null;

  email?: string | null;

  hourlyRate?: number;

  laborRate?: number;

  hireDate?: string | null;

  pin?: string | null;

  membershipId?: string | null;

  isSchedulable?: boolean;

  dailyStartTime?: string;

  dailyEndTime?: string;

  maxDailyHours?: number;

  skills?: string | null;
};

//************************************************************** */

export type EmployeeListQuery = {
  organizationId: string;

  search?: string;

  role?: EmployeeRole;

  status?: EmployeeStatus;

  isSchedulable?: boolean;
};

//************************************************************** */

export type CreateEmployeeInput = {
  organizationId: string;

  data: CreateEmployeeData;
};

//************************************************************** */

export type UpdateEmployeeInput = {
  organizationId: string;

  employeeId: string;

  data: UpdateEmployeeData;
};

//************************************************************** */

export type EmployeeActionInput = {
  organizationId: string;

  employeeId: string;
};

//************************************************************** */