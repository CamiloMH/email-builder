import type { Block } from '../blocks/block.schema';
import type { TemplateDocument, TemplateVariable } from '../template/template.schema';

/** Matches a `{{key}}` merge-tag token (key = letters, digits, underscore). */
const TOKEN_PATTERN = /\{\{(\w+)\}\}/g;

/**
 * Replaces `{{key}}` tokens in a string with the matching value. Unknown tokens
 * are left untouched so the raw token survives (e.g. in the exported HTML).
 *
 * @param text - The text possibly containing tokens.
 * @param values - Map of variable key to replacement value.
 * @returns The substituted text.
 */
export function substituteTokens(text: string, values: Readonly<Record<string, string>>): string {
  return text.replace(TOKEN_PATTERN, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key]! : match,
  );
}

/**
 * Builds a key→value map from a template's variables using their sample values.
 *
 * @param variables - The template variables.
 * @returns A map of variable key to sample value.
 */
export function defaultSampleValues(
  variables: readonly TemplateVariable[] = [],
): Record<string, string> {
  return Object.fromEntries(variables.map((variable) => [variable.key, variable.sample]));
}

// Recursively substitutes tokens in every string within a value.
function deepSubstitute(value: unknown, values: Readonly<Record<string, string>>): unknown {
  if (typeof value === 'string') {
    return substituteTokens(value, values);
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepSubstitute(item, values));
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, deepSubstitute(item, values)]),
    );
  }
  return value;
}

/**
 * Returns a copy of `document` with merge-tag tokens substituted across all
 * block props. Used for realistic previews and test sends; the export path does
 * NOT call this, so exported templates keep their `{{tokens}}`.
 *
 * @param document - The template document.
 * @param values - Replacement values. Defaults to the variables' sample values.
 * @returns A personalized copy of the document (or the original when there is
 *   nothing to substitute).
 */
export function personalizeDocument(
  document: TemplateDocument,
  values?: Readonly<Record<string, string>>,
): TemplateDocument {
  const map = values ?? defaultSampleValues(document.variables);
  if (Object.keys(map).length === 0) {
    return document;
  }
  return {
    ...document,
    blocks: document.blocks.map(
      (block) => ({ ...block, props: deepSubstitute(block.props, map) }) as Block,
    ),
  };
}

/**
 * Collects the distinct token keys referenced anywhere in a document's block
 * text, in first-seen order. Useful to detect tokens with no matching variable.
 *
 * @param document - The template document.
 * @returns The distinct token keys used in the document.
 */
export function collectTokenKeys(document: TemplateDocument): string[] {
  const keys = new Set<string>();
  const visit = (value: unknown): void => {
    if (typeof value === 'string') {
      for (const match of value.matchAll(TOKEN_PATTERN)) {
        keys.add(match[1]!);
      }
    } else if (Array.isArray(value)) {
      value.forEach(visit);
    } else if (value !== null && typeof value === 'object') {
      Object.values(value).forEach(visit);
    }
  };
  document.blocks.forEach((block) => visit(block.props));
  return [...keys];
}
