"use client";

import {
  Check,
  CheckCircle2,
  Pencil,
  Plus,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  toast,
} from "sonner";

import {
  useCompleteRepairOrderLaborLineMutation,
  useCreateRepairOrderLaborLineMutation,
  useDeleteRepairOrderLaborLineMutation,
  useGetRepairOrderLaborLinesQuery,
  useUpdateRepairOrderLaborLineMutation,
} from "@/store/api/repairOrdersApi";

import type {
  RepairOrderLaborLine,
} from "../repair-order-labor.types";

import type {
  RepairOrder,
} from "../repair-order.types";

import {
  RepairOrderTechnicianSelect,
} from "./RepairOrderTechnicianSelect";

type RepairOrderLaborTabProps = {
  organizationId: string;
  repairOrder: RepairOrder;
};

export function RepairOrderLaborTab({
  organizationId,
  repairOrder,
}: RepairOrderLaborTabProps) {
  const [
    description,
    setDescription,
  ] = useState("");

  const [
    technicianMembershipId,
    setTechnicianMembershipId,
  ] = useState("");

  const [
    hours,
    setHours,
  ] = useState("");

  const [
    rate,
    setRate,
  ] = useState("");

  const [
    editingLaborLineId,
    setEditingLaborLineId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    editDescription,
    setEditDescription,
  ] = useState("");

  const [
    editTechnicianMembershipId,
    setEditTechnicianMembershipId,
  ] = useState("");

  const [
    editHours,
    setEditHours,
  ] = useState("");

  const [
    editRate,
    setEditRate,
  ] = useState("");

  const {
    data: laborLines = [],
    isLoading,
    isError,
  } =
    useGetRepairOrderLaborLinesQuery({
      organizationId,
      repairOrderId:
        repairOrder.id,
    });

  const [
    createLaborLine,
    {
      isLoading:
        isCreating,
    },
  ] =
    useCreateRepairOrderLaborLineMutation();

  const [
    updateLaborLine,
    {
      isLoading:
        isUpdating,
    },
  ] =
    useUpdateRepairOrderLaborLineMutation();

  const [
    deleteLaborLine,
    {
      isLoading:
        isDeleting,
    },
  ] =
    useDeleteRepairOrderLaborLineMutation();

  const [
    completeLaborLine,
    {
      isLoading:
        isCompleting,
    },
  ] =
    useCompleteRepairOrderLaborLineMutation();

  const actionDisabled =
    isCreating ||
    isUpdating ||
    isDeleting ||
    isCompleting;

  const incompleteLaborLines =
    laborLines.filter(
      (line) =>
        !line.completed &&
        line.status !==
          "CANCELLED",
    );

  async function handleCreate() {
    const trimmed =
      description.trim();

    if (!trimmed) {
      toast.error(
        "Enter a labor description.",
      );

      return;
    }

    const parsedHours =
      parseOptionalNumber(hours);

    const parsedRate =
      parseOptionalNumber(rate);

    if (parsedHours === null) {
      toast.error(
        "Enter valid labor hours.",
      );

      return;
    }

    if (parsedRate === null) {
      toast.error(
        "Enter a valid labor rate.",
      );

      return;
    }

    try {
      await createLaborLine({
        organizationId,
        repairOrderId:
          repairOrder.id,
        description: trimmed,
        technicianMembershipId:
          technicianMembershipId ||
          undefined,
        hours: parsedHours,
        rate: parsedRate,
      }).unwrap();

      setDescription("");
      setTechnicianMembershipId(
        "",
      );
      setHours("");
      setRate("");

      toast.success(
        "Labor line added.",
      );
    } catch {
      toast.error(
        "MotoDesk could not add the labor line.",
      );
    }
  }

  function handleBeginEdit(
    laborLine:
      RepairOrderLaborLine,
  ) {
    setEditingLaborLineId(
      laborLine.id,
    );

    setEditDescription(
      laborLine.description,
    );

    setEditTechnicianMembershipId(
      laborLine.technicianMembershipId ??
        "",
    );

    setEditHours(
      laborLine.hours,
    );

    setEditRate(
      laborLine.rate,
    );
  }

  function handleCancelEdit() {
    setEditingLaborLineId(null);
    setEditDescription("");
    setEditTechnicianMembershipId(
      "",
    );
    setEditHours("");
    setEditRate("");
  }

  async function handleSaveEdit(
    laborLineId: string,
  ) {
    const trimmed =
      editDescription.trim();

    if (!trimmed) {
      toast.error(
        "Enter a labor description.",
      );

      return;
    }

    const parsedHours =
      parseOptionalNumber(
        editHours,
      );

    const parsedRate =
      parseOptionalNumber(
        editRate,
      );

    if (parsedHours === null) {
      toast.error(
        "Enter valid labor hours.",
      );

      return;
    }

    if (parsedRate === null) {
      toast.error(
        "Enter a valid labor rate.",
      );

      return;
    }

    try {
      await updateLaborLine({
        organizationId,
        repairOrderId:
          repairOrder.id,
        laborLineId,
        data: {
          description: trimmed,
          technicianMembershipId:
            editTechnicianMembershipId ||
            undefined,
          hours: parsedHours,
          rate: parsedRate,
        },
      }).unwrap();

      handleCancelEdit();

      toast.success(
        "Labor line updated.",
      );
    } catch {
      toast.error(
        "MotoDesk could not update the labor line.",
      );
    }
  }

  async function handleDelete(
    laborLine:
      RepairOrderLaborLine,
  ) {
    const confirmed =
      window.confirm(
        `Remove "${laborLine.description}" from this repair order?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteLaborLine({
        organizationId,
        repairOrderId:
          repairOrder.id,
        laborLineId:
          laborLine.id,
      }).unwrap();

      toast.success(
        "Labor line removed.",
      );
    } catch {
      toast.error(
        "MotoDesk could not remove the labor line.",
      );
    }
  }

  async function handleComplete(
    laborLineId: string,
  ) {
    try {
      await completeLaborLine({
        organizationId,
        repairOrderId:
          repairOrder.id,
        laborLineId,
      }).unwrap();

      toast.success(
        "Labor operation completed.",
      );
    } catch {
      toast.error(
        "MotoDesk could not complete the labor operation.",
      );
    }
  }

  async function handleCompleteAll() {
    try {
      for (
        const laborLine of
        incompleteLaborLines
      ) {
        await completeLaborLine({
          organizationId,
          repairOrderId:
            repairOrder.id,
          laborLineId:
            laborLine.id,
        }).unwrap();
      }

      toast.success(
        "All labor operations completed.",
      );
    } catch {
      toast.error(
        "MotoDesk could not complete all labor operations.",
      );
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-orange-500" />

          <h3 className="text-sm font-semibold text-zinc-900">
            Add labor
          </h3>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_120px_140px_auto] lg:items-end">
          <label>
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Description
            </span>

            <input
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-orange-500"
            />
          </label>

          <RepairOrderTechnicianSelect
            organizationId={
              organizationId
            }
            value={
              technicianMembershipId
            }
            onChange={
              setTechnicianMembershipId
            }
            disabled={
              actionDisabled
            }
          />

          <LaborNumberInput
            label="Hours"
            value={hours}
            onChange={setHours}
          />

          <LaborNumberInput
            label="Rate"
            value={rate}
            onChange={setRate}
          />

          <button
            type="button"
            disabled={
              actionDisabled
            }
            onClick={() =>
              void handleCreate()
            }
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Labor operations
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
              {laborLines.length} operation
              {laborLines.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          {incompleteLaborLines.length >
          0 ? (
            <button
              type="button"
              disabled={
                actionDisabled
              }
              onClick={() =>
                void handleCompleteAll()
              }
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-200 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete all
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <TableMessage>
            Loading labor...
          </TableMessage>
        ) : isError ? (
          <TableMessage>
            MotoDesk could not load labor.
          </TableMessage>
        ) : laborLines.length ===
          0 ? (
          <TableMessage>
            No labor operations.
          </TableMessage>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <TableHeading>
                    Operation
                  </TableHeading>

                  <TableHeading>
                    Technician
                  </TableHeading>

                  <TableHeading align="right">
                    Hours
                  </TableHeading>

                  <TableHeading align="right">
                    Rate
                  </TableHeading>

                  <TableHeading align="right">
                    Total
                  </TableHeading>

                  <TableHeading>
                    Status
                  </TableHeading>

                  <TableHeading>
                    Actual
                  </TableHeading>

                  <TableHeading align="right">
                    Actions
                  </TableHeading>
                </tr>
              </thead>

              <tbody>
                {laborLines.map(
                  (laborLine) => {
                    const editing =
                      editingLaborLineId ===
                      laborLine.id;

                    return (
                      <tr
                        key={
                          laborLine.id
                        }
                        className="border-b border-zinc-100 last:border-b-0"
                      >
                        <td className="px-4 py-3">
                          {editing ? (
                            <input
                              value={
                                editDescription
                              }
                              onChange={(
                                event,
                              ) =>
                                setEditDescription(
                                  event
                                    .target
                                    .value,
                                )
                              }
                              className="h-9 w-full rounded-md border border-zinc-300 px-2 text-sm"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-zinc-900">
                              {
                                laborLine.description
                              }
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {editing ? (
                            <RepairOrderTechnicianSelect
                              organizationId={
                                organizationId
                              }
                              value={
                                editTechnicianMembershipId
                              }
                              onChange={
                                setEditTechnicianMembershipId
                              }
                              disabled={
                                actionDisabled
                              }
                            />
                          ) : (
                            <span className="text-sm text-zinc-600">
                              {laborLine.technician
                                ? getMembershipName(
                                    laborLine
                                      .technician
                                      .user,
                                  )
                                : "Unassigned"}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {editing ? (
                            <input
                              value={
                                editHours
                              }
                              onChange={(
                                event,
                              ) =>
                                setEditHours(
                                  event
                                    .target
                                    .value,
                                )
                              }
                              type="number"
                              className="h-9 w-20 rounded-md border border-zinc-300 px-2 text-right text-sm"
                            />
                          ) : (
                            <span className="text-sm text-zinc-600">
                              {
                                laborLine.hours
                              }
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {editing ? (
                            <input
                              value={
                                editRate
                              }
                              onChange={(
                                event,
                              ) =>
                                setEditRate(
                                  event
                                    .target
                                    .value,
                                )
                              }
                              type="number"
                              className="h-9 w-24 rounded-md border border-zinc-300 px-2 text-right text-sm"
                            />
                          ) : (
                            <span className="text-sm text-zinc-600">
                              {formatCurrency(
                                Number(
                                  laborLine.rate,
                                ),
                              )}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right text-sm font-semibold text-zinc-900">
                          {formatCurrency(
                            Number(
                              laborLine.hours,
                            ) *
                              Number(
                                laborLine.rate,
                              ),
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge
                            status={
                              laborLine.status
                            }
                          />
                        </td>

                        <td className="px-4 py-3 text-sm text-zinc-500">
                          {laborLine.startedAt
                            ? formatElapsedTime(
                                laborLine.startedAt,
                                laborLine.completedAt,
                              )
                            : "—"}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {editing ? (
                              <>
                                <SmallButton
                                  icon={
                                    Check
                                  }
                                  label="Save"
                                  onClick={() =>
                                    void handleSaveEdit(
                                      laborLine.id,
                                    )
                                  }
                                  disabled={
                                    actionDisabled
                                  }
                                />

                                <SmallButton
                                  icon={X}
                                  label="Cancel"
                                  onClick={
                                    handleCancelEdit
                                  }
                                  disabled={
                                    actionDisabled
                                  }
                                />
                              </>
                            ) : (
                              <>
                                {!laborLine.completed ? (
                                  <SmallButton
                                    icon={
                                      Pencil
                                    }
                                    label="Edit"
                                    onClick={() =>
                                      handleBeginEdit(
                                        laborLine,
                                      )
                                    }
                                    disabled={
                                      actionDisabled
                                    }
                                  />
                                ) : null}

                                {!laborLine.completed &&
                                laborLine.status !==
                                  "CANCELLED" ? (
                                  <SmallButton
                                    icon={
                                      CheckCircle2
                                    }
                                    label="Complete"
                                    onClick={() =>
                                      void handleComplete(
                                        laborLine.id,
                                      )
                                    }
                                    disabled={
                                      actionDisabled
                                    }
                                  />
                                ) : null}

                                {!laborLine.completed ? (
                                  <SmallButton
                                    icon={
                                      Trash2
                                    }
                                    label="Remove"
                                    onClick={() =>
                                      void handleDelete(
                                        laborLine,
                                      )
                                    }
                                    disabled={
                                      actionDisabled
                                    }
                                  />
                                ) : null}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function LaborNumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-semibold text-zinc-700">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        type="number"
        min="0"
        step="0.01"
        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 caret-zinc-900 outline-none focus:border-orange-500"
      />
    </label>
  );
}

function TableHeading({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 ${
        align === "right"
          ? "text-right"
          : ""
      }`}
    >
      {children}
    </th>
  );
}

function TableMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-40 place-items-center p-6 text-sm text-zinc-500">
      {children}
    </div>
  );
}

function SmallButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-600">
      {formatLabel(status)}
    </span>
  );
}

function parseOptionalNumber(
  value: string,
): number | undefined | null {
  if (!value.trim()) {
    return undefined;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function getMembershipName(
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  },
): string {
  const name = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return name || user.email;
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  ).format(value);
}

function formatLabel(
  value: string,
): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatElapsedTime(
  startedAt: string,
  completedAt: string | null,
): string {
  const start =
    new Date(
      startedAt,
    ).getTime();

  const end = completedAt
    ? new Date(
        completedAt,
      ).getTime()
    : Date.now();

  const minutes =
    Math.max(
      0,
      Math.floor(
        (end - start) /
          60000,
      ),
    );

  const hours =
    Math.floor(
      minutes / 60,
    );

  const remainder =
    minutes % 60;

  return hours
    ? `${hours}h ${remainder}m`
    : `${remainder}m`;
}