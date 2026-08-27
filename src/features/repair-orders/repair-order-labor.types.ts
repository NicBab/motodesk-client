export type RepairOrderLaborStatus =
  | "PROPOSED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export type RepairOrderLaborTechnicianUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

export type RepairOrderLaborTechnician = {
  id: string;
  role: string;

  user: RepairOrderLaborTechnicianUser;
};

export type RepairOrderLaborLine = {
  id: string;
  repairOrderId: string;

  technicianMembershipId: string | null;

  description: string;

  hours: string;
  rate: string;

  completed: boolean;

  startedAt: string | null;
  completedAt: string | null;

  status: RepairOrderLaborStatus;

  technician: RepairOrderLaborTechnician | null;

  createdAt: string;
  updatedAt: string;
};

export type RepairOrderLaborListInput = {
  organizationId: string;
  repairOrderId: string;
};

export type CreateRepairOrderLaborLineInput = {
  organizationId: string;
  repairOrderId: string;

  technicianMembershipId?: string;

  description: string;

  hours?: number;
  rate?: number;

  completed?: boolean;
};

export type UpdateRepairOrderLaborLineData = {
  technicianMembershipId?: string;

  description?: string;

  hours?: number;
  rate?: number;

  completed?: boolean;
};

export type UpdateRepairOrderLaborLineInput = {
  organizationId: string;
  repairOrderId: string;
  laborLineId: string;

  data: UpdateRepairOrderLaborLineData;
};

export type RepairOrderLaborActionInput = {
  organizationId: string;
  repairOrderId: string;
  laborLineId: string;

  notes?: string;
};

export type RepairOrderLaborActionResult = {
  laborLine: RepairOrderLaborLine;

  repairOrderStatus: string;

  remainingIncompleteLabor?: number;
};
