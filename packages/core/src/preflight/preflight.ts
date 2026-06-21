import { BlockType, type Block } from '../blocks/block.schema';
import { collectTokenKeys } from '../personalization/personalize';
import type { TemplateDocument } from '../template/template.schema';

/** Severity of a preflight issue. */
export const PreflightSeverity = {
  Error: 'error',
  Warning: 'warning',
} as const;

/** A preflight issue severity. */
export type PreflightSeverity = (typeof PreflightSeverity)[keyof typeof PreflightSeverity];

/** Stable codes for each preflight check (the UI maps them to localized text). */
export const PreflightCode = {
  ImageMissingAlt: 'imageMissingAlt',
  NoUnsubscribeLink: 'noUnsubscribeLink',
  TooManyLinks: 'tooManyLinks',
  SpamWords: 'spamWords',
  ShoutingText: 'shoutingText',
  ThinTextContent: 'thinTextContent',
  UndefinedVariables: 'undefinedVariables',
} as const;

/** A preflight check code. */
export type PreflightCode = (typeof PreflightCode)[keyof typeof PreflightCode];

/** A single problem found while analyzing a template. */
export interface PreflightIssue {
  /** The check that produced the issue. */
  code: PreflightCode;
  /** How serious the issue is. */
  severity: PreflightSeverity;
  /** The id of the offending block, when the issue is block-specific. */
  blockId?: string;
}

/** The result of analyzing a template before export. */
export interface PreflightReport {
  /** Overall score from 0 (poor) to 100 (clean). */
  score: number;
  /** Every issue found, most-to-least severe order not guaranteed. */
  issues: PreflightIssue[];
}

/** Maximum number of links before warning about link-heavy emails. */
const MAX_LINKS = 15;
/** Minimum combined visible-text length before warning about thin content. */
const MIN_TEXT_LENGTH = 40;
/** Score penalty per issue, by severity. */
const PENALTY: Record<PreflightSeverity, number> = {
  [PreflightSeverity.Error]: 15,
  [PreflightSeverity.Warning]: 8,
};
/** Lowercased substrings commonly associated with spam filters. */
const SPAM_WORDS: readonly string[] = [
  'free',
  'gratis',
  '100%',
  'winner',
  'ganador',
  'click here',
  'haz clic aquí',
  'urgent',
  'urgente',
  '$$$',
  'act now',
  'oferta limitada',
];

// Returns the visible text fragments of a block (excludes URLs/colors).
function blockText(block: Block): string[] {
  switch (block.type) {
    case BlockType.Header:
      return [block.props.title, block.props.subtitle ?? ''];
    case BlockType.Text:
      return [block.props.text];
    case BlockType.Button:
      return [block.props.label];
    case BlockType.Card:
      return [block.props.title, block.props.text, block.props.buttonLabel ?? ''];
    case BlockType.Footer:
      return [block.props.companyName, block.props.address ?? '', block.props.text ?? ''];
    case BlockType.Columns:
      return block.props.columns.flatMap((column) => [column.heading ?? '', column.text]);
    default:
      return [];
  }
}

// Counts clickable links across the document.
function countLinks(blocks: readonly Block[]): number {
  let count = 0;
  for (const block of blocks) {
    if (block.type === BlockType.Button) count += 1;
    if (block.type === BlockType.Image && block.props.href) count += 1;
    if (block.type === BlockType.Card && block.props.buttonHref) count += 1;
    if (block.type === BlockType.Social) count += block.props.links.length;
    if (block.type === BlockType.Footer && block.props.unsubscribeUrl) count += 1;
  }
  return count;
}

// Detects shouting: long all-caps runs or excessive exclamation marks.
function isShouting(text: string): boolean {
  if (/!{3,}/.test(text)) {
    return true;
  }
  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, '');
  if (letters.length < 12) {
    return false;
  }
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, '');
  return upper.length / letters.length > 0.7;
}

/**
 * Analyzes a template for deliverability and accessibility issues before export,
 * returning a 0–100 score and a list of issues. Pure and heuristic — no network
 * or external service. The UI localizes each issue by its {@link PreflightCode}.
 *
 * @param document - The template document to analyze.
 * @returns The preflight report.
 */
export function analyzeTemplate(document: TemplateDocument): PreflightReport {
  const issues: PreflightIssue[] = [];
  const add = (code: PreflightCode, severity: PreflightSeverity, blockId?: string): void => {
    issues.push(blockId ? { code, severity, blockId } : { code, severity });
  };

  // Per-block checks point at the offending block so the UI can locate it.
  for (const block of document.blocks) {
    if (block.type === BlockType.Image && block.props.alt.trim().length === 0) {
      add(PreflightCode.ImageMissingAlt, PreflightSeverity.Error, block.id);
    }
    const texts = blockText(block);
    if (SPAM_WORDS.some((word) => texts.join(' ').toLowerCase().includes(word))) {
      add(PreflightCode.SpamWords, PreflightSeverity.Warning, block.id);
    }
    if (texts.some(isShouting)) {
      add(PreflightCode.ShoutingText, PreflightSeverity.Warning, block.id);
    }
  }

  // Document-level checks.
  const hasUnsubscribe = document.blocks.some(
    (block) => block.type === BlockType.Footer && Boolean(block.props.unsubscribeUrl),
  );
  if (!hasUnsubscribe) {
    add(PreflightCode.NoUnsubscribeLink, PreflightSeverity.Warning);
  }
  if (countLinks(document.blocks) > MAX_LINKS) {
    add(PreflightCode.TooManyLinks, PreflightSeverity.Warning);
  }
  if (document.blocks.flatMap(blockText).join('').trim().length < MIN_TEXT_LENGTH) {
    add(PreflightCode.ThinTextContent, PreflightSeverity.Warning);
  }

  const declared = new Set((document.variables ?? []).map((variable) => variable.key));
  if (collectTokenKeys(document).some((key) => !declared.has(key))) {
    add(PreflightCode.UndefinedVariables, PreflightSeverity.Warning);
  }

  const penalty = issues.reduce((total, issue) => total + PENALTY[issue.severity], 0);
  return { score: Math.max(0, 100 - penalty), issues };
}
