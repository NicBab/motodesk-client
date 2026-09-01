"use client";

import {
  Plus,
  Search,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type { Part } from "@/features/parts/part.types";

//************************************************************** */

type Props = {
  parts: Part[];

  cartQuantityByPartId: Map<string, number>;

  onAdd: (part: Part) => void;
};

//************************************************************** */

export function PosCatalog({
  parts,
  cartQuantityByPartId,
  onAdd,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [brand, setBrand] =
    useState("");

  //************************************************************** */

  const categories =
    useMemo(
      () =>
        Array.from(
          new Set(
            parts
              .map(
                (part) =>
                  part.category,
              )
              .filter(
                (
                  value,
                ): value is string =>
                  Boolean(value),
              ),
          ),
        ).sort(),
      [parts],
    );

  const brands =
    useMemo(
      () =>
        Array.from(
          new Set(
            parts
              .map(
                (part) =>
                  part.brand,
              )
              .filter(
                (
                  value,
                ): value is string =>
                  Boolean(value),
              ),
          ),
        ).sort(),
      [parts],
    );

  //************************************************************** */

  const filtered =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return parts.filter(
        (part) => {
          if (
            category &&
            part.category !==
              category
          ) {
            return false;
          }

          if (
            brand &&
            part.brand !== brand
          ) {
            return false;
          }

          if (!value) {
            return true;
          }

          return [
            part.partNumber,
            part.oemPartNumber,
            part.description,
            part.brand,
            part.category,
          ].some((field) =>
            field
              ?.toLowerCase()
              .includes(value),
          );
        },
      );
    }, [
      parts,
      search,
      category,
      brand,
    ]);

  //************************************************************** */

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search part number, description, brand..."
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </div>

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value,
              )
            }
            className={selectClassName}
          >
            <option value="">
              All categories
            </option>

            {categories.map(
              (value) => (
                <option
                  key={value}
                  value={value}
                >
                  {value}
                </option>
              ),
            )}
          </select>

          <select
            value={brand}
            onChange={(event) =>
              setBrand(
                event.target.value,
              )
            }
            className={selectClassName}
          >
            <option value="">
              All brands
            </option>

            {brands.map(
              (value) => (
                <option
                  key={value}
                  value={value}
                >
                  {value}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[780px]">
          <thead className="sticky top-0 z-10 bg-zinc-50">
            <tr className="border-b border-zinc-200">
              <Heading>
                Part #
              </Heading>

              <Heading>
                Description
              </Heading>

              <Heading>
                Brand
              </Heading>

              <Heading align="right">
                Available
              </Heading>

              <Heading align="right">
                Price
              </Heading>

              <Heading>
                Bin
              </Heading>

              <Heading align="right">
                Action
              </Heading>
            </tr>
          </thead>

          <tbody>
            {filtered.map(
              (part) => {
                const onHand =
                  Number(
                    part.qtyOnHand,
                  );

                const inCart =
                  cartQuantityByPartId.get(
                    part.id,
                  ) ?? 0;

                const remaining =
                  Math.max(
                    onHand -
                      inCart,
                    0,
                  );

                return (
                  <tr
                    key={part.id}
                    className="border-b border-zinc-100 hover:bg-zinc-50"
                  >
                    <Cell mono strong>
                      {part.partNumber}
                    </Cell>

                    <Cell>
                      <p className="font-semibold text-zinc-900">
                        {
                          part.description
                        }
                      </p>

                      {part.category ? (
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {
                            part.category
                          }
                        </p>
                      ) : null}
                    </Cell>

                    <Cell>
                      {part.brand ??
                        "—"}
                    </Cell>

                    <Cell align="right">
                      <span
                        className={
                          remaining <= 0
                            ? "font-semibold text-red-600"
                            : remaining <=
                                Number(
                                  part.reorderPoint,
                                )
                              ? "font-semibold text-amber-600"
                              : "font-semibold text-zinc-700"
                        }
                      >
                        {formatQuantity(
                          remaining,
                        )}
                      </span>
                    </Cell>

                    <Cell align="right">
                      <span className="font-semibold text-zinc-900">
                        {formatCurrency(
                          Number(
                            part.sellPrice,
                          ),
                        )}
                      </span>
                    </Cell>

                    <Cell>
                      {part.location ??
                        "—"}
                    </Cell>

                    <Cell align="right">
                      <button
                        type="button"
                        disabled={
                          remaining <= 0
                        }
                        onClick={() =>
                          onAdd(part)
                        }
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-orange-500 px-3 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                      >
                        <Plus className="h-3.5 w-3.5" />

                        Add
                      </button>
                    </Cell>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>

        {filtered.length === 0 ? (
          <div className="grid min-h-56 place-items-center p-8 text-center text-sm text-zinc-500">
            No sellable parts match the current search.
          </div>
        ) : null}
      </div>
    </section>
  );
}

//************************************************************** */

function Heading({
  children,
  align = "left",
}: {
  children:
    React.ReactNode;

  align?:
    | "left"
    | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

//************************************************************** */

function Cell({
  children,
  align = "left",
  mono = false,
  strong = false,
}: {
  children:
    React.ReactNode;

  align?:
    | "left"
    | "right";

  mono?: boolean;

  strong?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 text-sm text-zinc-700 ${
        align === "right"
          ? "text-right"
          : "text-left"
      } ${
        mono
          ? "font-mono"
          : ""
      } ${
        strong
          ? "font-semibold text-zinc-900"
          : ""
      }`}
    >
      {children}
    </td>
  );
}

//************************************************************** */

function formatQuantity(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 3,
    },
  ).format(value);
}

//************************************************************** */

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        "USD",
    },
  ).format(value);
}

//************************************************************** */

const selectClassName =
  "h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

//************************************************************** */
