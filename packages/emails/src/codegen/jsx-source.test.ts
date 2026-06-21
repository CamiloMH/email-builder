import { describe, expect, it } from 'vitest';
import { collectTags, el, raw, serializeElement, serializeStyle, txt } from './jsx-source';

describe('serializeStyle', () => {
  it('serializes numbers, strings and booleans and skips undefined', () => {
    expect(serializeStyle({ margin: 0, color: '#fff', display: 'block' })).toBe(
      "{ margin: 0, color: '#fff', display: 'block' }",
    );
    expect(serializeStyle({ width: undefined, height: 'auto' })).toBe("{ height: 'auto' }");
  });

  it('returns an empty object literal when there is nothing to emit', () => {
    expect(serializeStyle({})).toBe('{}');
    expect(serializeStyle({ width: undefined })).toBe('{}');
  });

  it('escapes single quotes and backslashes in string values', () => {
    expect(serializeStyle({ fontFamily: "a'b\\c" })).toBe("{ fontFamily: 'a\\'b\\\\c' }");
  });
});

describe('serializeElement', () => {
  it('self-closes elements without children', () => {
    expect(serializeElement(el('Hr', { style: { margin: 0 } }))).toBe('<Hr style={{ margin: 0 }} />');
  });

  it('renders string, number and boolean attributes', () => {
    const node = el('Img', { attrs: { src: 'https://x/y', height: 40, hidden: true, off: false } });
    expect(serializeElement(node)).toBe('<Img src="https://x/y" height={40} hidden />');
  });

  it('inlines a single text child as an expression', () => {
    expect(serializeElement(el('Text', { children: [txt('Hi "you"')] }))).toBe(
      '<Text>{"Hi \\"you\\""}</Text>',
    );
  });

  it('inlines a single raw child verbatim', () => {
    expect(serializeElement(el('Section', { children: [raw('&nbsp;')] }))).toBe(
      '<Section>&nbsp;</Section>',
    );
  });

  it('indents nested element children', () => {
    const tree = el('Section', {
      children: [el('Text', { children: [txt('a')] }), el('Hr')],
    });
    expect(serializeElement(tree)).toBe(
      ['<Section>', '  <Text>{"a"}</Text>', '  <Hr />', '</Section>'].join('\n'),
    );
  });
});

describe('collectTags', () => {
  it('gathers every component tag in the tree', () => {
    const tree = el('Html', {
      children: [el('Body', { children: [el('Section', { children: [el('Text')] })] })],
    });
    expect([...collectTags(tree)].sort()).toEqual(['Body', 'Html', 'Section', 'Text']);
  });
});
