# Idea Wedge MCP connection

The source is in `mcp/`; the distributable plugin is in `plugin/idea-wedge/`. It reuses `src/lib/scoring.ts` directly, so the frontend and server share score and verdict rules. No database migration or separate AI service is required.

## Build and verify

```sh
npm ci
npm run test:mcp
npm run build:plugin
npm run build
```

The plugin build type-checks the server and bundles its runtime dependencies into `plugin/idea-wedge/server/index.mjs`. Rebuild after changing the server or shared scoring. The generated bundle is ignored by Git. Package the folder only after building; exclude local credentials. Tests use a mocked repository, not production data.

## Configure and run from this checkout

Keep existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the ignored `.env.local`. Add `IDEA_WEDGE_ACCESS_TOKEN` privately using a valid Supabase user session; do not paste the token into chat or commit it. The server supports explicit `IDEA_WEDGE_SUPABASE_URL` and `IDEA_WEDGE_SUPABASE_ANON_KEY` overrides. Obtain the token through Supabase's `auth.getSession()` in your signed-in app's local development session, keeping it on your machine.

```sh
npm run mcp
```

This launches stdio, so it waits for an MCP client rather than displaying a webpage. For an MCP host, use `node` with arguments `--env-file=/absolute/path/to/idea-wedge-app/.env.local` and `/absolute/path/to/idea-wedge-app/plugin/idea-wedge/server/index.mjs`. Use absolute paths. The host can alternatively supply the three environment variables through its private server configuration. No credentials are present in the distributable.

See `plugin/idea-wedge/README.md` for tool behavior and authentication limitations. A live read requires a current user token. A live submission test should use an explicitly requested test idea, because it creates a shared database record.

## Tool contracts

- `create_idea`: required `request_id` (UUID), `idea_name`, `summary`, `buyer`, `problem`; optional playbook text fields in snake_case. Returns `created`, the saved `row` including ID, and confirmation. Retries are idempotent for an unchanged submission.
- `assess_saved_idea`: `idea` (UUID or exact name). Returns source record, timestamp, rubric and historical score. If names match multiple records, returns up to ten candidate IDs; choose by UUID.
- For a fresh assessment, call `assess_saved_idea` again with `expected_updated_at` and `ratings` containing `market`, `wedge`, `mvp`, `distribution`, `risk`. Each has `rating`, `rationale`, `evidence` (array of `{field, quote}`), and `next_step`. It returns `status: assessed`, the calculated score and verdict, with `saved: false`. Known ratings require an exact source quote. Quotes and rationales still need the host's semantic judgment.

## Hosting

This is a local connection built within the existing project. No cloud deployment or account installation has been performed. To support browser/mobile users, a subsequent hosted MCP deployment needs an OAuth connection that maps each user to a Supabase session; do not expose the local token configuration as a public shared credential.
