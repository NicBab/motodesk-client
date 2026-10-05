//************************************************************** */

export type AuditJsonValue =
  | string
  | number
  | boolean
  | null
  | AuditJsonValue[]
  | {
      [key: string]: AuditJsonValue;
    };

//************************************************************** */

export type AuditLogActor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

//************************************************************** */

export type AuditLogItem = {
  id: string;
  organizationId: string | null;
  actorUserId: string | null;
  actorUser: AuditLogActor | null;

  action: string;
  resourceType: string;
  resourceId: string | null;

  ipAddress: string | null;
  userAgent: string | null;

  metadata: AuditJsonValue;
  createdAt: string;
};

//************************************************************** */

export type AuditLogPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

//************************************************************** */

export type AuditLogListResponse = {
  items: AuditLogItem[];
  pagination: AuditLogPagination;
};

//************************************************************** */

export type AuditLogListInput = {
  organizationId: string;

  page: number;
  pageSize: number;

  search?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  actorUserId?: string;

  // ISO timestamps with an explicit timezone.
  createdFrom?: string;
  createdBefore?: string;
};

//************************************************************** */

export type AuditLogActorOption = {
  id: string;

  // Historical events can retain an actor ID without a User relation.
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

//************************************************************** */

export type AuditLogFilterOptions = {
  actions: string[];
  resourceTypes: string[];
  actors: AuditLogActorOption[];
};

//************************************************************** */

export type AuditLogFilterOptionsInput = {
  organizationId: string;
};

//************************************************************** */