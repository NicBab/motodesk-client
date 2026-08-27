import type { Part } from "./part.types";

import type { Vendor } from "./vendor.types";

//************************************************************** */

export type PurchaseOrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "ORDERED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED"
  | "CLOSED";

//************************************************************** */

export type PurchaseOrderRepairOrderPartLine = {
  id: string;

  repairOrderId: string;

  partId: string | null;

  partNumber: string;
  description: string;

  status: string;
};

//************************************************************** */

export type PurchaseOrderLine = {
  id: string;

  purchaseOrderId: string;

  partId: string | null;

  repairOrderPartLineId: string | null;

  partNumber: string;
  description: string;

  orderedQty: string;
  receivedQty: string;
  damagedQty: string;
  backorderedQty: string;

  unitCost: string;
  actualCost: string | null;

  invoiceNumber: string | null;
  packingSlip: string | null;
  binLocation: string | null;

  part: Part | null;

  repairOrderPartLine: PurchaseOrderRepairOrderPartLine | null;

  createdAt: string;
  updatedAt: string;
};

//************************************************************** */

export type PurchaseOrder = {
  id: string;
  organizationId: string;

  vendorId: string;

  poNumber: number;

  status: PurchaseOrderStatus;

  orderedAt: string | null;
  expectedAt: string | null;
  receivedAt: string | null;

  vendorReference: string | null;

  shippingCost: string;
  taxAmount: string;

  notes: string | null;

  isActive: boolean;

  vendor: Vendor;

  lines: PurchaseOrderLine[];

  createdAt: string;
  updatedAt: string;
};

//************************************************************** */

export type PurchaseOrderListQuery = {
  organizationId: string;

  search?: string;
  vendorId?: string;

  status?: PurchaseOrderStatus;

  isActive?: boolean;
};

//************************************************************** */

export type GetPurchaseOrderInput = {
  organizationId: string;
  purchaseOrderId: string;
};

//************************************************************** */

export type CreatePurchaseOrderLineInput = {
  partId?: string;

  repairOrderPartLineId?: string;

  partNumber?: string;
  description?: string;

  orderedQty: number;
  unitCost: number;
};

//************************************************************** */

export type CreatePurchaseOrderInput = {
  organizationId: string;

  vendorId: string;

  expectedAt?: string;

  vendorReference?: string;

  shippingCost?: number;
  taxAmount?: number;

  notes?: string;

  lines: CreatePurchaseOrderLineInput[];
};

//************************************************************** */

export type UpdatePurchaseOrderData = {
  vendorId?: string;

  expectedAt?: string;

  vendorReference?: string;

  shippingCost?: number;
  taxAmount?: number;

  notes?: string;
};

//************************************************************** */

export type UpdatePurchaseOrderInput = {
  organizationId: string;
  purchaseOrderId: string;

  data: UpdatePurchaseOrderData;
};

//************************************************************** */

export type PurchaseOrderActionInput = {
  organizationId: string;
  purchaseOrderId: string;
};

//************************************************************** */

export type ReceivePurchaseOrderLineData = {
  purchaseOrderLineId: string;

  quantity: number;

  damagedQty?: number;
  backorderedQty?: number;

  actualCost?: number;

  invoiceNumber?: string;
  packingSlip?: string;
  binLocation?: string;

  notes?: string;
};

//************************************************************** */

export type ReceivePurchaseOrderLineInput = {
  organizationId: string;
  purchaseOrderId: string;

  data: ReceivePurchaseOrderLineData;
};

//************************************************************** */

export type CancelPurchaseOrderInput = PurchaseOrderActionInput & {
  notes?: string;
};

//************************************************************** */