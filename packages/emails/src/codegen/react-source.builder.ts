import type { TemplateDocument } from '@email/core';
import { EMAIL_CONTAINER_CLASS, headStyleCss } from '../theme/head-style';
import { bodyStyle, containerStyle } from '../theme/theme-style';
import { blockToJsx } from './block-source';
import { collectTags, el, raw, serializeElement, type JsxElement } from './jsx-source';

/** Components always present in the generated document shell. */
const SHELL_TAGS = ['Html', 'Head', 'Body', 'Container'] as const;

/**
 * Derives a valid PascalCase React component identifier from a template name,
 * falling back to `EmailTemplate` and prefixing names that start with a digit.
 *
 * @param name - The template name.
 * @returns A safe component identifier.
 */
export function toComponentName(name: string): string {
  const pascal = name
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  if (!pascal) {
    return 'EmailTemplate';
  }
  return /^[0-9]/.test(pascal) ? `Email${pascal}` : pascal;
}

/**
 * Builder (creational design pattern) that assembles a standalone react-email
 * component source file (`.tsx`) from a {@link TemplateDocument}: the same
 * `<Html><Head/><Body><Container>…</Container></Body></Html>` shell as the
 * renderer, an auto-generated import line and the component wrapper. The output
 * is a faithful, editable react-email component the user can drop into their own
 * project.
 */
export class ReactSourceBuilder {
  /**
   * @param document - The template document to turn into source.
   */
  constructor(private readonly document: TemplateDocument) {}

  /**
   * Builds the full document element tree (shell + blocks).
   *
   * @returns The root `<Html>` element tree.
   */
  private buildTree(): JsxElement {
    const { theme, blocks } = this.document;
    const css = headStyleCss(theme);
    const head = el('Head', {
      children: css ? [el('style', { children: [raw(`{\`${css}\`}`)] })] : [],
    });
    const container = el('Container', {
      attrs: theme.darkMode ? { className: EMAIL_CONTAINER_CLASS } : undefined,
      style: containerStyle(theme),
      children: blocks.map((block) => blockToJsx(block, theme)),
    });
    return el('Html', {
      children: [head, el('Body', { style: bodyStyle(theme), children: [container] })],
    });
  }

  /**
   * Builds the `.tsx` source for the template.
   *
   * @returns The generated react-email component source.
   */
  build(): string {
    const tree = this.buildTree();
    const tags = collectTags(tree, new Set<string>(SHELL_TAGS));
    // Only capitalized tags are react-email components; native tags like
    // `style` are valid JSX without an import.
    const components = [...tags].filter((tag) => /^[A-Z]/.test(tag)).sort();
    const importLine = `import { ${components.join(', ')} } from '@react-email/components';`;
    const name = toComponentName(this.document.name);
    const title = this.document.name.replace(/\*\//g, '* /');

    return [
      importLine,
      '',
      '/**',
      ` * "${title}" — standalone react-email component generated with Email Builder.`,
      ' */',
      `export const ${name} = () => (`,
      serializeElement(tree, 1),
      ');',
      '',
      `export default ${name};`,
      '',
    ].join('\n');
  }
}

/**
 * Generates a standalone react-email component (`.tsx` source) from a template
 * document. Shared entry point used by the backend export endpoint.
 *
 * @param document - The template document to export.
 * @returns The react-email component source code.
 */
export function renderTemplateToReactSource(document: TemplateDocument): string {
  return new ReactSourceBuilder(document).build();
}
