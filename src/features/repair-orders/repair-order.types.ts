export type RepairOrderStatus =
  | "ESTIMATE"
  | "AWAITING_CUSTOMER_APPROVAL"
  | "APPROVED"
  | "PARTS_REVIEW"
  | "WAITING_ON_PARTS"
  | "READY_TO_WORK"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "WAITING_ON_ADDITIONAL_APPROVAL"
  | "WORK_COMPLETE"
  | "QUALITY_CHECK"
  | "READY_FOR_PICKUP"
  | "CASHIERED"
  | "COMPLETED"
  | "PICKED_UP"
  | "CLOSED"
  | "CANCELLED";

export type RepairOrderPriority = "STANDARD" | "RUSH" | "EMERGENCY" | "HOLD";

export type RepairOrderApprovalMethod =
  | "PHONE"
  | "SMS"
  | "EMAIL"
  | "CUSTOMER_PORTAL"
  | "IN_PERSON";

export type RepairOrderCashierStatus =
  | "NOT_CASHIERED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "VOIDED"
  | "REVERSED";

export type RepairOrderPickupStatus =
  | "NOT_READY"
  | "READY"
  | "COMPLETED"
  | "REVERSED";

export type RepairOrderCustomer = {
  id: string;

  firstName: string | null;
  lastName: string | null;
  companyName: string | null;

  email: string | null;
  phone: string | null;
};

export type RepairOrderVehicle = {
  id: string;

  year: number | null;

  make: string;
  model: string;
  trim: string | null;

  vin: string | null;
};

export type RepairOrder = {
  id: string;
  organizationId: string;

  customerId: string;
  vehicleId: string;

  roNumber: number;

  status: RepairOrderStatus;
  priority: RepairOrderPriority;

  serviceAdvisorMembershipId: string | null;

  primaryTechnicianMembershipId: string | null;

  promisedDate: string | null;
  scheduledDate: string | null;

  complaint: string | null;
  notes: string | null;

  taxRate: string | null;
  shopSuppliesRate: string;

  discount: string;
  deposit: string;

  approvalMethod: RepairOrderApprovalMethod | null;

  approvalDate: string | null;

  approvedBy: string | null;

  approvedAmount: string | null;

  approvalNotes: string | null;

  cashierStatus: RepairOrderCashierStatus;

  cashieredDate: string | null;

  paymentReference: string | null;

  paymentRemote: boolean;

  remainingBalance: string;

  pickupStatus: RepairOrderPickupStatus;

  pickupDate: string | null;

  pickupRecipient: string | null;

  pickupNotes: string | null;

  isActive: boolean;

  customer: RepairOrderCustomer;
  vehicle: RepairOrderVehicle;

  createdAt: string;
  updatedAt: string;
};

export type RepairOrderListQuery = {
  organizationId: string;

  search?: string;

  customerId?: string;
  vehicleId?: string;

  status?: RepairOrderStatus;

  priority?: RepairOrderPriority;

  serviceAdvisorMembershipId?: string;

  primaryTechnicianMembershipId?: string;

  isActive?: boolean;
};

export type RepairOrderMutationInput = {
  organizationId: string;
  repairOrderId: string;
};

export type UpdateRepairOrderStatusInput = RepairOrderMutationInput & {
  status: RepairOrderStatus;
  notes?: string;
  automatic?: boolean;
};

export type RepairOrderNotesMutationInput = RepairOrderMutationInput & {
  notes?: string;
};

export type FailRepairOrderQualityCheckInput = RepairOrderMutationInput & {
  notes: string;
};

export type RepairOrderQualityCheckInput = RepairOrderMutationInput & {
  notes?: string;
};

export type ApproveRepairOrderInput = RepairOrderMutationInput & {
  approvalMethod: RepairOrderApprovalMethod;

  approvedBy: string;

  approvedAmount?: number;

  notes?: string;
};

export type DeclineRepairOrderApprovalInput = RepairOrderMutationInput & {
  notes: string;
};

//************************************************************** */

export type CreateRepairOrderInput = {
  organizationId: string;

  customerId: string;
  vehicleId: string;

  status?: RepairOrderStatus;
  priority?: RepairOrderPriority;

  serviceAdvisorMembershipId?: string;
  primaryTechnicianMembershipId?: string;

  promisedDate?: string;
  scheduledDate?: string;

  complaint?: string;
  notes?: string;

  taxRate?: number;
  shopSuppliesRate?: number;

  discount?: number;
  deposit?: number;

  approvalMethod?: RepairOrderApprovalMethod;

  approvalDate?: string;

  approvedBy?: string;
  approvedAmount?: number;
  approvalNotes?: string;

  cashierStatus?: RepairOrderCashierStatus;

  cashieredDate?: string;

  paymentReference?: string;
  paymentRemote?: boolean;

  remainingBalance?: number;

  pickupStatus?: RepairOrderPickupStatus;

  pickupDate?: string;
  pickupRecipient?: string;
  pickupNotes?: string;
};

export type GetRepairOrderInput = {
  organizationId: string;
  repairOrderId: string;
};

export type CashierRepairOrderInput =
  RepairOrderMutationInput & {
    paymentReference?: string;
    paymentRemote?: boolean;
    remainingBalance?: number;
  };

export type CompleteRepairOrderPickupInput =
  RepairOrderMutationInput & {
    pickupRecipient?: string;
    notes?: string;
  };

export type CloseRepairOrderInput =
  RepairOrderMutationInput & {
    notes?: string;
  };

  export type ReopenRepairOrderInput =
  RepairOrderMutationInput & {
    notes: string;
  };

  export type PauseRepairOrderInput =
  RepairOrderMutationInput & {
    notes: string;
  };

export type ResumeRepairOrderInput =
  RepairOrderMutationInput & {
    notes?: string;
  };

  export type UpdateRepairOrderInput =
  RepairOrderMutationInput & {
    data: {
      priority?: RepairOrderPriority;

      serviceAdvisorMembershipId?: string;
      primaryTechnicianMembershipId?: string;

      promisedDate?: string;
      scheduledDate?: string;

      complaint?: string;
      notes?: string;

      taxRate?: number;
      shopSuppliesRate?: number;

      discount?: number;
      deposit?: number;

      approvalMethod?:
        RepairOrderApprovalMethod;

      approvalDate?: string;

      approvedBy?: string;
      approvedAmount?: number;
      approvalNotes?: string;

      cashierStatus?:
        RepairOrderCashierStatus;

      cashieredDate?: string;

      paymentReference?: string;
      paymentRemote?: boolean;

      remainingBalance?: number;

      pickupStatus?:
        RepairOrderPickupStatus;

      pickupDate?: string;
      pickupRecipient?: string;
      pickupNotes?: string;
    };
  };

// //************************************************************** */
