"use client";

import { useState } from "react";

import { PartsInventoryTab } from "@/features/parts/components/PartsInventoryTab";

import {
  PartsTabs,
  type PartsTab,
} from "@/features/parts/components/PartsTabs";

import { PurchaseOrdersTab } from "@/features/parts/components/PurchaseOrdersTab";

import { VendorsTab } from "@/features/parts/components/VendorsTab";

export default function PartsPage() {
  const [activeTab, setActiveTab] = useState<PartsTab>("inventory");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Parts
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Inventory, purchasing, receiving, returns, and vendor management.
        </p>
      </div>

      <PartsTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "inventory" ? <PartsInventoryTab /> : null}

      {activeTab === "purchase-orders" ? <PurchaseOrdersTab /> : null}

      {activeTab === "vendors" ? <VendorsTab /> : null}

      {!["inventory", "purchase-orders", "vendors"].includes(activeTab) ? (
        <ComingNext tab={activeTab} />
      ) : null}
    </div>
  );
}

function ComingNext({ tab }: { tab: PartsTab }) {
  return (
    <section className="grid min-h-64 place-items-center rounded-xl border border-zinc-200 bg-white p-8 text-center">
      <div>
        <p className="text-sm font-semibold text-zinc-900">
          {formatLabel(tab)}
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          This tab is the next Parts vertical slice.
        </p>
      </div>
    </section>
  );
}

function formatLabel(value: string): string {
  return value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
