import { Body, Container, Head, Html } from '@react-email/components';
import type { Block, TemplateDocument, Theme } from '@email/core';
import { Fragment, type ReactElement } from 'react';
import { BlockStrategyFactory } from '../blocks/block-strategy.factory';
import { EMAIL_CONTAINER_CLASS, headStyleCss } from '../theme/head-style';
import { bodyStyle, containerStyle } from '../theme/theme-style';

/**
 * Builder (creational design pattern) that assembles the full react-email
 * document tree (`<Html><Head/><Body><Container>...</Container></Body></Html>`)
 * from a theme and an ordered list of blocks. Each block is rendered via the
 * {@link BlockStrategyFactory}.
 */
export class EmailDocumentBuilder {
  private readonly children: ReactElement[] = [];

  /**
   * Creates a builder bound to a theme.
   *
   * @param theme - The theme applied to the document and every block.
   */
  constructor(private readonly theme: Theme) {}

  /**
   * Appends a single rendered block to the document.
   *
   * @param block - The block to render and append.
   * @returns This builder, for chaining.
   */
  addBlock(block: Block): this {
    this.children.push(
      <Fragment key={block.id}>{BlockStrategyFactory.renderBlock(block, this.theme)}</Fragment>,
    );
    return this;
  }

  /**
   * Appends several blocks, preserving order.
   *
   * @param blocks - The blocks to render and append.
   * @returns This builder, for chaining.
   */
  addBlocks(blocks: readonly Block[]): this {
    for (const block of blocks) {
      this.addBlock(block);
    }
    return this;
  }

  /**
   * Builds the final react-email document element.
   *
   * @returns The assembled react-email element.
   */
  build(): ReactElement {
    const css = headStyleCss(this.theme);
    return (
      <Html>
        <Head>{css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}</Head>
        <Body style={bodyStyle(this.theme)}>
          <Container
            style={containerStyle(this.theme)}
            className={this.theme.darkMode ? EMAIL_CONTAINER_CLASS : undefined}
          >
            {this.children}
          </Container>
        </Body>
      </Html>
    );
  }

  /**
   * Convenience constructor that builds a document from a template.
   *
   * @param document - The template document to render.
   * @returns A builder pre-populated with the template's theme and blocks.
   */
  static fromDocument(document: TemplateDocument): EmailDocumentBuilder {
    return new EmailDocumentBuilder(document.theme).addBlocks(document.blocks);
  }
}
