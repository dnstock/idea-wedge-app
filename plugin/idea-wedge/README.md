# Idea Wedge plugin

This local MCP plugin exposes exactly two tools: `create_idea` and `assess_saved_idea`. It connects to the existing Supabase `idea_reviews` table using a signed-in user session and existing row-level access policies. It does not run a hosted endpoint and cannot run in ChatGPT web/mobile as packaged.

Requires Node 20.19+ and an MCP host that supports local stdio servers. Before launching the host, configure its server environment with:

- `IDEA_WEDGE_SUPABASE_URL`: your project's HTTPS URL.
- `IDEA_WEDGE_SUPABASE_ANON_KEY`: your public anon/publishable key.
- `IDEA_WEDGE_ACCESS_TOKEN`: an access token from your signed-in Idea Wedge Supabase session.

Never use a service-role/secret key, place credentials in the plugin archive, or paste a session token into chat. Sessions expire; update the token and restart the MCP process when needed. This initial version does not provide an OAuth connection or refresh tokens automatically. Each database operation first validates the user session with Supabase Auth, then uses that user's token for RLS.

Install using your host's local plugin flow, or configure a stdio server with command `node` and an argument containing the absolute path to `server/index.mjs`. Supply the environment above through the host's private environment configuration. The portable `mcp.json` uses `${PLUGIN_ROOT}` for hosts that support that substitution.

## Behavior

Create collects name, summary, buyer and problem; optional evidence and playbook fields are supported. The assistant generates a request UUID and reuses it for retries. New records start in backlog with unknown scores and no decision. Authenticated user identity is set by the server. Reusing the same UUID with changed data fails rather than overwriting an idea.

Assess first reads the exact name or UUID and returns saved content, saved ratings and rubric. The host assistant evaluates the five gates, then calls the same tool with its ratings and exact supporting quotes. The server checks quotes and record freshness and uses the app's scoring functions to return the score and verdict. It never writes the result. Saved evidence is not independently verified by this tool. An unknown gate scores zero under the existing algorithm; missing market, wedge or MVP evidence therefore yields Reject.

Access follows the app's existing shared-team policies: authenticated users currently share access to reviews. This plugin does not introduce organization or per-owner isolation.
