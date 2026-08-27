import type { Part } from "./part.types";

import type { PurchaseOrder } from "./purchase-order.types";

import type { Vendor } from "./vendor.types";

import type { RepairOrder } from "../repair-orders/repair-order.types";

//************************************************************** */

export type PartReturnType =
  | "TO_VENDOR"
  | "TO_INVENTORY"
  | "WRONG_PART"
  | "DAMAGED"
  | "UNUSED_RO_PART"
  | "CORE_RETURN"
  | "WARRANTY_RETURN";

//************************************************************** */

export type PartReturnCreditStatus = "PENDING" | "RECEIVED";

//************************************************************** */

export type PartReturnStatus = "PENDING" | "SHIPPED" | "CREDITED" | "CLOSED";

//************************************************************** */

export type PartReturn = {
  id: string;

  organizationId: string;

  returnNumber: number;

  returnType: PartReturnType;

  partId: string | null;

  partNumber: string | null;

  description: string | null;

  quantity: string;

  vendorId: string | null;

  vendorName: string | null;

  purchaseOrderId: string | null;

  poNumber: number | null;

  repairOrderId: string | null;

  roNumber: number | null;

  restockingFee: string;

  returnAuthorizationNumber: string | null;

  creditAmount: string;

  creditStatus: PartReturnCreditStatus;

  notes: string | null;

  status: PartReturnStatus;

  isActive: boolean;

  part: Part | null;

  vendor: Vendor | null;

  purchaseOrder: PurchaseOrder | null;

  repairOrder: RepairOrder | null;

  createdAt: string;
  updatedAt: string;
};

//************************************************************** */

export type PartReturnListQuery = {
  organizationId: string;

  search?: string;

  returnType?: PartReturnType;

  status?: PartReturnStatus;

  creditStatus?: PartReturnCreditStatus;

  vendorId?: string;

  partId?: string;

  purchaseOrderId?: string;

  repairOrderId?: string;

  isActive?: boolean;
};

//************************************************************** */

export type GetPartReturnInput = {
  organizationId: string;

  partReturnId: string;
};

//************************************************************** */

export type CreatePartReturnInput = {
  organizationId: string;

  returnType: PartReturnType;

  partId: string;

  quantity: number;

  vendorId?: string;

  purchaseOrderId?: string;

  repairOrderId?: string;

  restockingFee?: number;

  returnAuthorizationNumber?: string;

  creditAmount?: number;

  notes?: string;
};

//************************************************************** */

export type UpdatePartReturnData = {
  returnType?: PartReturnType;

  quantity?: number;

  vendorId?: string | null;

  purchaseOrderId?: string | null;

  repairOrderId?: string | null;

  restockingFee?: number;

  returnAuthorizationNumber?: string | null;

  creditAmount?: number;

  notes?: string | null;
};

//************************************************************** */

export type UpdatePartReturnInput = {
  organizationId: string;

  partReturnId: string;

  data: UpdatePartReturnData;
};

//************************************************************** */

export type PartReturnActionInput = {
  organizationId: string;

  partReturnId: string;
};

//************************************************************** */

export type UpdatePartReturnCreditInput = {
  organizationId: string;

  partReturnId: string;

  data: {
    creditAmount: number;

    creditStatus: PartReturnCreditStatus;
  };
};

//************************************************************** */
