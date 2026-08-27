"use client";

export type PartsTab =
  | "inventory"
  | "most-sold"
  | "to-be-ordered"
  | "purchase-orders"
  | "receiving"
  | "returns"
  | "vendors";

const tabs: Array<{
  id: PartsTab;
  label: string;
}> = [
  {
    id: "inventory",
    label: "Inventory",
  },
  {
    id: "most-sold",
    label: "Most Sold Parts",
  },
  {
    id: "to-be-ordered",
    label: "To Be Ordered",
  },
  {
    id: "purchase-orders",
    label: "Purchase Orders",
  },
  {
    id: "receiving",
    label: "Receiving",
  },
  {
    id: "returns",
    label: "Returns",
  },
  {
    id: "vendors",
    label: "Vendors",
  },
];

type Props = {
  activeTab: PartsTab;

  onChange: (tab: PartsTab) => void;
};

export function PartsTabs({ activeTab, onChange }: Props) {
  return (
    <div className="overflow-x-auto border-b border-zinc-200">
      <nav className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;

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
