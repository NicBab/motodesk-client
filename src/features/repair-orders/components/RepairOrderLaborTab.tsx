"use client";

import {
  Check,
  CheckCircle2,
  Clock3,
  Pencil,
  Plus,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

// import { useGetMembershipsQuery } from "../../../store/api/memberships.Api";

import {
  useCompleteRepairOrderLaborLineMutation,
  useCreateRepairOrderLaborLineMutation,
  useDeleteRepairOrderLaborLineMutation,
  useGetRepairOrderLaborLinesQuery,
  useStartRepairOrderLaborLineMutation,
  useUpdateRepairOrderLaborLineMutation,
} from "@/store/api/repairOrdersApi";

import type { RepairOrderLaborLine } from "../repair-order-labor.types";

import type { RepairOrder } from "../repair-order.types";

import { RepairOrderTechnicianSelect } from "./RepairOrderTechnicianSelect";

type RepairOrderLaborTabProps = {
  organizationId: string;
  repairOrder: RepairOrder;
};

export function RepairOrderLaborTab({
  organizationId,
  repairOrder,
}: RepairOrderLaborTabProps) {
  const [description, setDescription] = useState("");

  const [technicianMembershipId, setTechnicianMembershipId] = useState("");

  const [hours, setHours] = useState("");

  const [rate, setRate] = useState("");

  const [editingLaborLineId, setEditingLaborLineId] = useState<string | null>(
    null,
  );

  const [editDescription, setEditDescription] = useState("");

  const [editHours, setEditHours] = useState("");

  const [editRate, setEditRate] = useState("");

  const [editTechnicianMembershipId, setEditTechnicianMembershipId] =
    useState("");

  const {
    data: laborLines = [],
    isLoading,
    isError,
  } = useGetRepairOrderLaborLinesQuery({
    organizationId,
    repairOrderId: repairOrder.id,
  });

  const [createLaborLine, { isLoading: isCreating }] =
    useCreateRepairOrderLaborLineMutation();

  const [updateLaborLine, { isLoading: isUpdating }] =
    useUpdateRepairOrderLaborLineMutation();

  const [deleteLaborLine, { isLoading: isDeleting }] =
    useDeleteRepairOrderLaborLineMutation();

  const [startLaborLine, { isLoading: isStarting }] =
    useStartRepairOrderLaborLineMutation();

  const [completeLaborLine, { isLoading: isCompleting }] =
    useCompleteRepairOrderLaborLineMutation();

  const actionDisabled =
    isCreating || isUpdating || isDeleting || isStarting || isCompleting;

  async function handleCreate() {
    const trimmedDescription = description.trim();

    if (!trimmedDescription) {
      toast.error("Enter a labor description.");

      return;
    }

    const parsedHours = parseOptionalNumber(hours);

    const parsedRate = parseOptionalNumber(rate);

    if (parsedHours === null) {
      toast.error("Enter valid labor hours.");

      return;
    }

    if (parsedRate === null) {
      toast.error("Enter a valid labor rate.");

      return;
    }

    try {
      await createLaborLine({
        organizationId,
        repairOrderId: repairOrder.id,

        description: trimmedDescription,

        technicianMembershipId: technicianMembershipId || undefined,

        hours: parsedHours,

        rate: parsedRate,
      }).unwrap();

      setDescription("");
      setTechnicianMembershipId("");
      setHours("");
      setRate("");

      toast.success("Labor line added.");
    } catch {
      toast.error("MotoDesk could not add the labor line.");
    }
  }

  function handleBeginEdit(laborLine: RepairOrderLaborLine) {
    setEditingLaborLineId(laborLine.id);

    setEditDescription(laborLine.description);

    setEditHours(laborLine.hours);

    setEditRate(laborLine.rate);

    setEditTechnicianMembershipId(laborLine.technicianMembershipId ?? "");
  }

  function handleCancelEdit() {
    setEditingLaborLineId(null);
    setEditDescription("");
    setEditHours("");
    setEditRate("");
    setEditTechnicianMembershipId("");
  }

  async function handleSaveEdit(laborLineId: string) {
    const trimmedDescription = editDescription.trim();

    if (!trimmedDescription) {
      toast.error("Enter a labor description.");

      return;
    }

    const parsedHours = parseOptionalNumber(editHours);

    const parsedRate = parseOptionalNumber(editRate);

    if (parsedHours === null) {
      toast.error("Enter valid labor hours.");

      return;
    }

    if (parsedRate === null) {
      toast.error("Enter a valid labor rate.");

      return;
    }

    try {
      await updateLaborLine({
        organizationId,
        repairOrderId: repairOrder.id,
        laborLineId,

        data: {
          description: trimmedDescription,
          hours: parsedHours,
          rate: parsedRate,
          technicianMembershipId: editTechnicianMembershipId || undefined,
        },
      }).unwrap();

      handleCancelEdit();

      toast.success("Labor line updated.");
    } catch {
      toast.error("MotoDesk could not update the labor line.");
    }
  }

  async function handleDelete(laborLine: RepairOrderLaborLine) {
    const confirmed = window.confirm(
      `Remove "${laborLine.description}" from this repair order?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteLaborLine({
        organizationId,
        repairOrderId: repairOrder.id,
        laborLineId: laborLine.id,
      }).unwrap();

      if (editingLaborLineId === laborLine.id) {
        handleCancelEdit();
      }

      toast.success("Labor line removed.");
    } catch {
      toast.error("MotoDesk could not remove the labor line.");
    }
  }

//   async function handleStart(laborLineId: string) {
//     try {
//       await startLaborLine({
//         organizationId,
//         repairOrderId: repairOrder.id,
//         laborLineId,
//       }).unwrap();

//       toast.success("Labor started.");
//     } catch {
//       toast.error("MotoDesk could not start labor.");
//     }
//   }

//   async function handleComplete(laborLineId: string) {
//     try {
//       await completeLaborLine({
//         organizationId,
//         repairOrderId: repairOrder.id,
//         laborLineId,
//       }).unwrap();

//       toast.success("Labor completed.");
//     } catch {
//       toast.error("MotoDesk could not complete labor.");
//     }
//   }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-600">
            <Wrench className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Add labor</h3>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Add a labor operation and optionally assign a technician.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Description
            </span>

            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Example: Replace front brake pads"
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <RepairOrderTechnicianSelect
            organizationId={organizationId}
            value={technicianMembershipId}
            onChange={setTechnicianMembershipId}
            disabled={actionDisabled}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <LaborNumberInput label="Hours" value={hours} onChange={setHours} />

            <LaborNumberInput label="Rate" value={rate} onChange={setRate} />
          </div>

          <button
            type="button"
            disabled={actionDisabled}
            onClick={() => void handleCreate()}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />

            {isCreating ? "Adding..." : "Add labor"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-900">
            LABOR OPERATIONS
          </h3>

          <p className="mt-1 text-xs text-zinc-500">
            Edit, remove, start, and complete labor operations as work
            progresses.
          </p>
        </div>

        {isLoading ? (
          <LaborMessage>Loading labor...</LaborMessage>
        ) : isError ? (
          <LaborMessage>MotoDesk could not load labor.</LaborMessage>
        ) : laborLines.length === 0 ? (
          <LaborMessage>No labor lines have been added.</LaborMessage>
        ) : (
          <div className="divide-y divide-zinc-100">
            {laborLines.map((laborLine) => {
              const isEditing = editingLaborLineId === laborLine.id;

              return (
                <div key={laborLine.id} className="px-5 py-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        value={editDescription}
                        onChange={(event) =>
                          setEditDescription(event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <LaborNumberInput
                          label="Hours"
                          value={editHours}
                          onChange={setEditHours}
                        />

                        <LaborNumberInput
                          label="Rate"
                          value={editRate}
                          onChange={setEditRate}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={actionDisabled}
                          onClick={() => void handleSaveEdit(laborLine.id)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Save
                        </button>

                        <button
                          type="button"
                          disabled={actionDisabled}
                          onClick={handleCancelEdit}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-semibold text-zinc-600 disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900">
                          {laborLine.description}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                          <span>Hours: {laborLine.hours}</span>

                          <span>Rate: {formatCurrency(laborLine.rate)}</span>

                          <span>Status: {formatLabel(laborLine.status)}</span>
                          {laborLine.startedAt ? (
                            <span>
                              Actual:{" "}
                              {formatElapsedTime(
                                laborLine.startedAt,
                                laborLine.completedAt,
                              )}
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-xs text-zinc-400">
                          Technician:{" "}
                          {laborLine.technician
                            ? getMembershipName(laborLine.technician.user)
                            : "Unassigned"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!laborLine.completed ? (
                          <button
                            type="button"
                            disabled={actionDisabled}
                            onClick={() => handleBeginEdit(laborLine)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                        ) : null}

                        {/* {!laborLine.startedAt && !laborLine.completed ? (
                          <button
                            type="button"
                            disabled={actionDisabled}
                            onClick={() => void handleStart(laborLine.id)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-semibold text-zinc-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:opacity-50"
                          >
                            <Clock3 className="h-3.5 w-3.5" />
                            Start
                          </button>
                        ) : null} */}
{/* 
                        {laborLine.startedAt && !laborLine.completed ? (
                          <button
                            type="button"
                            disabled={actionDisabled}
                            onClick={() => void handleComplete(laborLine.id)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 px-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Complete
                          </button>
                        ) : null} */}

                        {laborLine.completed ? (
                          <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Completed
                          </span>
                        ) : null}

                        {!laborLine.completed ? (
                          <button
                            type="button"
                            disabled={actionDisabled}
                            onClick={() => void handleDelete(laborLine)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-semibold text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

type LaborNumberInputProps = {
  label: string;
  value: string;

  onChange: (value: string) => void;
};

function LaborNumberInput({ label, value, onChange }: LaborNumberInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-zinc-700">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="number"
        step="0.01"
        min="0"
        placeholder="Optional"
        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
      />
    </label>
  );
}

function LaborMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-40 place-items-center px-5 py-8 text-sm text-zinc-500">
      {children}
    </div>
  );
}

function parseOptionalNumber(value: string): number | undefined | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : null;
}

function getMembershipName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return name || user.email;
}

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(value: string): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatElapsedTime(
  startedAt: string,
  completedAt: string | null,
): string {
  const start = new Date(startedAt).getTime();

  const end = completedAt ? new Date(completedAt).getTime() : Date.now();

  const totalMinutes = Math.max(0, Math.floor((end - start) / 60000));

  const hours = Math.floor(totalMinutes / 60);

  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}
