import type { RepairOrderApprovalMethod } from "./repair-order.types";

export type RepairOrderAdditionalWorkInput = {
  organizationId: string;
  repairOrderId: string;
};

export type SendAdditionalWorkToPartsReviewInput =
  RepairOrderAdditionalWorkInput & {
    notes: string;
  };

export type RequestAdditionalWorkApprovalInput =
  RepairOrderAdditionalWorkInput & {
    notes: string;
  };

export type ApproveAdditionalWorkInput = RepairOrderAdditionalWorkInput & {
  approvalMethod: RepairOrderApprovalMethod;

  approvedBy: string;

  approvedAmount?: number;

  notes?: string;
};

export type DeclineAdditionalWorkInput = RepairOrderAdditionalWorkInput & {
  notes: string;
};
