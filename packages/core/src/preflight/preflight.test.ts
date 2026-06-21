import { describe, expect, it } from 'vitest';
import { Align } from '../common/color.schema';
import { BlockType } from '../blocks/block.schema';
import { createDefaultTemplate } from '../template/template.factory';
import { DEFAULT_THEME } from '../theme/theme.schema';
import type { TemplateDocument } from '../template/template.schema';
import { PreflightCode, PreflightSeverity, analyzeTemplate } from './preflight';

const codes = (document: TemplateDocument): PreflightCode[] =>
  analyzeTemplate(document).issues.map((issue) => issue.code);

describe('analyzeTemplate', () => {
  it('reports a clean default template (footer has an unsubscribe link)', () => {
    const report = analyzeTemplate(createDefaultTemplate());
    expect(report.issues).toEqual([]);
    expect(report.score).toBe(100);
  });

  it('warns when no footer carries an unsubscribe link', () => {
    const document: TemplateDocument = {
      name: 'No footer',
      theme: DEFAULT_THEME,
      blocks: [
        {
          id: 't1',
          type: BlockType.Text,
          props: { text: 'A perfectly normal newsletter body with enough content.', align: Align.Left, fontSize: 16 },
        },
      ],
    };
    expect(codes(document)).toContain(PreflightCode.NoUnsubscribeLink);
  });

  it('flags an image without alt text as an error', () => {
    const document: TemplateDocument = {
      name: 'Img',
      theme: DEFAULT_THEME,
      blocks: [
        {
          id: 'i1',
          type: BlockType.Image,
          props: { src: 'https://x/y.png', alt: '   ', widthPercent: 100 },
        },
      ],
    };
    const report = analyzeTemplate(document);
    const issue = report.issues.find((i) => i.code === PreflightCode.ImageMissingAlt);
    expect(issue?.severity).toBe(PreflightSeverity.Error);
    expect(issue?.blockId).toBe('i1');
  });

  it('detects spam words and shouting', () => {
    const document: TemplateDocument = {
      name: 'Spam',
      theme: DEFAULT_THEME,
      blocks: [
        {
          id: 't1',
          type: BlockType.Text,
          props: {
            text: 'CLICK HERE FOR FREE MONEY!!! ACT NOW BEFORE IT IS GONE FOREVER',
            align: Align.Left,
            fontSize: 16,
          },
        },
      ],
    };
    const found = codes(document);
    expect(found).toContain(PreflightCode.SpamWords);
    expect(found).toContain(PreflightCode.ShoutingText);
  });

  it('flags tokens that have no matching variable', () => {
    const document: TemplateDocument = {
      name: 'Tokens',
      theme: DEFAULT_THEME,
      blocks: [
        { id: 'h1', type: BlockType.Header, props: { title: 'Hi {{name}}', align: Align.Left } },
      ],
    };
    expect(codes(document)).toContain(PreflightCode.UndefinedVariables);
  });

  it('does not flag declared variables', () => {
    const document: TemplateDocument = {
      name: 'Tokens',
      theme: DEFAULT_THEME,
      variables: [{ key: 'name', label: 'Name', sample: 'Ada' }],
      blocks: [
        {
          id: 't1',
          type: BlockType.Text,
          props: { text: 'Hello {{name}}, welcome to our weekly newsletter.', align: Align.Left, fontSize: 16 },
        },
      ],
    };
    expect(codes(document)).not.toContain(PreflightCode.UndefinedVariables);
  });
});
