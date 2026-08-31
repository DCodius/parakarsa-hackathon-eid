# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

Hackathon project for **.id Vibe Coding 2026** by PANDI (pandi.id). The core platform is **e.id / IDChain** — a verifiable credentials (VC) system with Issuer, Holder, Verifier, OAuth SSO, KYC Gateway, and Template APIs. Docs at `Refs/id_Vibe_Coding_2026_TM.pdf` (Technical Meeting slide deck).

## Current state — pre-code scaffold

The repo is an empty scaffold. No source code, no package manifests, no build/lint/test tooling yet. Directory layout:

- `Deployment/` — deployment configs for Production, Sandbox, agent, api, app
- `Development/` — dev environment placeholders for agent, api, app
- `Documents/` — empty
- `Refs/` — reference materials (hackathon TM PDF)

No commands to document. When tooling is added, update this file.

## Notes

- `.gitignore` is a standard Node.js ignore file (intact).
- `.playwright-mcp/` is untracked — Playwright MCP browser-automation artifact from a prior session, not project code.
- No Cursor/Copilot/Codex/Gemini configs found.