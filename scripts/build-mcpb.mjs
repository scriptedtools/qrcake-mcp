#!/usr/bin/env node
/**
 * Assembles the Claude Desktop extension (.mcpb):
 *   mcpb-build/
 *     manifest.json   (copied, version synced from package.json)
 *     icon.png
 *     server/index.cjs  (esbuild single-file bundle — no node_modules shipped)
 * then packs it into dist-mcpb/qrcake.mcpb.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const staging = join(root, 'mcpb-build');
const outDir = join(root, 'dist-mcpb');

rmSync(staging, { recursive: true, force: true });
mkdirSync(join(staging, 'server'), { recursive: true });
mkdirSync(outDir, { recursive: true });

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
manifest.version = pkg.version;
writeFileSync(join(staging, 'manifest.json'), JSON.stringify(manifest, null, 2));

cpSync(join(root, 'assets/icon.png'), join(staging, 'icon.png'));

execFileSync(
  'npx',
  [
    'esbuild',
    'src/index.ts',
    '--bundle',
    '--platform=node',
    '--format=cjs',
    '--target=node20',
    '--outfile=mcpb-build/server/index.cjs',
  ],
  { cwd: root, stdio: 'inherit' },
);

execFileSync('npx', ['mcpb', 'validate', 'mcpb-build/manifest.json'], { cwd: root, stdio: 'inherit' });
execFileSync('npx', ['mcpb', 'pack', 'mcpb-build', `dist-mcpb/qrcake-${pkg.version}.mcpb`], {
  cwd: root,
  stdio: 'inherit',
});
