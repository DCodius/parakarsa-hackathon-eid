import "server-only";
import { cookies } from "next/headers";

/** Mirrors the profile shape the e.id gateway returns for scope=email:profile. */
export type EidProfile = {
  email?: string;
  profile?: {
    address?: string;
    avatar?: string;
    countryphonecode?: string;
    fullname?: string;
    phonenumber?: string;
    /** 0 unverified · 1 basic (email+phone) · 2 moderate (+ formal ID). */
    tier?: number;
  };
};

/** Base URL of the NestJS backend, which owns every e.id credential. */
export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const loginHref = `${apiUrl}/api/v1/auth/login`;
export const logoutHref = `${apiUrl}/api/v1/auth/logout`;

/**
 * The session cookie is set by the backend on the shared host, so the browser
 * sends it to us too — we forward it on rather than holding a second copy.
 */
export async function getSession(): Promise<EidProfile | null> {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return null;

  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;

    const body = (await response.json()) as {
      authenticated?: boolean;
      profile?: EidProfile | null;
    };
    return body.authenticated ? (body.profile ?? null) : null;
  } catch {
    // Backend down or slow: render as signed out rather than failing the page.
    return null;
  }
}
