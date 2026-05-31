# Optional x402 Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional Cloudflare Worker x402 gateway while preserving Polyglow's default static build.

**Architecture:** Keep Astro output static. Add a Worker adapter that binds `ASSETS`, gates configured routes for bots with `x402-hono`, and falls back to static assets for ordinary requests.

**Tech Stack:** Astro 6 static output, Cloudflare Workers Static Assets, Hono, x402-hono, pnpm scripts.

---

### Task 1: Add Gateway Dependencies and Config Surface

**Files:**
- Modify: `package.json`
- Modify: `wrangler.jsonc`
- Modify: `.env.example`

- [ ] Add `hono` and `x402-hono` as dependencies.
- [ ] Add a Worker entry, asset binding, runtime vars, and `nodejs_compat` compatibility flag to `wrangler.jsonc`.
- [ ] Document runtime variables in `.env.example` without real wallet values.
- [ ] Run `pnpm install` and confirm `pnpm-lock.yaml` updates.

### Task 2: Write Gateway Verification Before Implementation

**Files:**
- Create: `scripts/verify-x402-gateway.mjs`
- Modify: `package.json`

- [ ] Add `verify:x402` script.
- [ ] Verify `wrangler.jsonc` has `main`, `assets.binding`, `run_worker_first`, `nodejs_compat`, and runtime vars.
- [ ] Verify `src/x402/cloudflare-worker.ts` contains x402 middleware, static asset fallback, bot-only logic, and `/api` probes.
- [ ] Run `pnpm verify:x402` and confirm it fails before Worker implementation.

### Task 3: Implement Cloudflare Worker Adapter

**Files:**
- Create: `src/x402/cloudflare-worker.ts`

- [ ] Define an `Env` type for `ASSETS` and runtime vars.
- [ ] Parse config with safe defaults.
- [ ] Detect protected route prefixes.
- [ ] Detect bot traffic using `request.cf.botManagement.score` when present and user-agent fallback otherwise.
- [ ] Use `x402-hono` payment middleware on `/api`, `/api/v1`, and protected routes when enabled.
- [ ] Serve static assets through `env.ASSETS.fetch(request)` after payment or when not gated.

### Task 4: Validate Build and Static Compatibility

**Files:**
- No new source files.

- [ ] Run `pnpm verify:x402`.
- [ ] Run `pnpm verify:agent`.
- [ ] Run `pnpm build`.
- [ ] Confirm `dist` remains a usable static site.

### Task 5: Document Deployment Impact

**Files:**
- Modify: `README.md`
- Modify: `readme-zh.md`
- Modify: `AGENTS.md`

- [ ] Document that ordinary static hosting still works.
- [ ] Document that real x402 enforcement requires runtime adapter support.
- [ ] Document Cloudflare runtime variables and Solana example values.
- [ ] Document that wallet addresses must not be committed.
