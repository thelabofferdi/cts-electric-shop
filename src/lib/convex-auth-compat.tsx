import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiBaseUrl } from "@/lib/http";

const TOKEN_KEY = "cts_v2_access_token";

async function send(path: string, body?: unknown) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const detail = (await response.json().catch(() => null))?.detail;
    throw new Error(detail ?? `Erreur API (${response.status})`);
  }
  return response.status === 204 ? undefined : response.json();
}

export function ConvexAuthProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useAuthActions() {
  const queryClient = useQueryClient();
  const signIn = async (_provider: string, params: Record<string, any>) => {
    const flow = params.flow;
    if (flow === "reset") {
      await send("/api/v1/auth/password/reset/request", { email: params.email });
    } else if (flow === "reset-verification") {
      await send("/api/v1/auth/password/reset/confirm", {
        email: params.email,
        code: params.code,
        new_password: params.newPassword,
      });
      const result = await send("/api/v1/auth/sign-in", { email: params.email, password: params.newPassword });
      window.localStorage.setItem(TOKEN_KEY, result.access_token);
    } else {
      const result = await send("/api/v1/auth/sign-in", { email: params.email, password: params.password });
      window.localStorage.setItem(TOKEN_KEY, result.access_token);
    }
    await queryClient.invalidateQueries();
  };
  const signOut = async () => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) {
      await fetch(`${apiBaseUrl}/api/v1/auth/sign-out`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => undefined);
    }
    window.localStorage.removeItem(TOKEN_KEY);
    await queryClient.invalidateQueries();
  };
  return { signIn, signOut };
}
