"use client";

type VehicleTab = "details" | "service";

type VehicleTabsProps = {
  activeTab: VehicleTab;

  onChange: (tab: VehicleTab) => void;
};

const tabs: Array<{
  id: VehicleTab;
  label: string;
}> = [
  {
    id: "details",
    label: "Vehicle Details",
  },
  {
    id: "service",
    label: "Service History",
  },
];

export function VehicleTabs({ activeTab, onChange }: VehicleTabsProps) {
  return (
    <div className="border-b border-zinc-200">
      <nav className="flex gap-1" aria-label="Vehicle sections">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative px-4 py-3 text-sm font-semibold transition ${
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

export type { VehicleTab };
