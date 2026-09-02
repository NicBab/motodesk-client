"use client";

import { Lock, Mail, Search, Shield, UserPlus, Users } from "lucide-react";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import type { Employee } from "../employee.types";

import type {
  MembershipRole,
  MembershipStatus,
} from "@/features/memberships/membership.types";

import {
  useCreateMembershipMutation,
  useGetMembershipsQuery,
  useUpdateMembershipMutation,
} from "@/store/api/memberships.Api";

import { useUpdateEmployeeMutation } from "@/store/api/employeesApi";

//************************************************************** */

type Props = {
  organizationId: string;

  employees: Employee[];

  canManage: boolean;
};

//************************************************************** */

type AccountFilter = "ALL" | "ACTIVE" | "INVITED" | "SUSPENDED" | "NO_ACCOUNT";

//************************************************************** */

const roles: Array<{
  value: MembershipRole;

  label: string;
}> = [
  {
    value: "ADMIN",

    label: "Administrator",
  },

  {
    value: "MANAGER",

    label: "Manager",
  },

  {
    value: "SERVICE_ADVISOR",

    label: "Service Advisor",
  },

  {
    value: "TECHNICIAN",

    label: "Technician",
  },

  {
    value: "PARTS",

    label: "Parts",
  },
];

//************************************************************** */

