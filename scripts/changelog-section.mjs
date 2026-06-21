// Prints the CHANGELOG.md section for a given version, used both by the release
// helper (annotated tag message) and the CI release job (GitHub Release body),
// so the tag and the release always carry the same notes.
//
// Usage: node scripts/changelog-section.mjs v1.2.0
import { readFileSync } from 'node:fs';

const raw = (process.argv[2] ?? '').trim();
const version = raw.replace(/^v/, '');

const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
const lines = changelog.split(/\r?\n/);

const isHeading = (line) => /^##\s+\[/.test(line);

// Returns the body lines of the first section whose heading matches `predicate`.
function section(predicate) {
  const start = lines.findIndex((line) => isHeading(line) && predicate(line));
  if (start === -1) {
    return null;
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (isHeading(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end);
}

const body =
  section((heading) => heading.includes(`[${version}]`)) ??
  section((heading) => /\[(sin publicar|unreleased)\]/i.test(heading));

const text = (body ?? [])
  // Drop reference-link definitions like `[1.2.0]: https://…/compare/…`.
  .filter((line) => !/^\[[^\]]+\]:\s*https?:/i.test(line))
  .join('\n')
  .trim();

process.stdout.write(text.length > 0 ? `${text}\n` : `Release ${raw || version}\n`);
