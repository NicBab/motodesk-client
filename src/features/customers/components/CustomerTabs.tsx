//************************************************************** */

"use client";

//************************************************************** */

type CustomerTab = "details" | "vehicles" | "purchases";

//************************************************************** */

type CustomerTabsProps = {
  activeTab: CustomerTab;
  onChange: (tab: CustomerTab) => void;
};

//************************************************************** */

const tabs: Array<{
  id: CustomerTab;
  label: string;
}> = [
  {
    id: "details",
    label: "Customer Details",
  },
  {
    id: "vehicles",
    label: "Owned Vehicles",
  },
  {
    id: "purchases",
    label: "Purchase History",
  },
];

//************************************************************** */

export function CustomerTabs({ activeTab, onChange }: CustomerTabsProps) {
  return (
    <div className="border-b border-zinc-200">
      <nav className="flex gap-1" aria-label="Customer sections">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
//************************************************************** */
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

export type { CustomerTab };

//************************************************************** */
