export type SchedulingTab = "dispatch" | "appointments" | "unscheduled";

//************************************************************** */

type SchedulingTabsProps = {
  activeTab: SchedulingTab;

  appointmentsCount: number;

  unscheduledCount: number;

  onChange: (tab: SchedulingTab) => void;
};

//************************************************************** */

export function SchedulingTabs({
  activeTab,
  appointmentsCount,
  unscheduledCount,
  onChange,
}: SchedulingTabsProps) {
  const tabs: {
    key: SchedulingTab;

    label: string;
  }[] = [
    {
      key: "dispatch",

      label: "Dispatch Board",
    },

    {
      key: "appointments",

      label: `Appointments (${appointmentsCount})`,
    },

    {
      key: "unscheduled",

      label: `Unscheduled Work (${unscheduledCount})`,
    },
  ];

  return (
    <div className="flex overflow-x-auto border-b border-zinc-200">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === tab.key
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

//************************************************************** */

export function isSchedulingTab(value: string | null): value is SchedulingTab {
  return (
    value === "dispatch" || value === "appointments" || value === "unscheduled"
  );
}

//************************************************************** */
