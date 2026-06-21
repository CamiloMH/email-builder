// Cuts a release: creates an ANNOTATED git tag whose message is the matching
// CHANGELOG.md section, then pushes it — which triggers the Release workflow that
// publishes a GitHub Release with the same notes. So tag and release match.
//
// Usage:
//   pnpm release v1.2.0            create and push the tag
//   pnpm release v1.2.0 --force    overwrite an existing tag (re-cut a release)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const force = args.includes('--force') || args.includes('-f');
const input = (args.find((arg) => /^v?\d+\.\d+\.\d+$/.test(arg)) ?? '').trim();
if (!input) {
  console.error('Usage: pnpm release <version> [--force]   e.g. pnpm release v1.2.0');
  process.exit(1);
}
const tag = input.startsWith('v') ? input : `v${input}`;

// Whether the tag already exists locally.
let exists = false;
try {
  execFileSync('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], { stdio: 'ignore' });
  exists = true;
} catch {
  exists = false;
}
if (exists && !force) {
  console.error(`Tag ${tag} already exists. Re-run with --force to overwrite it:\n  pnpm release ${tag} --force`);
  process.exit(1);
}

const extractScript = fileURLToPath(new URL('./changelog-section.mjs', import.meta.url));
const notes = execFileSync('node', [extractScript, tag], { encoding: 'utf8' });

const dir = mkdtempSync(join(tmpdir(), 'release-'));
const notesFile = join(dir, 'NOTES.md');
writeFileSync(notesFile, notes);

try {
  execFileSync('git', ['tag', ...(force ? ['-f'] : []), '-a', tag, '-F', notesFile], {
    stdio: 'inherit',
  });
  execFileSync('git', ['push', ...(force ? ['--force'] : []), 'origin', tag], { stdio: 'inherit' });
  console.log(
    `\nReleased ${tag}${force ? ' (forced)' : ''}. The Release workflow will publish the GitHub Release.`,
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
