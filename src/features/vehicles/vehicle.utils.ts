 //************************************************************** */

export function formatVehicleName(
  year: number | null,
  make: string,
  model: string,
  trim: string | null,
): string {
  return [
    year,
    make,
    model,
    trim,
  ]
    .filter(Boolean)
    .join(" ");
}

 //************************************************************** */

export function formatVehicleLabel(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

 //************************************************************** */