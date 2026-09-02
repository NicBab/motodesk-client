import type {
  EmployeeRole,
  EmployeeStatus,
} from "@/features/employees/employee.types";

//************************************************************** */

export type EmployeeTimeEntryStatus = "CLOCKED_IN" | "ON_BREAK" | "CLOCKED_OUT";

//************************************************************** */

export type EmployeeTimeEntrySource =
  | "TIME_CLOCK_KIOSK"
  | "MANAGER_ENTRY"
  | "MANAGER_CORRECTION";

//************************************************************** */

export type EmployeeTimeEntryAuthMethod = "PIN" | "MANUAL";

//************************************************************** */

export type EmployeeTimeEntryCorrection = {
  id: string;

  timeEntryId: string;

  field: string;

  originalValue: string | null;

  updatedValue: string | null;

  reason: string;

  managerMembershipId: string | null;

  managerName: string | null;

  changedAt: string;
};

//************************************************************** */

export type TimeClockEmployeeSummary = {
  id: string;

  firstName: string;

  lastName: string;

  role: EmployeeRole;

  status: EmployeeStatus;
};

//************************************************************** */

export type EmployeeTimeEntry = {
  id: string;

  organizationId: string;

  employeeId: string;

  employeeName: string;

  clockInAt: string;

  clockOutAt: string | null;

  breakMinutes: number;

  workedMinutes: number | null;

  status: EmployeeTimeEntryStatus;

  source: EmployeeTimeEntrySource;

  authMethod: EmployeeTimeEntryAuthMethod;

  notes: string | null;

  employee: TimeClockEmployeeSummary;

  corrections: EmployeeTimeEntryCorrection[];

  createdAt: string;

  updatedAt: string;
};

//************************************************************** */

export type EmployeeClockStatus = {
  employee: {
    id: string;

    firstName: string;

    lastName: string;

    role: EmployeeRole;

    hasPin: boolean;
  };

  clockedIn: boolean;

  activeEntry: EmployeeTimeEntry | null;
};

//************************************************************** */

export type TimeClockEmployeeInput = {
  organizationId: string;

  employeeId: string;
};

//************************************************************** */

export type TimeClockActionInput = {
  organizationId: string;

  employeeId: string;

  pin: string;
};

//************************************************************** */

export type TimeClockReportRange =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "ANNUAL"
  | "CUSTOM";

//************************************************************** */

export type TimeClockReportEmployeeSummary = {
  employeeId: string;

  firstName: string;

  lastName: string;

  role: EmployeeRole;

  status: EmployeeStatus;

  hourlyRate: string;

  entryCount: number;

  workedMinutes: number;

  workedHours: number;
};

//************************************************************** */

export type TimeClockReport = {
  range: TimeClockReportRange;

  startDate: string;

  endDate: string;

  employeeId: string | null;

  includeInactive: boolean;

  summary: {
    employeeCount: number;

    entryCount: number;

    completedEntries: number;

    activeEntries: number;

    manualEntries: number;

    correctedEntries: number;

    workedMinutes: number;

    workedHours: number;

    breakMinutes: number;

    breakHours: number;
  };

  employeeSummary: TimeClockReportEmployeeSummary[];

  entries: EmployeeTimeEntry[];
};

//************************************************************** */

export type TimeClockReportQuery = {
  organizationId: string;

  range: TimeClockReportRange;

  employeeId?: string;

  includeInactive?: boolean;

  anchorDate?: string;

  startDate?: string;

  endDate?: string;
};

//************************************************************** */
