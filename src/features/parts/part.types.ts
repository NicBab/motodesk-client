export type Part = {
  id: string;
  organizationId: string;

  partNumber: string;
  oemPartNumber: string | null;

  alternatePartNumbers: string[];

  description: string;

  brand: string | null;
  category: string | null;

  qtyOnHand: string;
  qtyAllocated: string;
  qtyOnOrder: string;

  reorderPoint: string;

  costPrice: string;
  sellPrice: string;

  location: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

export type PartListQuery = {
  organizationId: string;

  search?: string;
  brand?: string;
  category?: string;

  lowStock?: boolean;
  isActive?: boolean;
};

export type GetPartInput = {
  organizationId: string;
  partId: string;
};

export type CreatePartInput = {
  organizationId: string;

  partNumber: string;

  oemPartNumber?: string;

  alternatePartNumbers?: string[];

  description: string;

  brand?: string;
  category?: string;

  qtyOnHand?: number;
  qtyAllocated?: number;
  qtyOnOrder?: number;

  reorderPoint?: number;

  costPrice?: number;
  sellPrice?: number;

  location?: string;
};

export type UpdatePartData = {
  partNumber?: string;

  oemPartNumber?: string;

  alternatePartNumbers?: string[];

  description?: string;

  brand?: string;
  category?: string;

  reorderPoint?: number;

  costPrice?: number;
  sellPrice?: number;

  location?: string;
};

export type UpdatePartInput = {
  organizationId: string;
  partId: string;

  data: UpdatePartData;
};

export type ArchivePartInput = {
  organizationId: string;
  partId: string;
};

export type AdjustPartInventoryInput = {
  organizationId: string;
  partId: string;

  quantity: number;

  notes?: string;
};

export type CycleCountPartInventoryInput = {
  organizationId: string;
  partId: string;

  countedQuantity: number;

  notes?: string;
};

export type PartInventoryTransaction = {
  id: string;
  partId: string;

  type: string;

  quantity: string;

  onHandBefore: string;
  onHandAfter: string;

  allocatedBefore: string;
  allocatedAfter: string;

  onOrderBefore: string;
  onOrderAfter: string;

  referenceType: string | null;
  referenceId: string | null;

  notes: string | null;

  createdByMembershipId: string | null;

  createdAt: string;
};

export type PartInventoryMutationResult = {
  part: Part;

  transaction: PartInventoryTransaction;
};
