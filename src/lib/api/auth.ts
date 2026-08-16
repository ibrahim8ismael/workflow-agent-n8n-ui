// Auth endpoints — /api/v1/auth
// These are the ONLY endpoints that wrap responses in { success, data }.

import { api } from "@/lib/api/client";
import type { AuthUser, OtpVerifyResponse, User } from "@/lib/api/types";

export interface OtpRequestResponse {
  success: boolean;
  message: string;
}

/** POST /auth/otp/request — send a 6-digit code to the user's email. */
export async function requestOtp(email: string): Promise<OtpRequestResponse> {
  return api.post<OtpRequestResponse>("/auth/otp/request", { email });
}

/** POST /auth/otp/verify — exchange code for access token + refresh cookie. */
export async function verifyOtp(
  email: string,
  otp: string,
): Promise<OtpVerifyResponse> {
  return api.post<OtpVerifyResponse>(
    "/auth/otp/verify",
    { email, otp },
    { envelope: true },
  );
}

export interface RefreshResponse {
  accessToken: string;
}

/** POST /auth/refresh — rotate the refresh cookie, get a new access token. */
export async function refreshSession(): Promise<RefreshResponse | null> {
  try {
    return await api.post<RefreshResponse>(
      "/auth/refresh",
      undefined,
      { envelope: true, skipAuthRetry: true },
    );
  } catch {
    return null;
  }
}

/** POST /auth/logout — revoke the current session. 204. */
export async function logout(): Promise<void> {
  return api.post<void>("/auth/logout");
}

/** POST /auth/logout-all — revoke all sessions across all devices. 204. */
export async function logoutAll(): Promise<void> {
  return api.post<void>("/auth/logout-all");
}

export interface SwitchOrgResponse {
  accessToken: string;
}

/** POST /auth/switch-organization — switch active organization context. */
export async function switchOrganization(
  organizationId: string,
): Promise<SwitchOrgResponse> {
  return api.post<SwitchOrgResponse>(
    "/auth/switch-organization",
    { organizationId },
    { envelope: true },
  );
}

/** GET /users/me — current user profile (JWT). */
export async function fetchMe(): Promise<User> {
  return api.get<User>("/users/me");
}

export type { AuthUser };

