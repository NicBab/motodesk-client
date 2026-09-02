"use client";

import {
  Edit,
  Mail,
  Phone,
  Plus,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import { EmployeeDialog } from "@/features/employees/components/EmployeeDialog";

import { TimeAttendanceTab } from "@/features/time-clock/components/TimeAttendanceTab";

import { UserPermissionsTab } from "@/features/employees/components/UserPermissionsTab";

import type {
  Employee,
  EmployeeRole,
  EmployeeStatus,
} from "@/features/employees/employee.types";

import { useGetCurrentUserQuery } from "@/store/api/authApi";

import {
  useDeactivateEmployeeMutation,
  useGetEmployeesQuery,
  useRestoreEmployeeMutation,
} from "@/store/api/employeesApi";

import { useAppSelector } from "@/store/hooks";

import { selectActiveOrganizationId } from "@/store/slices/workspaceSlice";

//************************************************************** */

type EmployeeTab = "employees" | "time-attendance" | "permissions";

type StatusFilter = "ALL" | EmployeeStatus;

//************************************************************** */

export default function EmployeesPage() {
  const organizationId = useAppSelector(selectActiveOrganizationId);

  const [activeTab, setActiveTab] = useState<EmployeeTab>("employees");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [roleFilter, setRoleFilter] = useState<EmployeeRole | "">("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  //************************************************************** */

  const { data: session } = useGetCurrentUserQuery();

  const {
    data: employees = [],
    isLoading,
    isFetching,
    isError,
  } = useGetEmployeesQuery(
    {
      organizationId: organizationId ?? "",

      ...(activeTab === "employees"
        ? {
            search: search.trim() || undefined,

            ...(statusFilter !== "ALL"
              ? {
                  status: statusFilter,
                }
              : {}),

            ...(roleFilter
              ? {
                  role: roleFilter,
                }
              : {}),
          }
        : {}),
    },
    {
      skip: !organizationId,
    },
  );

  const [deactivateEmployee, { isLoading: isDeactivating }] =
    useDeactivateEmployeeMutation();

  const [restoreEmployee, { isLoading: isRestoring }] =
    useRestoreEmployeeMutation();

  const actionBusy = isDeactivating || isRestoring;

  //************************************************************** */

  const canManageTimeClock =
    session?.permissions.includes("time_clock:manage") ?? false;

  const canManageMemberships =
    session?.permissions.includes("memberships:update") ||
    session?.permissions.includes("memberships:create") ||
    false;

  const activeCount = employees.filter(
    (employee) => employee.status === "ACTIVE",
  ).length;

  //************************************************************** */

  function handleAdd() {
    setEditingEmployee(null);

    setDialogOpen(true);
  }

  //************************************************************** */

  function handleEdit(employee: Employee) {
    setEditingEmployee(employee);

    setDialogOpen(true);
  }

  //************************************************************** */

  function handleCloseDialog() {
    setDialogOpen(false);

    setEditingEmployee(null);
  }

  //************************************************************** */

  async function handleDeactivate(employee: Employee) {
    if (!organizationId) {
      return;
    }

    try {
      await deactivateEmployee({
        organizationId,

        employeeId: employee.id,
      }).unwrap();

      toast.success(`${employee.firstName} ${employee.lastName} deactivated.`);
    } catch {
      toast.error("MotoDesk could not deactivate the employee.");
    }
  }

  //************************************************************** */

  async function handleRestore(employee: Employee) {
    if (!organizationId) {
      return;
    }

    try {
      await restoreEmployee({
        organizationId,

        employeeId: employee.id,
      }).unwrap();

      toast.success(`${employee.firstName} ${employee.lastName} restored.`);
    } catch {
      toast.error("MotoDesk could not restore the employee.");
    }
  }

  //************************************************************** */

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Employees
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            {activeCount} active
            {" · "}
            {employees.length} total
          </p>
        </div>

        {activeTab === "employees" ? (
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        ) : null}
      </div>

      <div className="flex overflow-x-auto border-b border-zinc-200">
        <EmployeeTabButton
          active={activeTab === "employees"}
          label="Employees"
          onClick={() => setActiveTab("employees")}
        />

        <EmployeeTabButton
          active={activeTab === "time-attendance"}
          label="Time and Attendance"
          onClick={() => setActiveTab("time-attendance")}
        />

        <EmployeeTabButton
          active={activeTab === "permissions"}
          label="User Permissions"
          onClick={() => setActiveTab("permissions")}
        />
      </div>

      {activeTab === "employees" ? (
        <>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employee, email, phone, skills..."
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className={selectClassName}
            >
              <option value="ALL">All Statuses</option>

              <option value="ACTIVE">Active</option>

              <option value="INACTIVE">Inactive</option>
            </select>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as EmployeeRole | "")
              }
              className={selectClassName}
            >
              <option value="">All Roles</option>

              <option value="TECHNICIAN">Technician</option>

              <option value="SERVICE_ADVISOR">Service Advisor</option>

              <option value="SHOP_MANAGER">Shop Manager</option>

              <option value="CASHIER">Cashier</option>

              <option value="PARTS_SPECIALIST">Parts Specialist</option>
            </select>
          </div>

          {isLoading ? (
            <PageMessage>Loading employees...</PageMessage>
          ) : isError ? (
            <PageMessage>MotoDesk could not load employees.</PageMessage>
          ) : employees.length === 0 ? (
            <PageMessage>No employees match the current filters.</PageMessage>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  actionBusy={actionBusy}
                  onEdit={() => handleEdit(employee)}
                  onDeactivate={() => void handleDeactivate(employee)}
                  onRestore={() => void handleRestore(employee)}
                />
              ))}
            </div>
          )}

          {isFetching && !isLoading ? (
            <p className="text-xs text-zinc-400">Updating employees...</p>
          ) : null}
        </>
      ) : null}

      {activeTab === "time-attendance" && organizationId ? (
        <TimeAttendanceTab
          organizationId={organizationId}
          employees={employees}
        />
      ) : null}

      {activeTab === "permissions" && organizationId ? (
        <UserPermissionsTab
          organizationId={organizationId}
          employees={employees}
          canManage={canManageMemberships}
        />
      ) : null}

      {organizationId && dialogOpen ? (
        <EmployeeDialog
          key={editingEmployee ? `edit-${editingEmployee.id}` : "add-employee"}
          organizationId={organizationId}
          employee={editingEmployee}
          open
          onClose={handleCloseDialog}
        />
      ) : null}
    </div>
  );
}

