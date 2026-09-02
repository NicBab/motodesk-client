"use client";

import { CheckCircle2, Copy, Mail, Shield, UserPlus } from "lucide-react";

import type { EmployeeAccessItem } from "./user-permissions.types";

import { EMPLOYEE_ACCESS_ROLES } from "./user-permissions.types";

import { getEmployeeInitials } from "./user-permissions.utils";

import type {
  MembershipRole,
  MembershipStatus,
} from "@/features/memberships/membership.types";

//************************************************************** */

type Props = {
  selected: EmployeeAccessItem;

  inviteEmail: string;

  inviteRole: MembershipRole;

  generatedInviteUrl: string | null;

  saving: boolean;

  onEmailChange: (value: string) => void;

  onInviteRoleChange: (value: MembershipRole) => void;

  onMembershipRoleChange: (value: MembershipRole) => void;

  onStatusChange: (value: MembershipStatus) => void;

  onInvite: () => void;

  onCopyInvite: () => void;
};

//************************************************************** */

export function EmployeeAccessDetails({
  selected,
  inviteEmail,
  inviteRole,
  generatedInviteUrl,
  saving,
  onEmailChange,
  onInviteRoleChange,
  onMembershipRoleChange,
  onStatusChange,
  onInvite,
  onCopyInvite,
}: Props) {
  const { employee, membership } = selected;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex items-start gap-4 border-b border-zinc-200 pb-5">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-orange-50 font-bold text-orange-600">
          {getEmployeeInitials(employee)}
        </div>

        <div>
          <h2 className="font-bold text-zinc-900">
            {employee.firstName} {employee.lastName}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {employee.email ?? "No employee email"}
          </p>
        </div>
      </div>

      {membership ? (
        <ExistingAccount
          role={membership.role}
          status={membership.status}
          loginEmail={membership.user.email}
          saving={saving}
          onRoleChange={onMembershipRoleChange}
          onStatusChange={onStatusChange}
        />
      ) : (
        <InvitationPanel
          employeeEmail={employee.email}
          email={inviteEmail}
          role={inviteRole}
          generatedInviteUrl={generatedInviteUrl}
          saving={saving}
          onEmailChange={onEmailChange}
          onRoleChange={onInviteRoleChange}
          onInvite={onInvite}
          onCopyInvite={onCopyInvite}
        />
      )}
    </section>
  );
}

//************************************************************** */

function ExistingAccount({
  role,
  status,
  loginEmail,
  saving,
  onRoleChange,
  onStatusChange,
}: {
  role: MembershipRole;

  status: MembershipStatus;

  loginEmail: string;

  saving: boolean;

  onRoleChange: (role: MembershipRole) => void;

  onStatusChange: (status: MembershipStatus) => void;
}) {
  return (
    <div className="space-y-5 pt-6">
      <div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-orange-500" />

          <h3 className="text-sm font-bold text-zinc-900">MotoDesk Access</h3>
        </div>

        <p className="mt-1 text-xs text-zinc-500">
          This employee is linked to an organization Membership.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="User Role">
          <select
            value={role}
            disabled={saving || role === "OWNER"}
            onChange={(event) =>
              onRoleChange(event.target.value as MembershipRole)
            }
            className={inputClassName}
          >
            {role === "OWNER" ? <option value="OWNER">Owner</option> : null}

            {EMPLOYEE_ACCESS_ROLES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Account Status">
          <select
            value={status}
            disabled={saving || role === "OWNER"}
            onChange={(event) =>
              onStatusChange(event.target.value as MembershipStatus)
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

          {loginEmail}
        </p>
      </div>
    </div>
  );
}

//************************************************************** */

function InvitationPanel({
  employeeEmail,
  email,
  role,
  generatedInviteUrl,
  saving,
  onEmailChange,
  onRoleChange,
  onInvite,
  onCopyInvite,
}: {
  employeeEmail: string | null;

  email: string;

  role: MembershipRole;

  generatedInviteUrl: string | null;

  saving: boolean;

  onEmailChange: (value: string) => void;

  onRoleChange: (role: MembershipRole) => void;

  onInvite: () => void;

  onCopyInvite: () => void;
}) {
  return (
    <div className="space-y-5 pt-6">
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
        <UserPlus className="mx-auto h-7 w-7 text-zinc-400" />

        <p className="mt-2 text-sm font-semibold text-zinc-800">
          No MotoDesk Account
        </p>

        <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">
          This employee can still use scheduling and Time Clock without an
          application login.
        </p>
      </div>

      <Field label="Login Email">
        <input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder={employeeEmail ?? "employee@example.com"}
          className={inputClassName}
        />
      </Field>

      <Field label="Application Role">
        <select
          value={role}
          onChange={(event) =>
            onRoleChange(event.target.value as MembershipRole)
          }
          className={inputClassName}
        >
          {EMPLOYEE_ACCESS_ROLES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="button"
        disabled={saving || Boolean(generatedInviteUrl)}
        onClick={onInvite}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <UserPlus className="h-4 w-4" />

        {saving
          ? "Creating Invitation..."
          : generatedInviteUrl
            ? "Invitation Created"
            : "Create App Access"}
      </button>

      {generatedInviteUrl ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-emerald-900">
                Invitation Ready
              </p>

              <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                Send this link to the employee. Their Membership will be linked
                to this Employee record when accepted.
              </p>

              <div className="mt-3 flex gap-2">
                <input
                  readOnly
                  value={generatedInviteUrl}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-emerald-200 bg-white px-3 text-xs text-zinc-700"
                />

                <button
                  type="button"
                  onClick={onCopyInvite}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
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

const inputClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-zinc-100";

//************************************************************** */
