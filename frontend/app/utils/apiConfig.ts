export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.endsWith(".local");

    if (isLocalhost) {
      return "http://localhost:4000/api";
    }
    return "/api";
  }
  return "http://localhost:4000/api";
}

export const API_BASE = getApiBaseUrl();
