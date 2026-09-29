import { build } from 'esbuild';
await build({
  entryPoints: ['mcp/index.ts'], outfile: 'plugin/idea-wedge/server/index.mjs',
  bundle: true, platform: 'node', format: 'esm', target: 'node20',
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
});
