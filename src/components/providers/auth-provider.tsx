"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  AUTH_EXPIRED_EVENT,
  getAccessToken,
  setAccessToken,
} from "@/lib/api/client";
import { fetchMe, refreshSession } from "@/lib/api/auth";

const PUBLIC_AUTH_ROUTES = ["/signin", "/otp-verify"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, signIn, clearSession } = useAuthStore();
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    (async () => {
      // 1. Access token in memory → fetch profile
      if (getAccessToken()) {
        try {
          const user = await fetchMe();
          signIn(user, getAccessToken() as string);
          return;
        } catch {
          setAccessToken(null);
        }
      }

      // 2. No token → try the httpOnly refresh cookie
      const refreshed = await refreshSession();
      if (refreshed?.accessToken) {
        try {
          const user = await fetchMe();
          signIn(user, refreshed.accessToken);
          return;
        } catch {
          // ignore — fall through to unauthenticated
        }
      }

      clearSession();
    })();
  }, [signIn, clearSession]);

  // Session died mid-request → kick to signin
  useEffect(() => {
    const onExpired = () => {
      clearSession();
      if (!PUBLIC_AUTH_ROUTES.some((r) => pathname?.startsWith(r))) {
        router.replace("/signin");
      }
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [clearSession, pathname, router]);

  // Redirect already-authenticated users away from auth pages
  useEffect(() => {
    if (status === "authenticated" && PUBLIC_AUTH_ROUTES.some((r) => pathname?.startsWith(r))) {
      router.replace("/");
    }
  }, [status, pathname, router]);

  return <>{children}</>;
}
