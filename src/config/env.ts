const defaultApiUrl = "http://localhost:5001/api/v1";

export const clientEnv = {
  apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, ""),
};