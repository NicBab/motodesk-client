export type Vendor = {
  id: string;
  organizationId: string;

  name: string;

  accountNumber: string | null;

  email: string | null;
  phone: string | null;
  website: string | null;

  addressLine1: string | null;
  addressLine2: string | null;

  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;

  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;

  notes: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

export type VendorListQuery = {
  organizationId: string;

  search?: string;
  isActive?: boolean;
};

export type GetVendorInput = {
  organizationId: string;
  vendorId: string;
};

export type CreateVendorInput = {
  organizationId: string;

  name: string;

  accountNumber?: string;

  email?: string;
  phone?: string;
  website?: string;

  addressLine1?: string;
  addressLine2?: string;

  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;

  notes?: string;
};

export type UpdateVendorData = {
  name?: string;

  accountNumber?: string;

  email?: string;
  phone?: string;
  website?: string;

  addressLine1?: string;
  addressLine2?: string;

  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;

  notes?: string;
};

export type UpdateVendorInput = {
  organizationId: string;
  vendorId: string;

  data: UpdateVendorData;
};

export type ArchiveVendorInput = {
  organizationId: string;
  vendorId: string;
};

export type RestoreVendorInput = {
  organizationId: string;
  vendorId: string;
};
