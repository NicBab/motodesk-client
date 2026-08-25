//************************************************************** */

export type CustomerType =
  | "INDIVIDUAL"
  | "BUSINESS";

//************************************************************** */

export type Customer = {
  id: string;
  organizationId: string;

  type: CustomerType;

  firstName: string | null;
  lastName: string | null;
  companyName: string | null;

  email: string | null;
  phone: string | null;
  alternatePhone: string | null;

  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;

  notes: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

//************************************************************** */

export type CustomerListQuery = {
  organizationId: string;

  search?: string;
  type?: CustomerType;
  isActive?: boolean;
};

//************************************************************** */

export type GetCustomerInput = {
  organizationId: string;
  customerId: string;
};

//************************************************************** */

export type CreateCustomerInput = {
  organizationId: string;

  type: CustomerType;

  firstName?: string;
  lastName?: string;
  companyName?: string;

  email?: string;
  phone?: string;
  alternatePhone?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  notes?: string;
};

//************************************************************** */

export type UpdateCustomerData = {
  type?: CustomerType;

  firstName?: string;
  lastName?: string;
  companyName?: string;

  email?: string;
  phone?: string;
  alternatePhone?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  notes?: string;
};

//************************************************************** */

export type UpdateCustomerInput = {
  organizationId: string;
  customerId: string;
  data: UpdateCustomerData;
};

//************************************************************** */

export type ArchiveCustomerInput = {
  organizationId: string;
  customerId: string;
};

//************************************************************** */