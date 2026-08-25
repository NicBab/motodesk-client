//************************************************************** */

export function createOrganizationSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

//************************************************************** */

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

//************************************************************** */

export function formatPlanName(
  plan?: string | null,
): string | null {
  if (!plan) return null;

  const normalized = plan.trim().toLowerCase();

  const knownPlans = new Set([
    "starter",
    "business",
    "pro",
    "enterprise",
  ]);

  if (!knownPlans.has(normalized)) {
    return null;
  }

  return (
    normalized.charAt(0).toUpperCase() +
    normalized.slice(1)
  );
}

//************************************************************** */