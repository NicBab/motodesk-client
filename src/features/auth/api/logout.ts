import { apiRequest } from "@/lib/api/api-client";

export function logout(): Promise<void> {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
    body: {},
  });
}