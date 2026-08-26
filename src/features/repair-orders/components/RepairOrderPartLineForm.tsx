"use client";

import { Plus } from "lucide-react";

import { useState } from "react";

import { toast } from "sonner";

import { useCreateRepairOrderPartLineMutation } from "@/store/api/repairOrdersApi";

type RepairOrderPartLineFormProps = {
  organizationId: string;
  repairOrderId: string;
};

export function RepairOrderPartLineForm({
  organizationId,
  repairOrderId,
}: RepairOrderPartLineFormProps) {
  const [partNumber, setPartNumber] = useState("");

  const [description, setDescription] = useState("");

  const [quantity, setQuantity] = useState("1");

  const [unitPrice, setUnitPrice] = useState("");

  const [vendorName, setVendorName] = useState("");

  const [blocksWork, setBlocksWork] = useState(true);

  const [createPartLine, { isLoading }] =
    useCreateRepairOrderPartLineMutation();

  async function handleSubmit() {
    const trimmedPartNumber = partNumber.trim();

    const trimmedDescription = description.trim();

    if (!trimmedPartNumber) {
      toast.error("Enter a part number.");

      return;
    }

    if (!trimmedDescription) {
      toast.error("Enter a part description.");

      return;
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      toast.error("Enter a valid quantity.");

      return;
    }

    const parsedUnitPrice = unitPrice.trim() ? Number(unitPrice) : undefined;

    if (parsedUnitPrice !== undefined && !Number.isFinite(parsedUnitPrice)) {
      toast.error("Enter a valid unit price.");

      return;
    }

    try {
      await createPartLine({
        organizationId,
        repairOrderId,
        partNumber: trimmedPartNumber,
        description: trimmedDescription,
        quantity: parsedQuantity,
        requiredQty: parsedQuantity,
        approvedQty: parsedQuantity,
        unitPrice: parsedUnitPrice,
        vendorName: vendorName.trim() || undefined,
        blocksWork,
      }).unwrap();

      setPartNumber("");
      setDescription("");
      setQuantity("1");
      setUnitPrice("");
      setVendorName("");
      setBlocksWork(true);

      toast.success("Part line added.");
    } catch {
      toast.error("MotoDesk could not add the part line.");
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">ADD PART</h3>

        <p className="mt-1 text-xs text-zinc-500">
          Add a required part to this repair order.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Part number
            </span>

            <input
              value={partNumber}
              onChange={(event) => setPartNumber(event.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Quantity
            </span>

            <input
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              type="number"
              min="0.01"
              step="0.01"
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-zinc-700">
            Description
          </span>

          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Unit price
            </span>

            <input
              value={unitPrice}
              onChange={(event) => setUnitPrice(event.target.value)}
              type="number"
              min="0"
              step="0.01"
              placeholder="Optional"
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-zinc-700">
              Vendor
            </span>

            <input
              value={vendorName}
              onChange={(event) => setVendorName(event.target.value)}
              placeholder="Optional"
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={blocksWork}
            onChange={(event) => setBlocksWork(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-300"
          />

          <span className="text-sm text-zinc-700">This part blocks work</span>
        </label>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => void handleSubmit()}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />

          {isLoading ? "Adding..." : "Add part"}
        </button>
      </div>
    </section>
  );
}
