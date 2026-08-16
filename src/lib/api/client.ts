// Minimal fetch client for the Woops Agent Engine API.
// Conventions (Obsidian: 10-api-integration):
// - Only auth endpoints wrap responses in { success, data }
// - Everything else returns raw entities / bare arrays
// - Errors: { statusCode, message, timestamp } via GlobalExceptionFilter
// - Refresh cookie is httpOnly & path-scoped to /api/v1/auth → send credentials
//   on every request so /auth/refresh works from the browser

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

// ----------------------------------------------------------------------
// Errors
// ----------------------------------------------------------------------

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

// ----------------------------------------------------------------------
// Access token (in-memory only — durable session lives in the
// httpOnly refresh cookie)
// ----------------------------------------------------------------------

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

// Fired when a refresh fails — the session is gone.
export const AUTH_EXPIRED_EVENT = "woops:auth-expired";

function emitAuthExpired(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }
}

// ----------------------------------------------------------------------
// Token refresh (single-flight, so concurrent 401s share one refresh)
// ----------------------------------------------------------------------

let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        setAccessToken(null);
        return false;
      }
      const body = await res.json();
      const data = body?.data;
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        return true;
      }
      setAccessToken(null);
      return false;
    } catch {
      setAccessToken(null);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ----------------------------------------------------------------------
// Request helpers
// ----------------------------------------------------------------------

export interface RequestOptions extends RequestInit {
  /** Unwrap { success, data } envelopes (auth endpoints only). */
  envelope?: boolean;
  /** Skip the 401 → refresh → retry dance. */
  skipAuthRetry?: boolean;
}

async function streamRequest(
  path: string,
  body: unknown,
  options: RequestOptions = {},
): Promise<Response> {
  const { skipAuthRetry, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    ...(headers as Record<string, string>),
  };

  const doFetch = async (): Promise<Response> => {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;

    return fetch(`${API_URL}${path}`, {
      ...rest,
      method: "POST",
      body: JSON.stringify(body),
      headers: finalHeaders,
      credentials: "include",
    });
  };

  let res = await doFetch();

  if (res.status === 401 && !skipAuthRetry) {
    const refreshed = await refreshToken();
    if (refreshed) {
      res = await doFetch();
    } else {
      emitAuthExpired();
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const { message, code } = parseErrorBody(body);
    throw new ApiError(res.status, message, code);
  }

  return res;
}

export function buildQuery(
  params?: Record<string, string | number | boolean | undefined | null> | object,
): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function parseErrorBody(body: unknown): { message: string; code?: string } {
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    if (typeof obj.message === "string") {
      const code =
        obj && typeof (obj as { error?: { code?: string } }).error === "object"
          ? (obj as { error?: { code?: string } }).error?.code
          : undefined;
      return { message: obj.message, code };
    }
    if (typeof obj.error === "object" && obj.error !== null) {
      const error = obj.error as { message?: string; code?: string };
      if (typeof error.message === "string") {
        return { message: error.message, code: error.code };
      }
    }
  }
  return { message: "Unexpected error" };
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { envelope, skipAuthRetry, headers, ...rest } = options;
  const token = getAccessToken();

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };
  if (!(rest.body instanceof FormData) && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const doFetch = async (): Promise<Response> =>
    fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      credentials: "include",
    });

  const handle = async (res: Response): Promise<T> => {
    if (res.status === 204) {
      return undefined as T;
    }

    const body = await res.json().catch(() => null);

    if (res.ok) {
      if (envelope && body && typeof body === "object" && "data" in body) {
        return (body as { data: T }).data;
      }
      return body as T;
    }

    const { message, code } = parseErrorBody(body);
    throw new ApiError(res.status, message, code);
  };

  let res = await doFetch();

  // 401 → refresh once → retry
  if (res.status === 401 && !skipAuthRetry) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const token2 = getAccessToken();
      if (token2) finalHeaders["Authorization"] = `Bearer ${token2}`;
      res = await doFetch();
    } else {
      emitAuthExpired();
    }
  }

  return handle(res);
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body:
        body === undefined || body instanceof FormData
          ? body
          : JSON.stringify(body),
    }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
  stream: (path: string, body?: unknown, options?: RequestOptions) =>
    streamRequest(path, body, options),
};
