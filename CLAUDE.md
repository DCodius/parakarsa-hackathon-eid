# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

Hackathon project for **.id Vibe Coding 2026** by PANDI (pandi.id). The core platform is **e.id / IDChain** — a verifiable credentials (VC) system. The repo implements the verifier flow: a Holder proves their credential via QR login, the callback mints a ParaKarsa account + session, and the portfolio/consent views read from it. Docs at `Refs/id_Vibe_Coding_2026_TM.pdf`.

## Layout

- `Development/api` — NestJS API (port 4000). SQLite via the Node built-in `node:sqlite`; verification accounts/sessions, consent chain, and envelope-encrypted PII live here.
- `Development/app` — Next.js web (port 3000). Client for the QR login, DNA portfolio, and consent/report views.
- `Deployment/` — nginx + systemd configs and `deploy.sh` for the VPS. Full walkthrough in `Deployment/README.md`.
- `Refs/` — reference materials (hackathon TM PDF). `Documents/` — project notes.

## Commands

Backend (`Development/api`):
- `npm run build` — `nest build`
- `npm run lint` — `oxlint src/ test/` (must stay clean)
- `npm run test:e2e` — vitest e2e suite
- `npm test` — vitest (unit + e2e)
- `npm run start:dev` — watch mode dev server

Frontend (`Development/app`):
- `npm run build` — `next build`
- `npm test` — `node --test "tests/*.test.ts"`
- `npm run dev` — dev server

Deploy: `Deployment/deploy.sh` (bash). Syntax-check with `bash -n`.

## Operational constraints

- **Node >= 22 is required** — the API uses the built-in `node:sqlite` module, absent in older versions.
- **`NIK_PEPPER` must never change once accounts exist** — it salts the NIK hash; rotating it makes every legacy account unrecognizable. In production it must be set to a non-empty string of at least 32 chars; the API refuses to boot otherwise.
- **`PARAKARSA_MASTER_KEY` is required in production** — envelope encryption key. The API refuses to boot without it. Generate with `openssl rand -base64 32`.
- **`EID_VERIFIER_CALLBACK_SECRET` becomes required when verifier credentials are filled** (live verifier mode) — without it the callback can be forged to mint accounts; the API refuses to boot in production.
- `.env` files (`Development/api/.env`, `Development/app/.env.local`, `.env.production`) and `Development/api/data/` are gitignored and survive deploys — never commit or modify them.
- Deployment guide: `Deployment/README.md`.
