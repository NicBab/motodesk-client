import type { Employee } from "../employee.types";

import type { EmployeeAccessItem } from "./user-permissions.types";

//************************************************************** */

export function getEmployeeInitials(employee: Employee): string {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(
    0,
  )}`.toUpperCase();
}

//************************************************************** */

export function formatPermissionLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

export function formatPermissionAction(value: string): string {
  if (!value) {
    return "Access";
  }

  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

//************************************************************** */

export function samePermissionSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const rightSet = new Set<string>(right);

  return left.every((permission) => rightSet.has(permission));
}

//************************************************************** */

export function uniqueSortedPermissions(values: string[]): string[] {
  return Array.from(new Set<string>(values)).sort();
}

//************************************************************** */

export function resolveSelectedEmployeeId(
  accessList: EmployeeAccessItem[],
  selectedEmployeeId: string,
): string {
  const exists = accessList.some(
    (item) => item.employee.id === selectedEmployeeId,
  );

  if (exists) {
    return selectedEmployeeId;
  }

  return accessList[0]?.employee.id ?? "";
}

//************************************************************** */
