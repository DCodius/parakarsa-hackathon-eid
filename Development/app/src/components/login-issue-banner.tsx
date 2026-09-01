"use client";

import Link from "next/link";
import { useState } from "react";
import { describeLoginIssue } from "@/lib/login-issue";

/**
 * Banner kegagalan SSO di /profile (?error&code dari callback). Nada amber
 * editorial seperti Simulation Mode notice di panel QR — bukan error dump.
 */
export function LoginIssueBanner({ code, error }: { code: string | null; error: string | null }) {
  const issue = describeLoginIssue(code, error);
  const [dismissed, setDismissed] = useState(false);
  if (!issue || dismissed) return null;

  return (
    <div role="alert" className="mt-6 flex items-start gap-4 rounded-xl bg-badge-amber px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-accent">{issue.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{issue.body}</p>
        {issue.action && (
          <Link
            href={issue.action.href}
            className="mt-2.5 inline-block rounded text-xs font-medium text-accent underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          >
            {issue.action.label}
          </Link>
        )}
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Tutup pemberitahuan"
        className="rounded-md p-1 text-accent transition hover:bg-accent-50 focus-visible:outline-2 focus-visible:outline-accent"
      >
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
          <path
            d="m4 4 8 8m0-8-8 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
