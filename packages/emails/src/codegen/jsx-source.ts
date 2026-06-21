import type { CSSProperties } from 'react';

/**
 * Minimal JSX abstract syntax tree used by the React-source code generator.
 * Modelling the tree (rather than concatenating strings ad-hoc) keeps
 * indentation, attribute formatting and import collection consistent and
 * testable.
 */
export interface JsxElement {
  /** The component tag (always a react-email component, e.g. `Section`). */
  tag: string;
  /**
   * Attributes other than `style`. String values are emitted as quoted JSX
   * attributes, numbers as `{n}` expressions, `true` as a bare attribute, and
   * `undefined`/`false` are omitted.
   */
  attrs?: Record<string, string | number | boolean | undefined>;
  /** Inline style, emitted as a `style={{ ... }}` attribute. */
  style?: CSSProperties;
  /** Child nodes (elements or text). */
  children?: JsxChild[];
}

/** A text child rendered as a `{"..."}` expression (escaping-safe). */
export interface JsxText {
  /** The text content. */
  text: string;
}

/** A raw child inserted verbatim (e.g. the `&nbsp;` HTML entity). */
export interface JsxRaw {
  /** The raw JSX source. */
  raw: string;
}

/** Any child node accepted by {@link JsxElement.children}. */
export type JsxChild = JsxElement | JsxText | JsxRaw;

/**
 * Creates a {@link JsxElement}. Convenience constructor for the block source
 * generators.
 *
 * @param tag - The component tag.
 * @param options - Optional attributes, style and children.
 * @param options.attrs - Non-style attributes.
 * @param options.style - Inline style.
 * @param options.children - Child nodes.
 * @returns The JSX element node.
 */
export function el(
  tag: string,
  options: { attrs?: JsxElement['attrs']; style?: CSSProperties; children?: JsxChild[] } = {},
): JsxElement {
  return { tag, ...options };
}

/**
 * Creates a text child rendered as a `{"..."}` expression.
 *
 * @param text - The text content.
 * @returns The text child node.
 */
export function txt(text: string): JsxText {
  return { text };
}

/**
 * Creates a raw child inserted verbatim into the JSX.
 *
 * @param raw - The raw JSX source.
 * @returns The raw child node.
 */
export function raw(raw: string): JsxRaw {
  return { raw };
}

const INDENT = '  ';

/**
 * Type guard for element children.
 *
 * @param child - The child node.
 * @returns Whether the child is an element.
 */
function isElement(child: JsxChild): child is JsxElement {
  return (child as JsxElement).tag !== undefined;
}

/**
 * Type guard for text children.
 *
 * @param child - The child node.
 * @returns Whether the child is text.
 */
function isText(child: JsxChild): child is JsxText {
  return (child as JsxText).text !== undefined;
}

/**
 * Serializes a single style value to JS source: numbers/booleans verbatim,
 * strings single-quoted with escaping.
 *
 * @param value - The style value.
 * @returns The serialized source.
 */
function serializeStyleValue(value: unknown): string {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/**
 * Serializes a style object to a JS object literal, skipping `undefined`
 * properties.
 *
 * @param style - The CSS properties to serialize.
 * @returns A JS object-literal source string (e.g. `{ color: '#fff', margin: 0 }`).
 */
export function serializeStyle(style: CSSProperties): string {
  const entries = Object.entries(style).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return '{}';
  }
  const parts = entries.map(([key, value]) => `${key}: ${serializeStyleValue(value)}`);
  return `{ ${parts.join(', ')} }`;
}

/**
 * Builds the source for a single non-style attribute, or `null` to skip it.
 *
 * @param key - The attribute name.
 * @param value - The attribute value.
 * @returns The attribute source, or `null` to omit it.
 */
function serializeAttr(key: string, value: string | number | boolean): string | null {
  if (typeof value === 'boolean') {
    return value ? key : null;
  }
  if (typeof value === 'number') {
    return `${key}={${value}}`;
  }
  return `${key}=${JSON.stringify(value)}`;
}

/**
 * Joins an element's attributes (including `style`) into a source fragment.
 *
 * @param node - The element whose attributes to serialize.
 * @returns The leading attribute source (with a leading space), or empty.
 */
function attributeSource(node: JsxElement): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(node.attrs ?? {})) {
    if (value === undefined) {
      continue;
    }
    const attr = serializeAttr(key, value);
    if (attr !== null) {
      parts.push(attr);
    }
  }
  if (node.style) {
    parts.push(`style={${serializeStyle(node.style)}}`);
  }
  return parts.length > 0 ? ` ${parts.join(' ')}` : '';
}

/**
 * Serializes a leaf (text/raw) child to its inline source.
 *
 * @param child - The text or raw child.
 * @returns The inline JSX source.
 */
function inlineChild(child: JsxText | JsxRaw): string {
  return isText(child) ? `{${JSON.stringify(child.text)}}` : child.raw;
}

/**
 * Serializes a {@link JsxElement} tree into formatted JSX source.
 *
 * @param node - The element to serialize.
 * @param level - The current indentation depth (in 2-space units).
 * @returns The JSX source string.
 */
export function serializeElement(node: JsxElement, level = 0): string {
  const pad = INDENT.repeat(level);
  const open = `<${node.tag}${attributeSource(node)}`;
  const children = node.children ?? [];

  const [first] = children;
  if (children.length === 0 || !first) {
    return `${pad}${open} />`;
  }

  if (children.length === 1 && !isElement(first)) {
    return `${pad}${open}>${inlineChild(first)}</${node.tag}>`;
  }

  const inner = children.map((child) =>
    isElement(child)
      ? serializeElement(child, level + 1)
      : `${INDENT.repeat(level + 1)}${inlineChild(child)}`,
  );
  return [`${pad}${open}>`, ...inner, `${pad}</${node.tag}>`].join('\n');
}

/**
 * Collects every component tag used in a tree, for building the import line.
 *
 * @param node - The root element.
 * @param into - The set accumulating tag names.
 * @returns The same set, for chaining.
 */
export function collectTags(node: JsxElement, into: Set<string> = new Set()): Set<string> {
  into.add(node.tag);
  for (const child of node.children ?? []) {
    if (isElement(child)) {
      collectTags(child, into);
    }
  }
  return into;
}
