import type { Employee } from "@/features/employees/employee.types";

import type {
  RepairOrder,
  RepairOrderStatus,
} from "@/features/repair-orders/repair-order.types";

//************************************************************** */
// Schedule

export type ScheduleStatus =
  | "TENTATIVE"
  | "SCHEDULED"
  | "CONFIRMED"
  | "READY"
  | "IN_PROGRESS"
  | "PAUSED"
  | "BLOCKED"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED"
  | "RESCHEDULE_REQUIRED";

//************************************************************** */

export type ScheduleRepairOrderSummary = {
  id: string;

  organizationId: string;

  roNumber: number;

  status: RepairOrderStatus;

  priority: "STANDARD" | "RUSH" | "EMERGENCY" | "HOLD";

  complaint: string | null;

  scheduledDate: string | null;

  promisedDate: string | null;

  customer: {
    id: string;

    firstName: string | null;

    lastName: string | null;

    companyName: string | null;

    phone: string | null;

    email: string | null;
  };

  vehicle: {
    id: string;

    year: number | null;

    make: string;

    model: string;

    trim: string | null;

    vin: string | null;
  };

  partLines?: unknown[];
};

//************************************************************** */

export type ScheduleLaborLine = {
  id: string;

  repairOrderId: string;

  description?: string | null;

  operation?: string | null;

  laborHours?: string | number | null;

  status?: string | null;

  [key: string]: unknown;
};

//************************************************************** */

export type ScheduleWorkBlock = {
  id: string;

  organizationId: string;

  repairOrderId: string;

  technicianEmployeeId: string | null;

  laborLineId: string | null;

  scheduledDate: string;

  scheduledEnd: string | null;

  promisedDate: string | null;

  status: ScheduleStatus;

  waitingCustomer: boolean;

  actualStartedAt: string | null;

  actualCompletedAt: string | null;

  cancelledAt: string | null;

  cancellationNotes: string | null;

  notes: string | null;

  createdAt: string;

  updatedAt: string;

  technicianEmployee: Employee | null;

  laborLine: ScheduleLaborLine | null;

  repairOrder: ScheduleRepairOrderSummary;
};

//************************************************************** */
// Dispatch Board

export type SchedulingBoard = {
  range: {
    start: string;

    end: string;
  };

  technicians: Employee[];

  schedules: ScheduleWorkBlock[];

  unscheduledRepairOrders: RepairOrder[];
};

//************************************************************** */

export type GetSchedulingBoardInput = {
  organizationId: string;

  start: string;

  end: string;
};

//************************************************************** */

export type ScheduleRepairOrderData = {
  technicianEmployeeId: string;

  laborLineId?: string;

  scheduledDate: string;

  scheduledEnd: string;

  promisedDate?: string;

  status?: ScheduleStatus;

  waitingCustomer?: boolean;

  notes?: string;
};

//************************************************************** */

export type ScheduleRepairOrderInput = {
  organizationId: string;

  repairOrderId: string;

  data: ScheduleRepairOrderData;
};

//************************************************************** */

export type RescheduleRepairOrderData = {
  technicianEmployeeId: string;

  laborLineId?: string | null;

  scheduledDate: string;

  scheduledEnd: string;

  promisedDate?: string;

  waitingCustomer?: boolean;

  notes?: string;
};

//************************************************************** */

export type RescheduleRepairOrderInput = {
  organizationId: string;

  repairOrderId: string;

  data: RescheduleRepairOrderData;
};

//************************************************************** */

export type CancelRepairOrderScheduleInput = {
  organizationId: string;

  repairOrderId: string;

  notes: string;
};

//************************************************************** */
// Service Appointments

export type ServiceAppointmentType =
  | "DROP_OFF"
  | "WAITING_CUSTOMER"
  | "PICKUP_AND_DELIVERY"
  | "MOBILE_SERVICE"
  | "INTERNAL_WORK"
  | "WALK_IN"
  | "PRE_DELIVERY_INSPECTION"
  | "WARRANTY"
  | "RECALL";

//************************************************************** */

export type ServiceAppointmentStatus =
  | "REQUESTED"
  | "TENTATIVE"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CONVERTED_TO_RO"
  | "IN_SERVICE"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED";

//************************************************************** */

export type ServiceAppointmentContactMethod =
  | "PHONE"
  | "SMS"
  | "EMAIL"
  | "IN_PERSON";

//************************************************************** */

export type ServiceAppointmentCustomer = {
  id: string;

  firstName: string | null;

  lastName: string | null;

  companyName: string | null;

  email: string | null;

  phone: string | null;
};

//************************************************************** */

export type ServiceAppointmentVehicle = {
  id: string;

  year: number | null;

  make: string;

  model: string;

  trim: string | null;

  vin: string | null;
};

//************************************************************** */

export type ServiceAppointmentRepairOrder = {
  id: string;

  roNumber: number;

  status: RepairOrderStatus;
};

//************************************************************** */

export type ServiceAppointment = {
  id: string;

  organizationId: string;

  appointmentNumber: number;

  customerId: string | null;

  vehicleId: string | null;

  repairOrderId: string | null;

  customerName: string;

  appointmentType: ServiceAppointmentType;

  status: ServiceAppointmentStatus;

  requestedService: string;

  customerComplaint: string | null;

  scheduledStart: string;

  scheduledEnd: string;

  estimatedDurationMinutes: number;

  preferredTechnicianEmployeeId: string | null;

  serviceAdvisorEmployeeId: string | null;

  waitingCustomer: boolean;

  transportationNeeded: boolean;

  contactMethod: ServiceAppointmentContactMethod | null;

  internalNotes: string | null;

  customerNotes: string | null;

  confirmedAt: string | null;

  checkedInAt: string | null;

  cancelledAt: string | null;

  cancelReason: string | null;

  createdAt: string;

  updatedAt: string;

  customer: ServiceAppointmentCustomer | null;

  vehicle: ServiceAppointmentVehicle | null;

  preferredTechnician: Employee | null;

  serviceAdvisor: Employee | null;

  repairOrder: ServiceAppointmentRepairOrder | null;
};

//************************************************************** */

export type ListServiceAppointmentsInput = {
  organizationId: string;

  search?: string;

  status?: ServiceAppointmentStatus;

  start?: string;

  end?: string;
};

//************************************************************** */

export type CreateServiceAppointmentData = {
  customerId?: string;

  vehicleId?: string;

  appointmentType?: ServiceAppointmentType;

  requestedService: string;

  customerComplaint?: string;

  scheduledStart: string;

  scheduledEnd: string;

  estimatedDurationMinutes?: number;

  preferredTechnicianEmployeeId?: string;

  serviceAdvisorEmployeeId?: string;

  waitingCustomer?: boolean;

  transportationNeeded?: boolean;

  contactMethod?: ServiceAppointmentContactMethod;

  internalNotes?: string;

  customerNotes?: string;
};

//************************************************************** */

export type CreateServiceAppointmentInput = {
  organizationId: string;

  data: CreateServiceAppointmentData;
};

//************************************************************** */

export type ServiceAppointmentActionInput = {
  organizationId: string;

  appointmentId: string;
};

//************************************************************** */

export type CancelServiceAppointmentInput = {
  organizationId: string;

  appointmentId: string;

  reason?: string;
};

//************************************************************** */

export type ConvertServiceAppointmentResult = {
  appointment: ServiceAppointment;

  repairOrder: RepairOrder;
};

//************************************************************** */
