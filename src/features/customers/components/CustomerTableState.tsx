//************************************************************** */

import { UserRound } from "lucide-react";

import type { ReactNode } from "react";

//************************************************************** */

type TableMessageProps = {
  children: ReactNode;
};

//************************************************************** */

export function CustomerTableMessage({ children }: TableMessageProps) {
  return (
    <div className="grid min-h-64 place-items-center p-8 text-sm text-zinc-500">
      {children}
    </div>
  );
}

//************************************************************** */

export function EmptyCustomers() {
  return (
    <div className="grid min-h-72 place-items-center p-8 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-zinc-100 text-zinc-400">
          <UserRound className="h-5 w-5" />
        </div>

        <p className="mt-4 text-sm font-semibold text-zinc-700">
          No customers found
        </p>

        <p className="mt-1 text-xs text-zinc-400">
          Customer records will appear here as they are added.
        </p>
      </div>
    </div>
  );
}

//************************************************************** */

type TableHeadingProps = {
  children: ReactNode;
  align?: "left" | "right";
};

//************************************************************** */

export function CustomerTableHeading({
  children,
  align = "left",
}: TableHeadingProps) {
  return (
    <th
      className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

//************************************************************** */
