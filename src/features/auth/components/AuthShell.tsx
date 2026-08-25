//************************************************************** */

import Link from "next/link";
import type { ReactNode } from "react";

//************************************************************** */

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

//************************************************************** */

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(320px,0.9fr)_minmax(520px,1.1fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-zinc-950 px-10 py-10 text-white lg:block xl:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(249,115,22,0.24),transparent_34%),radial-gradient(circle_at_85%_85%,rgba(249,115,22,0.09),transparent_38%)]" />

        <div className="relative z-10 flex min-h-[calc(100vh-5rem)] max-w-xl flex-col">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-3 text-xl font-bold tracking-tight text-white"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-lg font-extrabold shadow-lg shadow-orange-500/20">
              M
            </span>

            <span>MotoDesk</span>
          </Link>

          <div className="my-auto py-16">
            <span className="mb-5 block text-xs font-bold uppercase tracking-[0.14em] text-orange-400">
              Powersports operations, connected.
            </span>

            <h2 className="max-w-xl text-5xl font-bold leading-[1.02] tracking-[-0.045em] xl:text-6xl">
              Run the shop from one command center.
            </h2>

            <p className="mt-7 max-w-lg text-base leading-7 text-zinc-400">
              Repair orders, scheduling, parts,
              customers, units, team activity, and
              dealership operations stay connected
              from the first write-up through final
              delivery.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/3 p-4">
              <strong className="mb-2 block text-xs font-semibold text-white">
                One workspace
              </strong>
              <span className="block text-[11px] leading-5 text-zinc-500">
                Service, parts, sales & operations
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/3 p-4">
              <strong className="mb-2 block text-xs font-semibold text-white">
                Built for teams
              </strong>
              <span className="block text-[11px] leading-5 text-zinc-500">
                Role-aware access from day one
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/3 p-4">
              <strong className="mb-2 block text-xs font-semibold text-white">
                Always current
              </strong>
              <span className="block text-[11px] leading-5 text-zinc-500">
                Live shop status without paper trails
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-orange-500">
              {eyebrow}
            </span>

            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              {title}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
              {description}
            </p>
          </div>

          {children}

          <div className="mt-7 text-center text-sm text-zinc-600 [&_a]:font-semibold [&_a]:text-orange-500 [&_a:hover]:text-orange-600">
            {footer}
          </div>
        </div>
      </section>
    </main>
  );
}

//************************************************************** */

