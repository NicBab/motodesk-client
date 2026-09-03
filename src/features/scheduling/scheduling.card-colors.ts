//************************************************************** */

export type ScheduleCardColor = {
  stripe: string;
  border: string;
  hoverBorder: string;
};

//************************************************************** */

export const SCHEDULE_CARD_PALETTE: ScheduleCardColor[] = [
  {
    stripe: "bg-violet-500",
    border: "border-violet-300",
    hoverBorder: "hover:border-violet-500",
  },

  {
    stripe: "bg-teal-500",
    border: "border-teal-300",
    hoverBorder: "hover:border-teal-500",
  },

  {
    stripe: "bg-amber-500",
    border: "border-amber-300",
    hoverBorder: "hover:border-amber-500",
  },

  {
    stripe: "bg-rose-500",
    border: "border-rose-300",
    hoverBorder: "hover:border-rose-500",
  },

  {
    stripe: "bg-cyan-500",
    border: "border-cyan-300",
    hoverBorder: "hover:border-cyan-500",
  },

  {
    stripe: "bg-indigo-500",
    border: "border-indigo-300",
    hoverBorder: "hover:border-indigo-500",
  },

  {
    stripe: "bg-lime-500",
    border: "border-lime-300",
    hoverBorder: "hover:border-lime-500",
  },

  {
    stripe: "bg-orange-500",
    border: "border-orange-300",
    hoverBorder: "hover:border-orange-500",
  },

  {
    stripe: "bg-fuchsia-500",
    border: "border-fuchsia-300",
    hoverBorder: "hover:border-fuchsia-500",
  },

  {
    stripe: "bg-emerald-500",
    border: "border-emerald-300",
    hoverBorder: "hover:border-emerald-500",
  },
];

//************************************************************** */

export function stableScheduleHash(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

//************************************************************** */

export function getScheduleCardColor(key: string): ScheduleCardColor {
  return SCHEDULE_CARD_PALETTE[
    stableScheduleHash(key) % SCHEDULE_CARD_PALETTE.length
  ];
}

//************************************************************** */