//************************************************************** */

function EmployeeTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;

  label: string;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold transition ${
        active
          ? "border-orange-500 text-orange-600"
          : "border-transparent text-zinc-500 hover:text-zinc-800"
      }`}
    >
      {label}
    </button>
  );
}

//************************************************************** */

function EmployeeCard({
  employee,
  actionBusy,
  onEdit,
  onDeactivate,
  onRestore,
}: {
  employee: Employee;

  actionBusy: boolean;

  onEdit: () => void;

  onDeactivate: () => void;

  onRestore: () => void;
}) {
  const initials = `${employee.firstName.charAt(0)}${employee.lastName.charAt(
    0,
  )}`.toUpperCase();

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-orange-50 text-sm font-bold text-orange-600">
            {initials}
          </div>

          <div className="min-w-0">
            <h2 className="truncate font-semibold text-zinc-900">
              {employee.firstName} {employee.lastName}
            </h2>

            <p className="mt-0.5 text-xs font-medium text-zinc-500">
              {formatRole(employee.role)}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
            employee.status === "ACTIVE"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-zinc-200 bg-zinc-100 text-zinc-500"
          }`}
        >
          {employee.status === "ACTIVE" ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-zinc-600">
        {employee.phone ? (
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-zinc-400" />

            {employee.phone}
          </p>
        ) : null}

        {employee.email ? (
          <p className="flex min-w-0 items-center gap-2">
            <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-400" />

            <span className="truncate">{employee.email}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-4">
        <Metric
          label="Hourly"
          value={formatCurrency(Number(employee.hourlyRate))}
        />

        <Metric
          label="Labor"
          value={formatCurrency(Number(employee.laborRate))}
        />
      </div>

      <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-4">
        <button
          type="button"
          disabled={actionBusy}
          onClick={onEdit}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </button>

        {employee.status === "ACTIVE" ? (
          <button
            type="button"
            disabled={actionBusy}
            onClick={onDeactivate}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            <UserX className="h-3.5 w-3.5" />
            Deactivate
          </button>
        ) : (
          <button
            type="button"
            disabled={actionBusy}
            onClick={onRestore}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Restore
          </button>
        )}
      </div>
    </article>
  );
}

//************************************************************** */

function Metric({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-lg bg-zinc-50 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-bold text-zinc-900">{value}</p>
    </div>
  );
}

//************************************************************** */

function PageMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
      {children}
    </div>
  );
}

//************************************************************** */

function formatRole(role: EmployeeRole): string {
  return role
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",

    currency: "USD",
  }).format(value);
}

//************************************************************** */

const selectClassName =
  "h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */
