import type { ReportsOverview } from "../report.types";

import { ReportActivityTables } from "./ReportActivityTables";

import { ReportLeaderboards } from "./ReportLeaderBoards";

import { ReportPosTransactionsTable } from "./ReportPosTransactionsTable";

import { ReportRepairOrdersTable } from "./ReportRepairOrdersTable";

//************************************************************** */

type ReportsDetailsProps = {
  report: ReportsOverview;
};

//************************************************************** */

export function ReportsDetails({ report }: ReportsDetailsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <ReportActivityTables
        cashiered={report.cashieredRepairOrders}
        pickedUp={report.pickedUpRepairOrders}
      />

      <ReportLeaderboards
        technicians={report.technicianPerformance}
        customers={report.topCustomers}
        parts={report.topParts}
      />

      <ReportPosTransactionsTable transactions={report.posTransactions} />

      <ReportRepairOrdersTable
        transactions={report.repairOrderTransactions}
        technicians={report.filters.technicians}
        serviceAdvisors={report.filters.serviceAdvisors}
      />
    </div>
  );
}

//************************************************************** */
