export type RepairOrderPartStatus =
  | "NEEDS_REVIEW"
  | "AVAILABLE"
  | "ALLOCATED"
  | "TO_BE_ORDERED"
  | "ORDERED"
  | "PARTIALLY_RECEIVED"
  | "BACKORDERED"
  | "RECEIVED"
  | "PULLED"
  | "STAGED"
  | "ISSUED"
  | "INSTALLED"
  | "WAIVED"
  | "CANCELLED";

export type RepairOrderPartResolutionMethod =
  | "SHOP_INVENTORY"
  | "ORIGINAL_PO"
  | "ALTERNATE_VENDOR"
  | "LOCAL_DEALER"
  | "MANUAL_PURCHASE"
  | "APPROVED_SUBSTITUTE"
  | "CUSTOMER_SUPPLIED"
  | "INVENTORY_TRANSFER"
  | "NOT_REQUIRED"
  | "MANAGER_OVERRIDE";

export type RepairOrderPartLine = {
  id: string;
  repairOrderId: string;

  partId: string | null;

  partNumber: string;
  description: string;

  quantity: string;
  unitPrice: string;

  requiredQty: string;
  approvedQty: string;

  allocatedQty: string;
  orderedQty: string;
  receivedQty: string;
  pulledQty: string;
  installedQty: string;

  estimatedCost: string;
  actualCost: string;

  vendorName: string | null;

  status: RepairOrderPartStatus;

  resolutionMethod: RepairOrderPartResolutionMethod | null;

  blocksWork: boolean;

  part: {
    id: string;
    partNumber: string;
    description: string;
  } | null;

  createdAt: string;
  updatedAt: string;
};

export type RepairOrderPartListInput = {
  organizationId: string;
  repairOrderId: string;
};

export type CreateRepairOrderPartLineInput = {
  organizationId: string;
  repairOrderId: string;

  partId?: string;

  partNumber: string;
  description: string;

  quantity?: number;
  unitPrice?: number;

  requiredQty?: number;
  approvedQty?: number;

  allocatedQty?: number;
  orderedQty?: number;
  receivedQty?: number;
  pulledQty?: number;
  installedQty?: number;

  estimatedCost?: number;
  actualCost?: number;

  vendorName?: string;

  status?: RepairOrderPartStatus;

  resolutionMethod?: RepairOrderPartResolutionMethod;

  blocksWork?: boolean;
};

export type UpdateRepairOrderPartLineData = {
  partNumber?: string;
  description?: string;

  quantity?: number;
  unitPrice?: number;

  requiredQty?: number;
  approvedQty?: number;

  estimatedCost?: number;
  actualCost?: number;

  vendorName?: string;

  resolutionMethod?: RepairOrderPartResolutionMethod;

  blocksWork?: boolean;
};

export type UpdateRepairOrderPartLineInput = {
  organizationId: string;
  repairOrderId: string;
  partLineId: string;

  data: UpdateRepairOrderPartLineData;
};

export type RepairOrderPartActionInput = {
  organizationId: string;
  repairOrderId: string;
  partLineId: string;

  notes?: string;
};

export type RepairOrderPartQuantityActionInput = RepairOrderPartActionInput & {
  quantity: number;
};
