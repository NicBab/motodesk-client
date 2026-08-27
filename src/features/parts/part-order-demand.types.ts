export type PartOrderDemandStatus = "NEEDS_REVIEW" | "TO_BE_ORDERED";

//************************************************************** */

export type PartOrderDemandItem = {
  partLineId: string;

  repairOrderId: string;

  roNumber: number;

  customerName: string;

  vehicleDescription: string;

  partId: string | null;

  partNumber: string;

  description: string;

  requiredQty: number;

  approvedQty: number;

  allocatedQty: number;

  orderedQty: number;

  availableQty: number;

  qtyToOrder: number;

  estimatedCost: number;

  vendorName: string | null;

  status: PartOrderDemandStatus;

  resolutionMethod: string | null;

  blocksWork: boolean;

  alreadyOnPurchaseOrder: boolean;

  purchaseOrderNumbers: number[];

  dateNeeded: string;
};

//************************************************************** */

export type PartOrderDemandQuery = {
  organizationId: string;

  search?: string;
};

//************************************************************** */
