"use client";

import { Lock, Users } from "lucide-react";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import type { Employee } from "../employee.types";

import { EmployeeAccessDetails } from "./EmployeeAccessDetails";

import { EmployeeAccessList } from "./EmployeeAccessList";

import { PermissionEditor } from "./PermissionEditor";

import type {
  AccountFilter,
  EmployeeAccessItem,
} from "./user-permissions.types";

import { resolveSelectedEmployeeId } from "./user-permissions.utils";

import type {
  MembershipRole,
  MembershipStatus,
} from "@/features/memberships/membership.types";

import { useCreateMembershipInvitationMutation } from "@/store/api/membershipInvitationsApi";

import {
  useGetMembershipsQuery,
  useUpdateMembershipMutation,
} from "@/store/api/memberships.Api";

import { useGetPermissionCatalogQuery } from "@/store/api/permissionsApi";

//************************************************************** */

type Props = {
  organizationId: string;

  employees: Employee[];

  canManage: boolean;

  isOwner: boolean;
};

//************************************************************** */

export function UserPermissionsTab({
  organizationId,
  employees,
  canManage,
  isOwner,
}: Props) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    employees[0]?.id ?? "",
  );

  const [search, setSearch] = useState("");

  const [accountFilter, setAccountFilter] = useState<AccountFilter>("ALL");

  const [inviteEmail, setInviteEmail] = useState("");

  const [inviteRole, setInviteRole] = useState<MembershipRole>("TECHNICIAN");

  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(
    null,
  );

  //************************************************************** */

  const { data: memberships = [], isLoading: membershipsLoading } =
    useGetMembershipsQuery({
      organizationId,

      pageSize: 100,
    });

  const { data: catalog, isLoading: catalogLoading } =
    useGetPermissionCatalogQuery({
      organizationId,
    });

  const [createInvitation, { isLoading: creatingInvitation }] =
    useCreateMembershipInvitationMutation();

  const [updateMembership, { isLoading: updatingMembership }] =
    useUpdateMembershipMutation();

  const saving = creatingInvitation || updatingMembership;

  //************************************************************** */

  const accessList = useMemo<EmployeeAccessItem[]>(
    () =>
      employees.map((employee) => ({
        employee,

        membership: employee.membershipId
          ? (memberships.find(
              (membership) => membership.id === employee.membershipId,
            ) ?? employee.membership)
          : null,
      })),
    [employees, memberships],
  );

  const resolvedSelectedEmployeeId = resolveSelectedEmployeeId(
    accessList,
    selectedEmployeeId,
  );

  //************************************************************** */

  const filteredAccessList = useMemo(() => {
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
        membership?.user.email,
      ].some((field) => field?.toLowerCase().includes(value));
    });
  }, [accessList, accountFilter, search]);

  const selected =
    accessList.find(
      (item) => item.employee.id === resolvedSelectedEmployeeId,
    ) ?? null;

  //************************************************************** */

  function handleSelectEmployee(employeeId: string) {
    setSelectedEmployeeId(employeeId);

    setGeneratedInviteUrl(null);

    setInviteEmail("");
  }

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
      const result = await createInvitation({
        organizationId,

        employeeId: selected.employee.id,

        email,

        role: inviteRole,
      }).unwrap();

      setGeneratedInviteUrl(
        `${window.location.origin}/accept-invitation?token=${encodeURIComponent(
          result.token,
        )}`,
      );

      toast.success(`Invitation created for ${selected.employee.firstName}.`);
    } catch {
      toast.error("MotoDesk could not create the employee invitation.");
    }
  }

  //************************************************************** */

  async function handleCopyInvite() {
    if (!generatedInviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedInviteUrl);

      toast.success("Invitation link copied.");
    } catch {
      toast.error("MotoDesk could not copy the invitation link.");
    }
  }

  //************************************************************** */

  async function handleRoleChange(role: MembershipRole) {
    if (!selected?.membership || selected.membership.role === "OWNER") {
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

      toast.success("User role and default permissions updated.");
    } catch {
      toast.error("MotoDesk could not update the user role.");
    }
  }

  //************************************************************** */

  async function handleStatusChange(status: MembershipStatus) {
    if (!selected?.membership || selected.membership.role === "OWNER") {
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

  if (membershipsLoading || catalogLoading) {
    return <PageMessage>Loading user permissions...</PageMessage>;
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
      <PageMessage>Add employees before managing user access.</PageMessage>
    );
  }

  //************************************************************** */

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <EmployeeAccessList
        items={filteredAccessList}
        selectedEmployeeId={resolvedSelectedEmployeeId}
        search={search}
        accountFilter={accountFilter}
        onSearchChange={setSearch}
        onFilterChange={setAccountFilter}
        onSelectEmployee={handleSelectEmployee}
      />

      {selected ? (
        <div className="space-y-5">
          <EmployeeAccessDetails
            selected={selected}
            inviteEmail={inviteEmail}
            inviteRole={inviteRole}
            generatedInviteUrl={generatedInviteUrl}
            saving={saving}
            onEmailChange={setInviteEmail}
            onInviteRoleChange={setInviteRole}
            onMembershipRoleChange={(role) => void handleRoleChange(role)}
            onStatusChange={(status) => void handleStatusChange(status)}
            onInvite={() => void handleInvite()}
            onCopyInvite={() => void handleCopyInvite()}
          />

          {selected.membership && catalog ? (
            <PermissionEditor
              key={`${selected.membership.id}-${selected.membership.role}`}
              organizationId={organizationId}
              membership={selected.membership}
              catalog={catalog.permissions}
              roleDefaults={
                catalog.roleDefaults[selected.membership.role] ?? []
              }
              isOwner={isOwner}
            />
          ) : null}
        </div>
      ) : (
        <PageMessage>Select an employee.</PageMessage>
      )}
    </div>
  );
}

//************************************************************** */

function PageMessage({ children }: { children: React.ReactNode }) {
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
