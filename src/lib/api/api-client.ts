//************************************************************** */

import { clientEnv } from "@/config/env";
import { ApiError, type ApiErrorPayload } from "./api-error";

//************************************************************** */

type ApiSuccessPayload<T> = {
  success: true;
  data: T;
};

//************************************************************** */

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

//************************************************************** */

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${clientEnv.apiUrl}${path}`, {
    ...options,
    headers,
    credentials: "include",
    body:
      options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiSuccessPayload<T>
    | ApiErrorPayload
    | null;

  if (!response.ok) {
    const errorPayload: ApiErrorPayload =
      payload && payload.success === false
        ? payload
        : {
            success: false,
            message: "MotoDesk could not complete that request.",
          };

    throw new ApiError(response.status, errorPayload);
  }

  if (!payload || payload.success !== true) {
    throw new ApiError(response.status, {
      success: false,
      message: "MotoDesk received an unexpected response from the server.",
    });
  }

  return payload.data;
}

//************************************************************** */