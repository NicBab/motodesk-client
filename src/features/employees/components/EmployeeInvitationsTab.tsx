
"use client";

import { useState } from "react";

import {
  Copy,
  RefreshCw,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { toast } from "sonner";

import {
  getMembershipInvitationStatus,
  useGetMembershipInvitationsQuery,
  useRefreshMembershipInvitationMutation,
  useRevokeMembershipInvitationMutation,
  type MembershipInvitationRecord,
} from "@/store/api/membershipInvitationsApi";

//************************************************************** */

type EmployeeInvitationsTabProps = {
  organizationId: string;
};

//************************************************************** */

const statusStyles = {
  PENDING: "bg-amber-50 text-amber-700",
  ACCEPTED: "bg-emerald-50 text-emerald-700",
  EXPIRED: "bg-zinc-100 text-zinc-600",
  REVOKED: "bg-red-50 text-red-700",
};

//************************************************************** */

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}

//************************************************************** */

export function EmployeeInvitationsTab({
  organizationId,
}: EmployeeInvitationsTabProps) {
  return (
    <InvitationList
      key={organizationId}
      organizationId={organizationId}
    />
  );
}

//************************************************************** */

function InvitationList({
  organizationId,
}: EmployeeInvitationsTabProps) {
  const [page, setPage] = useState(1);

  const [activeInvitationId, setActiveInvitationId] =
    useState<string | null>(null);

  const [generatedLink, setGeneratedLink] =
    useState<string | null>(null);

  const [generatedEmail, setGeneratedEmail] =
    useState<string | null>(null);

  const {
    currentData: data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMembershipInvitationsQuery(
    {
      organizationId,
      page,
      pageSize: 25,
    },
    {
      skip: !organizationId,
      refetchOnMountOrArgChange: true,
    },
  );

  const [
    refreshInvitation,
    { isLoading: isRefreshing },
  ] = useRefreshMembershipInvitationMutation();

  const [
    revokeInvitation,
    { isLoading: isRevoking },
  ] = useRevokeMembershipInvitationMutation();

  const invitations = data?.items ?? [];

  const pagination = data?.pagination;

  const actionBusy =
    isRefreshing ||
    isRevoking ||
    activeInvitationId !== null;

  //************************************************************** */

  async function handleRefresh(
    invitation: MembershipInvitationRecord,
  ) {
    if (actionBusy) {
      return;
    }

    const confirmed = window.confirm(
      `Generate a new invitation link for ${invitation.email}? Any previous invitation link will become invalid.`,
    );

    if (!confirmed) {
      return;
    }

    setActiveInvitationId(invitation.id);
    setGeneratedLink(null);
    setGeneratedEmail(null);

    try {
      const result = await refreshInvitation({
        organizationId,
        invitationId: invitation.id,
      }).unwrap();

      const link =
        `${window.location.origin}/accept-invitation?token=${encodeURIComponent(
          result.token,
        )}`;

      setGeneratedLink(link);
      setGeneratedEmail(invitation.email);

      toast.success(
        "New invitation link generated.",
      );
    } catch {
      toast.error(
        "MotoDesk could not refresh the invitation.",
      );
    } finally {
      setActiveInvitationId(null);
    }
  }

  //************************************************************** */

  async function handleRevoke(
    invitation: MembershipInvitationRecord,
  ) {
    if (actionBusy) {
      return;
    }

    const confirmed = window.confirm(
      `Revoke the invitation for ${invitation.email}? The employee will no longer be able to accept this invitation.`,
    );

    if (!confirmed) {
      return;
    }

    setActiveInvitationId(invitation.id);

    try {
      await revokeInvitation({
        organizationId,
        invitationId: invitation.id,
      }).unwrap();

      if (generatedEmail === invitation.email) {
        setGeneratedLink(null);
        setGeneratedEmail(null);
      }

      toast.success("Invitation revoked.");
    } catch {
      toast.error(
        "MotoDesk could not revoke the invitation.",
      );
    } finally {
      setActiveInvitationId(null);
    }
  }

  //************************************************************** */

  async function handleCopyLink() {
    if (!generatedLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        generatedLink,
      );

      toast.success(
        "Invitation link copied.",
      );
    } catch {
      toast.error(
        "Unable to copy the link. Select and copy it manually.",
      );
    }
  }

  //************************************************************** */

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Employee Invitations
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Track invitations and manage employee
            access requests.
          </p>
        </div>

        <button
          type="button"
          disabled={isFetching || actionBusy}
          onClick={() => void refetch()}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isFetching ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {generatedLink ? (
        <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              Invitation link generated
            </p>

            <p className="mt-1 text-sm text-zinc-600">
              Share this link securely with{" "}
              {generatedEmail}.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={generatedLink}
              onFocus={(event) =>
                event.target.select()
              }
              className="h-10 min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700"
            />

            <button
              type="button"
              onClick={() => void handleCopyLink()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </button>

            <button
              type="button"
              onClick={() => {
                setGeneratedLink(null);
                setGeneratedEmail(null);
              }}
              className="h-10 rounded-lg border border-zinc-300 px-4 text-sm font-medium text-zinc-700 hover:bg-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {isLoading || (isFetching && !data) ? (
          <div className="p-10 text-center text-sm text-zinc-500">
            Loading invitations...
          </div>
        ) : isError ? (
          <div className="space-y-3 p-10 text-center">
            <p className="text-sm text-zinc-600">
              Unable to load employee invitations.
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="text-sm font-semibold text-orange-600 hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-zinc-900">
              No invitations found
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Employee invitations will appear here
              after they are created.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">
                    Email
                  </th>

                  <th className="px-4 py-3">
                    Role
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3">
                    Created
                  </th>

                  <th className="px-4 py-3">
                    Expires
                  </th>

                  <th className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {invitations.map((invitation) => {
                  const status =
                    getMembershipInvitationStatus(
                      invitation,
                    );

                  const canRefresh =
                    status === "PENDING" ||
                    status === "EXPIRED";

                  const canRevoke =
                    status === "PENDING";

                  const rowBusy =
                    activeInvitationId ===
                    invitation.id;

                  return (
                    <tr
                      key={invitation.id}
                      className="transition hover:bg-zinc-50"
                    >
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-zinc-900">
                        {invitation.email}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 capitalize text-zinc-600">
                        {invitation.role
                          .toLowerCase()
                          .replaceAll("_", " ")}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-zinc-600">
                        {formatDate(
                          invitation.createdAt,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-zinc-600">
                        {formatDate(
                          invitation.expiresAt,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {canRefresh ? (
                            <button
                              type="button"
                              disabled={actionBusy}
                              title="Generate new invitation link"
                              aria-label={`Renew invitation for ${invitation.email}`}
                              onClick={() =>
                                void handleRefresh(
                                  invitation,
                                )
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
                            >
                              <RefreshCw
                                className={`h-4 w-4 ${
                                  rowBusy &&
                                  isRefreshing
                                    ? "animate-spin"
                                    : ""
                                }`}
                              />
                            </button>
                          ) : null}

                          {canRevoke ? (
                            <button
                              type="button"
                              disabled={actionBusy}
                              title="Revoke invitation"
                              aria-label={`Revoke invitation for ${invitation.email}`}
                              onClick={() =>
                                void handleRevoke(
                                  invitation,
                                )
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          ) : null}

                          {!canRefresh &&
                          !canRevoke ? (
                            <span className="text-xs text-zinc-400">
                              —
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination ? (
          <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3">
            <p className="text-sm text-zinc-500">
              {pagination.totalItems} invitations
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                disabled={
                  !pagination.hasPreviousPage ||
                  isFetching ||
                  actionBusy
                }
                onClick={() =>
                  setPage((value) =>
                    Math.max(1, value - 1),
                  )
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-sm text-zinc-600">
                {pagination.page} /{" "}
                {pagination.totalPages}
              </span>

              <button
                type="button"
                aria-label="Next page"
                disabled={
                  !pagination.hasNextPage ||
                  isFetching ||
                  actionBusy
                }
                onClick={() =>
                  setPage((value) => value + 1)
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

//************************************************************** */
