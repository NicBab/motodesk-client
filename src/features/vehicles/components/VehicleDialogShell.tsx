//************************************************************** */

"use client";

import { X } from "lucide-react";

import type { ReactNode } from "react";

//************************************************************** */

type VehicleDialogShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
};

//************************************************************** */

export function VehicleDialogShell({
  title,
  description,
  children,
  onClose,
}: VehicleDialogShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <aside className="relative z-10 h-full w-full max-w-3xl overflow-y-auto bg-zinc-50 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-zinc-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">{title}</h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </aside>
    </div>
  );
}

//************************************************************** */
