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
const AUTH_BOOTSTRAP_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  return new Promise<T>((resolve, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("Authentication bootstrap timed out")),
      milliseconds,
    );

    promise.then(resolve, reject).finally(() => clearTimeout(timeoutId));
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, signIn, clearSession } = useAuthStore();
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    let cancelled = false;

    const bootstrap = async () => {
      try {
        // 1. Access token in memory → fetch profile
        const initialToken = getAccessToken();
        if (initialToken) {
          try {
            const user = await withTimeout(
              fetchMe(),
              AUTH_BOOTSTRAP_TIMEOUT_MS,
            );
            if (!cancelled && getAccessToken() === initialToken) {
              signIn(user, initialToken);
              return;
            }
          } catch {
            if (getAccessToken() === initialToken) {
              setAccessToken(null);
            }
          }
        }

        // 2. No token → try the httpOnly refresh cookie
        const refreshed = await withTimeout(
          refreshSession(),
          AUTH_BOOTSTRAP_TIMEOUT_MS,
        );
        if (refreshed?.accessToken) {
          const refreshedToken = refreshed.accessToken;

          // Install the refreshed token before loading the user profile.
          if (!getAccessToken()) {
            setAccessToken(refreshedToken);
            try {
              const user = await withTimeout(
                fetchMe(),
                AUTH_BOOTSTRAP_TIMEOUT_MS,
              );
              if (!cancelled && getAccessToken() === refreshedToken) {
                signIn(user, refreshedToken);
                return;
              }
            } catch {
              if (getAccessToken() === refreshedToken) {
                setAccessToken(null);
              }
            }
          }
        }

        // Do not clear a session established while bootstrap was pending.
        if (!cancelled && !getAccessToken()) {
          clearSession();
          if (!PUBLIC_AUTH_ROUTES.some((route) => pathname?.startsWith(route))) {
            router.replace("/signin");
          }
        }
      } catch {
        if (!cancelled && !getAccessToken()) {
          clearSession();
          if (!PUBLIC_AUTH_ROUTES.some((route) => pathname?.startsWith(route))) {
            router.replace("/signin");
          }
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [signIn, clearSession, pathname, router]);

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
