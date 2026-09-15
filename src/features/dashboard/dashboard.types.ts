//************************************************************** */

export type DashboardSummary = {
  openRepairOrders: number;

  vehiclesInShop: number;

  lowStockAlerts: number;

  completedThisMonth: number;
};

//************************************************************** */

export type DashboardWorkflowSummary = {
  awaitingApproval: number;

  waitingOnParts: number;

  readyToWork: number;

  readyForPickup: number;
};

//************************************************************** */

export type DashboardSalesSummary = {
  grossSales: number;

  returnsTotal: number;

  netSales: number;

  returnRate: number;

  averageSale: number;

  saleCount: number;
};

//************************************************************** */

export type DashboardPartsDemandSummary = {
  toBeOrdered: number;

  backordered: number;
};

//************************************************************** */

export type DashboardRecentRepairOrderActivity = {
  id: string;

  roNumber: number;

  status: string;

  priority: string;

  customerName: string;

  vehicleDescription: string;

  updatedAt: string;
};

//************************************************************** */

export type DashboardLowStockPart = {
  id: string;

  partNumber: string;

  description: string;

  location: string | null;

  qtyOnHand: number;

  qtyAllocated: number;

  qtyOnOrder: number;

  reorderPoint: number;
};

//************************************************************** */

export type DashboardExpectedDelivery = {
  id: string;

  poNumber: number;

  vendorId: string;

  vendorName: string;

  status: string;

  expectedAt: string;

  orderedAt: string | null;

  lineCount: number;

  remainingQuantity: number;
};

//************************************************************** */

export type DashboardOverview = {
  summary: DashboardSummary;

  workflow: DashboardWorkflowSummary;

  salesMtd: DashboardSalesSummary;

  partsDemand: DashboardPartsDemandSummary;

  recentActivity: DashboardRecentRepairOrderActivity[];

  lowStockParts: DashboardLowStockPart[];

  expectedDeliveries: DashboardExpectedDelivery[];
};

//************************************************************** */

export type GetDashboardOverviewInput = {
  organizationId: string;
};

//************************************************************** */
