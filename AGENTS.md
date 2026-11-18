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
5. Verify `https://accountspayabledirectory.com` and at least one firm/city page return 200 with the new content.

## Infrastructure

- **Repo:** public `github.com/teovanyo/accountspayabledirectory` (branch `main`).
- **Coolify3:** project `Accounts Payable Directory` `3s8fpneilujs8y5aihb68ref`, app `accountspayabledirectory` `qkndf7svzcvibdjummzh05yh` (Dockerfile, port 3000, server `ze0a2o0lk98353ty6kw610q8`).
- **Live domain:** `https://accountspayabledirectory.com` (+ www). Cloudflare zone `97a3f1dea416d32136670bcff5347819`, NS `khalid.ns.cloudflare.com` / `sunny.ns.cloudflare.com` (registered at Name.com). Apex + www CNAME → Coolify-03 tunnel `3cef3dd6-5f46-4a9d-982e-b70ae97b3806.cfargotunnel.com` (proxied); tunnel ingress version 403. Zone activated 2026-11-18 20:14 UTC.
- **Removed:** the temporary `accountspayabledirectory.stealthagents.us` domain, its DNS record, and its tunnel ingress rule were deleted after the `.com` cutover.
- **Ads:** all Stealth Agents ad units link to `https://stealthagents.com/services/accounts-payable-assistant` with `utm_source=accountspayabledirectory`.

`data/content/` is generated content and must be committed for a GitHub-based deploy. `.env.local` and generation logs are gitignored.
