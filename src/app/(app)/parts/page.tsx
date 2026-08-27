"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { PartsInventoryTab } from "@/features/parts/components/PartsInventoryTab";

import {
  PartsTabs,
  type PartsTab,
} from "@/features/parts/components/PartsTabs";

import { PurchaseOrdersTab } from "@/features/parts/components/PurchaseOrdersTab";

import { ReceivingTab } from "@/features/parts/components/ReceivingTab";

import { VendorsTab } from "@/features/parts/components/VendorsTab";

import { ReturnsTab } from "@/features/parts/components/ReturnsTab";

//************************************************************** */

const validTabs: PartsTab[] = [
  "inventory",
  "most-sold",
  "to-be-ordered",
  "purchase-orders",
  "receiving",
  "returns",
  "vendors",
];

//************************************************************** */

export default function PartsPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const queryTab = searchParams.get("tab");

  const activeTab: PartsTab = isPartsTab(queryTab) ? queryTab : "inventory";

  //************************************************************** */

  function handleTabChange(tab: PartsTab) {
    const params = new URLSearchParams(searchParams.toString());

    if (tab === "inventory") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }

    const query = params.toString();

    router.replace(query ? `/parts?${query}` : "/parts", {
      scroll: false,
    });
  }

  //************************************************************** */

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

      <PartsTabs activeTab={activeTab} onChange={handleTabChange} />

      {activeTab === "inventory" ? <PartsInventoryTab /> : null}

      {activeTab === "purchase-orders" ? <PurchaseOrdersTab /> : null}

      {activeTab === "receiving" ? <ReceivingTab /> : null}

      {activeTab === "returns" ? <ReturnsTab /> : null}

      {activeTab === "vendors" ? <VendorsTab /> : null}

      {![
        "inventory",
        "purchase-orders",
        "receiving",
        "returns",
        "vendors",
      ].includes(activeTab) ? (
        <ComingNext tab={activeTab} />
      ) : null}
    </div>
  );
}

//************************************************************** */

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

//************************************************************** */

function isPartsTab(value: string | null): value is PartsTab {
  return value !== null && validTabs.includes(value as PartsTab);
}

//************************************************************** */

function formatLabel(value: string): string {
  return value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */
