<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` - verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Deployment (standing instruction)

Always deploy after making changes to this project. Do not stop at a local build.

1. Run `npm run lint` and `npm run build`.
2. Commit the change and push to `origin/main`:
   `GIT_SSH_COMMAND="ssh -i ~/.ssh/propertymanagementfirms_deploy -o IdentitiesOnly=yes" git push origin main`
3. Trigger the Coolify3 deploy with `ego-browser` (the API is behind Cloudflare Access):
   - Open `https://coolify3.stealthagents.us` in the existing ego-browser space.
   - `page.fetch("/api/v1/deploy", { method: "POST", headers: { Authorization: "Bearer <coolify3 API token>", "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ uuid: "u3r4tygx8frx8dpu45dzfzxt" }) })`
   - Coolify3 token is in `~/.config/stealthagents/ops-watchdog.env` (`COOLIFY_TOKENS` → `coolify3`). Never commit it.
4. Poll `GET /api/v1/deployments/<deployment_uuid>` until `status` is `finished`.
5. Verify `https://accountspayabledirectory.com` and at least one firm/city page return 200 with the new content.

`data/content/` is generated content and must be committed for a GitHub-based deploy. `.env.local` and generation logs are gitignored.
