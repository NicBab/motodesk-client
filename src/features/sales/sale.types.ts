import type { Customer } from "../customers/customer.types";

import type { Part } from "../parts/part.types";

//************************************************************** */

export type SaleType = "POS" | "RO" | "REFUND";

//************************************************************** */

export type SaleStatus =
  | "COMPLETED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "VOID";

//************************************************************** */

export type SalePaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "CHECK"
  | "ACH"
  | "EXTERNAL_TERMINAL"
  | "SPLIT";

//************************************************************** */

export type SaleTenderMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "CHECK"
  | "ACH"
  | "EXTERNAL_TERMINAL";

//************************************************************** */

export type SaleReturnReason =
  | "WRONG_PART"
  | "DEFECTIVE_PART"
  | "WARRANTY"
  | "CUSTOMER_CANCELLED"
  | "DUPLICATE_SALE"
  | "PRICING_ADJUSTMENT"
  | "LABOR_REFUND"
  | "GOODWILL"
  | "INVENTORY_CORRECTION"
  | "OTHER";

//************************************************************** */

export type SaleReturnDisposition =
  | "RETURN_TO_INVENTORY"
  | "SCRAP_NON_RESELLABLE";

//************************************************************** */

export type SaleLine = {
  id: string;
  saleId: string;

  type: "PART" | "LABOR";

  partId: string | null;

  originalSaleLineId: string | null;

  partNumber: string | null;

  description: string;

  quantity: string;

  unitPrice: string;

  returnedQty: string;

  part: Part | null;

  createdAt: string;
  updatedAt: string;
};

//************************************************************** */

export type SalePayment = {
  id: string;
  saleId: string;

  method: SaleTenderMethod;

  amount: string;

  reference: string | null;

  remote: boolean;

  createdAt: string;
};

//************************************************************** */

export type Sale = {
  id: string;
  organizationId: string;

  saleNumber: number;

  type: SaleType;
  status: SaleStatus;

  customerId: string | null;
  customerName: string;

  repairOrderId: string | null;
  roNumber: number | null;

  subtotal: string;

  discountAmount: string;
  discountReason: string | null;

  taxRate: string;
  taxAmount: string;

  total: string;

  refundedTotal: string;

  paymentMethod: SalePaymentMethod;

  cashierMembershipId: string | null;
  cashierName: string | null;

  originalSaleId: string | null;
  originalSaleNumber: number | null;

  returnReason: SaleReturnReason | null;
  returnDisposition: SaleReturnDisposition | null;

  managerNotes: string | null;

  processedByMembershipId: string | null;
  processedByName: string | null;

  customer: Customer | null;

  lines: SaleLine[];

  payments: SalePayment[];

  refunds: Sale[];

  createdAt: string;
  updatedAt: string;
};

//************************************************************** */

export type CreateSaleLineInput = {
  partId: string;

  quantity: number;

  unitPrice?: number;
};

//************************************************************** */

export type CreateSalePaymentInput = {
  method: SaleTenderMethod;

  amount: number;

  reference?: string;

  remote?: boolean;
};

//************************************************************** */

export type CreatePosSaleInput = {
  organizationId: string;

  customerId?: string;

  taxRate?: number;

  discountAmount?: number;

  discountReason?: string;

  managerNotes?: string;

  lines: CreateSaleLineInput[];

  payments: CreateSalePaymentInput[];
};

//************************************************************** */

export type CreateSaleReturnLineInput = {
  originalSaleLineId: string;

  quantity: number;
};

//************************************************************** */

export type CreateSaleReturnInput = {
  organizationId: string;

  saleId: string;

  reason: SaleReturnReason;

  disposition: SaleReturnDisposition;

  managerNotes?: string;

  lines: CreateSaleReturnLineInput[];

  payments: CreateSalePaymentInput[];
};

//************************************************************** */

export type SaleListQuery = {
  organizationId: string;

  search?: string;

  type?: SaleType;

  status?: SaleStatus;

  customerId?: string;

  repairOrderId?: string;
};

//************************************************************** */

export type GetSaleInput = {
  organizationId: string;

  saleId: string;
};

//************************************************************** */
