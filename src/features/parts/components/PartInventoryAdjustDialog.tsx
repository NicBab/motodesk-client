"use client";

import { useState } from "react";

import { X } from "lucide-react";

import { toast } from "sonner";

import {
  useAdjustPartInventoryMutation,
  useCycleCountPartInventoryMutation,
} from "@/store/api/partsApi";

import type { Part } from "../part.types";

type InventoryMode = "adjust" | "count";

type Props = {
  organizationId: string;

  part: Part | null;

  open: boolean;

  onClose: () => void;
};

export function PartInventoryAdjustDialog({
  organizationId,
  part,
  open,
  onClose,
}: Props) {
  const [mode, setMode] = useState<InventoryMode>("adjust");

  const [quantity, setQuantity] = useState("");

  const [notes, setNotes] = useState("");

  const [adjustInventory, { isLoading: isAdjusting }] =
    useAdjustPartInventoryMutation();

  const [cycleCount, { isLoading: isCounting }] =
    useCycleCountPartInventoryMutation();

  if (!open || !part) {
    return null;
  }

  const disabled = isAdjusting || isCounting;

  async function handleSubmit() {
    if (!part) {
      return;
    }

    const parsed = Number(quantity);

    if (!Number.isFinite(parsed)) {
      toast.error("Enter a valid quantity.");

      return;
    }

    try {
      if (mode === "adjust") {
        if (parsed === 0) {
          toast.error("Adjustment cannot be zero.");

          return;
        }

        await adjustInventory({
          organizationId,
          partId: part.id,
          quantity: parsed,
          notes: notes.trim() || undefined,
        }).unwrap();

        toast.success("Inventory adjusted.");
      } else {
        if (parsed < 0) {
          toast.error("Count cannot be negative.");

          return;
        }

        await cycleCount({
          organizationId,
          partId: part.id,
          countedQuantity: parsed,
          notes: notes.trim() || undefined,
        }).unwrap();

        toast.success("Inventory count updated.");
      }

      setQuantity("");
      setNotes("");
      onClose();
    } catch {
      toast.error("MotoDesk could not update inventory.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              Inventory Adjustment
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              {part.partNumber}
              {" · "}
              {part.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-3 gap-3">
            <Metric label="On Hand" value={part.qtyOnHand} />

            <Metric label="Allocated" value={part.qtyAllocated} />

            <Metric label="On Order" value={part.qtyOnOrder} />
          </div>

          <div className="flex gap-2">
            <ModeButton
              active={mode === "adjust"}
              onClick={() => setMode("adjust")}
            >
              Adjustment
            </ModeButton>

            <ModeButton
              active={mode === "count"}
              onClick={() => setMode("count")}
            >
              Cycle Count
            </ModeButton>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              {mode === "adjust" ? "Adjustment quantity" : "Counted quantity"}
            </span>

            <input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder={
                mode === "adjust"
                  ? "Example: 5 or -2"
                  : "Actual quantity counted"
              }
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 outline-none focus:border-orange-500"
            />

            {mode === "adjust" ? (
              <p className="mt-1 text-xs text-zinc-400">
                Positive adds inventory. Negative removes inventory.
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Notes
            </span>

            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Reason for adjustment..."
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-orange-500"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={disabled}
              onClick={() => void handleSubmit()}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {disabled ? "Saving..." : "Save inventory"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-zinc-900">{value}</p>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;

  onClick: () => void;

  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-lg border px-3 text-xs font-semibold ${
        active
          ? "border-orange-300 bg-orange-50 text-orange-700"
          : "border-zinc-200 bg-white text-zinc-600"
      }`}
    >
      {children}
    </button>
  );
}
