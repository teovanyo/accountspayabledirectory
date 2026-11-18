<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` - verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Deployment (standing instruction)

Always deploy after making changes to this project. Do not stop at a local build.

1. Run `npm run lint` and `npm run build`.
2. Commit the change and push to `origin/main`.
3. Trigger the Coolify3 deploy with `ego-browser` (the API is behind Cloudflare Access):
   - Open `https://coolify3.stealthagents.us` in the existing ego-browser task space.
   - `page.fetch("/api/v1/deploy", { method: "POST", headers: { Authorization: "Bearer <coolify3 API token>", "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ uuid: "qkndf7svzcvibdjummzh05yh" }) })`
   - Coolify3 token is in `~/.config/stealthagents/ops-watchdog.env` (`COOLIFY_TOKENS` → `coolify3`). Never commit it.
4. Poll `GET /api/v1/deployments/<deployment_uuid>` until `status` is `finished`.
5. Verify `https://accountspayabledirectory.stealthagents.us` and at least one firm/city page return 200 with the new content.

## Infrastructure

- **Repo:** public `github.com/teovanyo/accountspayabledirectory` (branch `main`).
- **Coolify3:** project `Accounts Payable Directory` `3s8fpneilujs8y5aihb68ref`, app `accountspayabledirectory` `qkndf7svzcvibdjummzh05yh` (Dockerfile, port 3000, server `ze0a2o0lk98353ty6kw610q8`).
- **Live domain:** `https://accountspayabledirectory.stealthagents.us` (CNAME → Coolify-03 tunnel `3cef3dd6-5f46-4a9d-982e-b70ae97b3806.cfargotunnel.com`, tunnel ingress version 402).
- **Primary domain:** `accountspayabledirectory.com` is configured on the app and in the tunnel, but the domain is **not registered** (no NS/A record as of 2026-11-18). Register it, point NS at Cloudflare, and add apex + www CNAMEs to the same tunnel — no Coolify change needed.
- **Ads:** all Stealth Agents ad units link to `https://stealthagents.com/services/accounts-payable-assistant` with `utm_source=accountspayabledirectory`.

`data/content/` is generated content and must be committed for a GitHub-based deploy. `.env.local` and generation logs are gitignored.
