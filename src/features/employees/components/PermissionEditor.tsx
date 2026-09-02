"use client";

import {
  Check,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Search,
  Shield,
} from "lucide-react";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import type { PermissionCatalogItem } from "@/features/permissions/permission.types";

import type { EmployeeAccessMembership } from "./user-permissions.types";

import {
  formatPermissionAction,
  formatPermissionLabel,
  samePermissionSet,
  uniqueSortedPermissions,
} from "./user-permissions.utils";

import {
  useGetMembershipPermissionsQuery,
  useUpdateMembershipPermissionsMutation,
} from "@/store/api/permissionsApi";

//************************************************************** */

type Props = {
  organizationId: string;

  membership: EmployeeAccessMembership;

  catalog: PermissionCatalogItem[];

  roleDefaults: string[];

  isOwner: boolean;
};

//************************************************************** */

export function PermissionEditor({
  organizationId,
  membership,
  catalog,
  roleDefaults,
  isOwner,
}: Props) {
  const [permissionSearch, setPermissionSearch] = useState("");

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set<string>(),
  );

  //************************************************************** */

  const { data: storedPermissions = [], isLoading } =
    useGetMembershipPermissionsQuery(
      {
        organizationId,

        membershipId: membership.id,
      },
      {
        skip: membership.role === "OWNER",
      },
    );

  const [updatePermissions, { isLoading: saving }] =
    useUpdateMembershipPermissionsMutation();

  //************************************************************** */

  const effectivePermissions: string[] =
    membership.role === "OWNER"
      ? catalog.map((item) => item.permission)
      : storedPermissions;

  const effectiveSet = useMemo(
    () => new Set<string>(effectivePermissions),
    [effectivePermissions],
  );

  const defaultSet = useMemo(
    () => new Set<string>(roleDefaults),
    [roleDefaults],
  );

  const customized = !samePermissionSet(effectivePermissions, roleDefaults);

  //************************************************************** */

  const groupedPermissions = useMemo(() => {
    const search = permissionSearch.trim().toLowerCase();

    const groups = new Map<string, PermissionCatalogItem[]>();

    for (const permission of catalog) {
      const searchable =
        `${permission.group} ${permission.action} ${permission.permission}`.toLowerCase();

      if (search && !searchable.includes(search)) {
        continue;
      }

      const groupItems = groups.get(permission.group) ?? [];

      groupItems.push(permission);

      groups.set(permission.group, groupItems);
    }

    return Array.from(groups.entries()).sort(([left], [right]) =>
      left.localeCompare(right),
    );
  }, [catalog, permissionSearch]);

  //************************************************************** */

  async function savePermissions(permissions: string[]) {
    if (!isOwner || membership.role === "OWNER") {
      return;
    }

    try {
      await updatePermissions({
        organizationId,

        membershipId: membership.id,

        permissions: uniqueSortedPermissions(permissions),
      }).unwrap();

      toast.success("Permissions updated.");
    } catch {
      toast.error("MotoDesk could not update permissions.");
    }
  }

  //************************************************************** */

  function togglePermission(permission: string) {
    const next = new Set<string>(effectivePermissions);

    if (next.has(permission)) {
      next.delete(permission);
    } else {
      next.add(permission);
    }

    void savePermissions(Array.from(next));
  }

  //************************************************************** */

  function setGroup(permissions: PermissionCatalogItem[], enabled: boolean) {
    const next = new Set<string>(effectivePermissions);

    for (const permission of permissions) {
      if (enabled) {
        next.add(permission.permission);
      } else {
        next.delete(permission.permission);
      }
    }

    void savePermissions(Array.from(next));
  }

  //************************************************************** */

  function toggleGroup(group: string) {
    setExpandedGroups((current) => {
      const next = new Set<string>(current);

      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }

      return next;
    });
  }

  //************************************************************** */

  if (membership.role !== "OWNER" && isLoading) {
    return <PermissionMessage>Loading permission details...</PermissionMessage>;
  }

  //************************************************************** */

  return (
    <section className="rounded-xl border border-zinc-200 bg-white">
      <header className="border-b border-zinc-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />

              <h3 className="text-sm font-bold text-zinc-900">
                Application Permissions
              </h3>
            </div>

            <p className="mt-1 text-xs text-zinc-500">
              {membership.role === "OWNER"
                ? "Organization owners always have every permission."
                : customized
                  ? "This user has a customized effective permission set."
                  : `Using the ${formatPermissionLabel(
                      membership.role,
                    )} role defaults.`}
            </p>
          </div>

          {membership.role !== "OWNER" && isOwner ? (
            <button
              type="button"
              disabled={saving || !customized}
              onClick={() => void savePermissions(roleDefaults)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to Role Defaults
            </button>
          ) : null}
        </div>

        {membership.role !== "OWNER" && !isOwner ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Only the organization owner can change granular permissions.
          </div>
        ) : null}

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <input
            value={permissionSearch}
            onChange={(event) => setPermissionSearch(event.target.value)}
            placeholder="Search permissions..."
            className={`${inputClassName} pl-9`}
          />
        </div>
      </header>

      <div className="divide-y divide-zinc-100">
        {groupedPermissions.map(([group, permissions]) => {
          const open = permissionSearch.length > 0 || expandedGroups.has(group);

          const enabledCount = permissions.filter((item) =>
            effectiveSet.has(item.permission),
          ).length;

          const allEnabled = enabledCount === permissions.length;

          const someEnabled = enabledCount > 0 && !allEnabled;

          return (
            <div key={group}>
              <div className="flex items-center gap-3 p-4">
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                >
                  {open ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="text-sm font-bold text-zinc-900">
                    {formatPermissionLabel(group)}
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    {enabledCount} of {permissions.length} enabled
                  </p>
                </button>

                {membership.role !== "OWNER" && isOwner ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setGroup(permissions, !allEnabled)}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold ${
                      allEnabled
                        ? "border-orange-200 bg-orange-50 text-orange-700"
                        : someEnabled
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-zinc-300 bg-white text-zinc-600"
                    }`}
                  >
                    {allEnabled ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        All
                      </>
                    ) : someEnabled ? (
                      "Partial"
                    ) : (
                      "Enable All"
                    )}
                  </button>
                ) : null}
              </div>

              {open ? (
                <div className="border-t border-zinc-100 bg-zinc-50/60 px-4 py-2">
                  {permissions.map((item) => (
                    <PermissionRow
                      key={item.permission}
                      permission={item}
                      enabled={effectiveSet.has(item.permission)}
                      defaultEnabled={defaultSet.has(item.permission)}
                      disabled={
                        saving || !isOwner || membership.role === "OWNER"
                      }
                      onToggle={() => togglePermission(item.permission)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

//************************************************************** */

function PermissionRow({
  permission,
  enabled,
  defaultEnabled,
  disabled,
  onToggle,
}: {
  permission: PermissionCatalogItem;

  enabled: boolean;

  defaultEnabled: boolean;

  disabled: boolean;

  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 py-3 last:border-b-0">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-orange-500" : "bg-zinc-300"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-800">
          {formatPermissionAction(permission.action)}
        </p>

        <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
          {permission.permission}
        </p>
      </div>

      <span
        className={`rounded-full px-2 py-1 text-[10px] font-bold ${
          enabled === defaultEnabled
            ? "bg-zinc-100 text-zinc-500"
            : "bg-orange-50 text-orange-700"
        }`}
      >
        {enabled === defaultEnabled ? "Role Default" : "Customized"}
      </span>
    </div>
  );
}

//************************************************************** */

function PermissionMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
      {children}
    </div>
  );
}

//************************************************************** */

const inputClassName =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */
