// Cuts a release: creates an ANNOTATED git tag whose message is the matching
// CHANGELOG.md section, then pushes it — which triggers the Release workflow that
// publishes a GitHub Release with the same notes. So tag and release match.
//
// Usage: pnpm release v1.2.0   (or: pnpm release 1.2.0)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const input = (process.argv[2] ?? '').trim();
if (!/^v?\d+\.\d+\.\d+$/.test(input)) {
  console.error('Usage: pnpm release <version>   e.g. pnpm release v1.2.0');
  process.exit(1);
}
const tag = input.startsWith('v') ? input : `v${input}`;

const extractScript = fileURLToPath(new URL('./changelog-section.mjs', import.meta.url));
const notes = execFileSync('node', [extractScript, tag], { encoding: 'utf8' });

const dir = mkdtempSync(join(tmpdir(), 'release-'));
const notesFile = join(dir, 'NOTES.md');
writeFileSync(notesFile, notes);

try {
  execFileSync('git', ['tag', '-a', tag, '-F', notesFile], { stdio: 'inherit' });
  execFileSync('git', ['push', 'origin', tag], { stdio: 'inherit' });
  console.log(`\nReleased ${tag}. The Release workflow will publish the GitHub Release.`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
