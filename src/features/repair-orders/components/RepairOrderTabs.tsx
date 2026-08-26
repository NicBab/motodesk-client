"use client";

type RepairOrderTab =
  | "overview"
  | "actions"
  | "labor"
  | "parts"
  | "additional-work"
  | "approval"
  | "cashier";

type RepairOrderTabsProps = {
  activeTab: RepairOrderTab;

  onChange: (tab: RepairOrderTab) => void;
};

const tabs: Array<{
  id: RepairOrderTab;
  label: string;
}> = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "actions",
    label: "Actions",
  },
  {
    id: "labor",
    label: "Labor",
  },
  {
    id: "parts",
    label: "Parts",
  },
  {
    id: "additional-work",
    label: "Additional Work",
  },
  {
    id: "approval",
    label: "Approval",
  },
  {
    id: "cashier",
    label: "Cashier / Pickup",
  },
];

export function RepairOrderTabs({ activeTab, onChange }: RepairOrderTabsProps) {
  return (
    <div className="overflow-x-auto border-b border-zinc-200">
      <nav className="flex min-w-max gap-1" aria-label="Repair order sections">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition ${
                active ? "text-orange-600" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {tab.label}

              {active ? (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-orange-500" />
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export type { RepairOrderTab };
