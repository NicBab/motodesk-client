//************************************************************** */

import type { Customer } from "./customer.types";

//************************************************************** */

export function getCustomerDisplayName(customer: Customer): string {
  if (customer.type === "BUSINESS") {
    return customer.companyName ?? "Unnamed business";
  }

  const name = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(" ");

  return name || "Unnamed customer";
}

//************************************************************** */
