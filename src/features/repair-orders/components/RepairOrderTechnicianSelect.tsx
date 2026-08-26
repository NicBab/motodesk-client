"use client";

import {
  useGetMembershipsQuery,
} from "../../../store/api/memberships.Api"

type RepairOrderTechnicianSelectProps = {
  organizationId: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function RepairOrderTechnicianSelect({
  organizationId,
  value,
  onChange,
  disabled = false,
}: RepairOrderTechnicianSelectProps) {
  const {
    data: technicians = [],
    isLoading,
  } = useGetMembershipsQuery({
    organizationId,
    role: "TECHNICIAN",
    status: "ACTIVE",
  });

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-zinc-700">
        Technician
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled || isLoading}
        className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
      >
        <option value="">
          {isLoading
            ? "Loading technicians..."
            : "Unassigned"}
        </option>

        {technicians.map(
          (technician) => (
            <option
              key={technician.id}
              value={technician.id}
            >
              {getTechnicianName(
                technician.user,
              )}
            </option>
          ),
        )}
      </select>
    </label>
  );
}

function getTechnicianName(
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  },
): string {
  const name = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return name || user.email;
}