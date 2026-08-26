import { ClipboardList } from "lucide-react";

import type { ReactNode } from "react";

type RepairOrderTableHeadingProps = {
  children: ReactNode;
};

export function RepairOrderTableHeading({
  children,
}: RepairOrderTableHeadingProps) {
  return (
    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
      {children}
    </th>
  );
}

type RepairOrderTableMessageProps = {
  children: ReactNode;
};

export function RepairOrderTableMessage({
  children,
}: RepairOrderTableMessageProps) {
  return (
    <div className="grid min-h-64 place-items-center p-8 text-sm text-zinc-500">
      {children}
    </div>
  );
}

export function EmptyRepairOrders() {
  return (
    <div className="grid min-h-72 place-items-center p-8 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-zinc-100 text-zinc-400">
          <ClipboardList className="h-5 w-5" />
        </div>

        <p className="mt-4 text-sm font-semibold text-zinc-700">
          No repair orders found
        </p>

        <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-400">
          Repair orders matching the current filters will appear here.
        </p>
      </div>
    </div>
  );
}
