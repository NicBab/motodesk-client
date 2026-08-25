export type VehicleType =
  | "MOTORCYCLE"
  | "ATV"
  | "UTV"
  | "SCOOTER"
  | "PWC"
  | "SNOWMOBILE";

//************************************************************** */

export type VehicleClassification =
  | "NEW"
  | "USED"
  | "SERVICE";

 //************************************************************** */

export type VehicleInventoryStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "PENDING_SALE"
  | "SOLD"
  | "WHOLESALE"
  | "UNAVAILABLE";

 //************************************************************** */

export type Vehicle = {
  id: string;
  organizationId: string;
  customerId: string | null;

  year: number | null;

  make: string;
  model: string;
  trim: string | null;

  vin: string | null;
  mileage: number | null;

  color: string | null;
  licensePlate: string | null;

  type: VehicleType | null;

  classification: VehicleClassification;

  inventoryStatus: VehicleInventoryStatus;

  stockNumber: string | null;

  listPrice: string | null;
  unitCost: string | null;

  salesperson: string | null;

  notes: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

//************************************************************** */

export type VehicleListQuery = {
  organizationId: string;

  search?: string;

  customerId?: string;

  type?: VehicleType;

  classification?: VehicleClassification;

  inventoryStatus?: VehicleInventoryStatus;

  isActive?: boolean;
};

//************************************************************** */

export type GetVehicleInput = {
  organizationId: string;
  vehicleId: string;
};

 //************************************************************** */

export type CreateVehicleInput = {
  organizationId: string;

  customerId?: string;

  year?: number;

  make: string;
  model: string;

  trim?: string;

  vin?: string;

  mileage?: number;

  color?: string;

  licensePlate?: string;

  type?: VehicleType;

  classification?: VehicleClassification;

  inventoryStatus?: VehicleInventoryStatus;

  stockNumber?: string;

  listPrice?: number;
  unitCost?: number;

  salesperson?: string;

  notes?: string;
};

 //************************************************************** */

export type UpdateVehicleData = {
  customerId?: string;

  year?: number;

  make?: string;
  model?: string;

  trim?: string;

  vin?: string;

  mileage?: number;

  color?: string;

  licensePlate?: string;

  type?: VehicleType;

  classification?: VehicleClassification;

  inventoryStatus?: VehicleInventoryStatus;

  stockNumber?: string;

  listPrice?: number;
  unitCost?: number;

  salesperson?: string;

  notes?: string;
};

//************************************************************** */

export type UpdateVehicleInput = {
  organizationId: string;
  vehicleId: string;

  data: UpdateVehicleData;
};

 //************************************************************** */

export type ArchiveVehicleInput = {
  organizationId: string;
  vehicleId: string;
};

 //************************************************************** */