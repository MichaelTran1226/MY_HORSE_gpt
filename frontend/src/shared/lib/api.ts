/**
 * EquiFlow - Central API Client Wrapper
 * Hỗ trợ Dual-Mode: Gọi REST API thật hoặc chuyển hướng sang localStorage Mock Engine
 */

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errorCode?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const USE_MOCK =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === "true";

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, headers, ...restOptions } = options;

  if (USE_MOCK) {
    // Dynamic import mock handler in mock mode
    console.info(`[API Mock] ${restOptions.method || "GET"} ${endpoint}`);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 250));
    const mockStorageKey = `mock:${endpoint.split("?")[0]}`;
    const cached = localStorage.getItem(mockStorageKey);
    if (cached) {
      return JSON.parse(cached);
    }
    return {} as T;
  }

  // Construct URL with Query Params
  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const queryString = searchParams.toString();
    if (queryString) url += `?${queryString}`;
  }

  const response = await fetch(url, {
    credentials: "include", // Always send HttpOnly Cookie
    headers: {
      "Content-Type": "application/json",
      "X-Equiflow-Request": "1",
      ...headers,
    },
    ...restOptions,
  });

  if (response.status === 401) {
    if (
      !endpoint.startsWith("/auth/login") &&
      !endpoint.startsWith("/auth/otp")
    ) {
      localStorage.removeItem("equiflow:user");
      window.dispatchEvent(new CustomEvent("equiflow:session-expired"));
    }
  }

  if (response.status === 403) {
    window.location.href = "/forbidden-403";
    throw new Error("FORBIDDEN");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.errorCode || "API_REQUEST_FAILED");
  }

  return data.data !== undefined ? data.data : data;
}