export function UserPermissionsTab({
  organizationId,
  employees,
  canManage,
}: Props) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    employees[0]?.id ?? "",
  );

  const [search, setSearch] = useState("");

  const [accountFilter, setAccountFilter] = useState<AccountFilter>("ALL");

  const [inviteEmail, setInviteEmail] = useState("");

  const [inviteRole, setInviteRole] = useState<MembershipRole>("TECHNICIAN");

  //************************************************************** */

  const { data: memberships = [], isLoading } = useGetMembershipsQuery({
    organizationId,

    pageSize: 100,
  });

  const [createMembership, { isLoading: creatingMembership }] =
    useCreateMembershipMutation();

  const [updateMembership, { isLoading: updatingMembership }] =
    useUpdateMembershipMutation();

  const [updateEmployee, { isLoading: linkingEmployee }] =
    useUpdateEmployeeMutation();

  const saving = creatingMembership || updatingMembership || linkingEmployee;

  //************************************************************** */

  const accessList = useMemo(
    () =>
      employees.map((employee) => {
        const membership = employee.membershipId
          ? (memberships.find((item) => item.id === employee.membershipId) ??
            employee.membership)
          : null;

        return {
          employee,

          membership,
        };
      }),
    [employees, memberships],
  );

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();

    return accessList.filter((item) => {
      const { employee, membership } = item;

      if (accountFilter === "NO_ACCOUNT" && membership) {
        return false;
      }

      if (
        accountFilter !== "ALL" &&
        accountFilter !== "NO_ACCOUNT" &&
        membership?.status !== accountFilter
      ) {
        return false;
      }

      if (!value) {
        return true;
      }

      return [
        employee.firstName,
        employee.lastName,
        employee.email,
        membership?.user?.email,
      ].some((field) => field?.toLowerCase().includes(value));
    });
  }, [accessList, search, accountFilter]);

  const selected =
    accessList.find((item) => item.employee.id === selectedEmployeeId) ?? null;

  //************************************************************** */

  async function handleInvite() {
    if (!canManage || !selected) {
      return;
    }

    const email = inviteEmail.trim() || selected.employee.email?.trim() || "";

    if (!email) {
      toast.error("Enter an email address before creating app access.");

      return;
    }

    try {
      const membership = await createMembership({
        organizationId,

        email,

        role: inviteRole,
      }).unwrap();

      await updateEmployee({
        organizationId,

        employeeId: selected.employee.id,

        data: {
          membershipId: membership.id,

          email,
        },
      }).unwrap();

      toast.success(
        `MotoDesk access created for ${selected.employee.firstName}.`,
      );

      setInviteEmail("");
    } catch {
      toast.error("MotoDesk could not create employee access.");
    }
  }

  //************************************************************** */

  async function handleRoleChange(role: MembershipRole) {
    if (!canManage || !selected?.membership) {
      return;
    }

    try {
      await updateMembership({
        organizationId,

        membershipId: selected.membership.id,

        data: {
          role,
        },
      }).unwrap();

      toast.success("User role updated.");
    } catch {
      toast.error("MotoDesk could not update the user role.");
    }
  }

  //************************************************************** */

  async function handleStatusChange(status: MembershipStatus) {
    if (!canManage || !selected?.membership) {
      return;
    }

    try {
      await updateMembership({
        organizationId,

        membershipId: selected.membership.id,

        data: {
          status,
        },
      }).unwrap();

      toast.success("Account status updated.");
    } catch {
      toast.error("MotoDesk could not update account status.");
    }
  }

  //************************************************************** */

  if (isLoading) {
    return <PanelMessage>Loading user access...</PanelMessage>;
  }

  if (!canManage) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
        <Lock className="mx-auto h-8 w-8 text-zinc-400" />

        <p className="mt-3 text-sm font-semibold text-zinc-800">
          Administrator Access Required
        </p>

        <p className="mx-auto mt-1 max-w-lg text-xs text-zinc-500">
          You do not have permission to manage organization users and access.
        </p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <PanelMessage>Add employees before managing user access.</PanelMessage>
    );
  }

  //************************************************************** */

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="space-y-3 border-b border-zinc-200 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              className={`${inputClassName} pl-9`}
            />
          </div>

          <select
            value={accountFilter}
            onChange={(event) =>
              setAccountFilter(event.target.value as AccountFilter)
            }
            className={inputClassName}
          >
            <option value="ALL">All Accounts</option>

            <option value="ACTIVE">Active</option>

            <option value="INVITED">Invited</option>

            <option value="SUSPENDED">Suspended</option>

            <option value="NO_ACCOUNT">No Account</option>
          </select>
        </div>

        <div className="max-h-[620px] overflow-y-auto">
          {filtered.map((item) => {
            const active = item.employee.id === selectedEmployeeId;

            return (
              <button
                key={item.employee.id}
                type="button"
                onClick={() => setSelectedEmployeeId(item.employee.id)}
                className={`flex w-full items-center gap-3 border-b border-zinc-100 p-4 text-left transition ${
                  active ? "bg-orange-50" : "hover:bg-zinc-50"
                }`}
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
                  {getInitials(item.employee)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {item.employee.firstName} {item.employee.lastName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {item.membership
                      ? formatRole(item.membership.role)
                      : "No MotoDesk account"}
                  </p>
                </div>

                <AccountBadge status={item.membership?.status ?? null} />
              </button>
            );
          })}
        </div>
      </section>

      {selected ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="flex items-start gap-4 border-b border-zinc-200 pb-5">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-orange-50 font-bold text-orange-600">
              {getInitials(selected.employee)}
            </div>

            <div>
              <h2 className="font-bold text-zinc-900">
                {selected.employee.firstName} {selected.employee.lastName}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {selected.employee.email ?? "No employee email"}
              </p>
            </div>
          </div>

          {selected.membership ? (
            <div className="space-y-6 pt-6">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-500" />

                  <h3 className="text-sm font-bold text-zinc-900">
                    MotoDesk Access
                  </h3>
                </div>

                <p className="mt-1 text-xs text-zinc-500">
                  This employee is linked to an organization Membership.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="User Role">
                  <select
                    value={selected.membership.role}
                    disabled={saving || selected.membership.role === "OWNER"}
                    onChange={(event) =>
                      void handleRoleChange(
                        event.target.value as MembershipRole,
                      )
                    }
                    className={inputClassName}
                  >
                    {selected.membership.role === "OWNER" ? (
                      <option value="OWNER">Owner</option>
                    ) : null}

                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Account Status">
                  <select
                    value={selected.membership.status}
                    disabled={saving || selected.membership.role === "OWNER"}
                    onChange={(event) =>
                      void handleStatusChange(
                        event.target.value as MembershipStatus,
                      )
                    }
                    className={inputClassName}
                  >
                    <option value="ACTIVE">Active</option>

                    <option value="INVITED">Invited</option>

                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </Field>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                  Login Email
                </p>

                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <Mail className="h-4 w-4 text-zinc-400" />

                  {selected.membership.user.email}
                </p>
              </div>

              <p className="text-xs leading-relaxed text-zinc-500">
                The selected role controls the default permission set. Granular
                permission overrides remain managed by MotoDesk&apos;s
                permission system.
              </p>
            </div>
          ) : (
            <div className="space-y-5 pt-6">
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
                <UserPlus className="mx-auto h-7 w-7 text-zinc-400" />

                <p className="mt-2 text-sm font-semibold text-zinc-800">
                  No MotoDesk account
                </p>

                <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">
                  This employee can still use scheduling and Time Clock without
                  an application login.
                </p>
              </div>

              <Field label="Login Email">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder={
                    selected.employee.email ?? "employee@example.com"
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="Application Role">
                <select
                  value={inviteRole}
                  onChange={(event) =>
                    setInviteRole(event.target.value as MembershipRole)
                  }
                  className={inputClassName}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </Field>

              <button
                type="button"
                disabled={saving}
                onClick={() => void handleInvite()}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />

                {saving ? "Creating Access..." : "Create App Access"}
              </button>
            </div>
          )}
        </section>
      ) : (
        <PanelMessage>Select an employee.</PanelMessage>
      )}
    </div>
  );
}

//************************************************************** */

function Field({
  label,
  children,
}: {
  label: string;

  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-zinc-700">
        {label}
      </span>

      {children}
    </label>
  );
}

//************************************************************** */

function AccountBadge({ status }: { status: MembershipStatus | null }) {
  if (!status) {
    return (
      <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500">
        No Account
      </span>
    );
  }

  const className =
    status === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700"
      : status === "SUSPENDED"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-bold ${className}`}
    >
      {formatRole(status)}
    </span>
  );
}

//************************************************************** */

function PanelMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
      <div>
        <Users className="mx-auto mb-2 h-6 w-6 text-zinc-300" />

        {children}
      </div>
    </div>
  );
}

//************************************************************** */

function getInitials(employee: Employee): string {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(
    0,
  )}`.toUpperCase();
}

//************************************************************** */

function formatRole(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

const inputClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-zinc-100";

//************************************************************** */
