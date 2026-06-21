import { BlockFactory, type Block, type BlockType } from '@email/core';
import { Injectable } from '@nestjs/common';

/**
 * A block catalog entry exposed to the frontend palette: metadata plus a fresh
 * set of default props.
 */
export interface BlockDefinitionResponse {
  /** The block kind. */
  type: BlockType;
  /** Display label. */
  label: string;
  /** Short description. */
  description: string;
  /** Lucide icon name. */
  icon: string;
  /** Default props used when the block is added. */
  defaultProps: Block['props'];
}

/**
 * Exposes the block catalog (sourced from `@email/core`) so the frontend and
 * backend stay in sync from a single definition.
 */
@Injectable()
export class BlocksService {
  /**
   * Lists every available block kind with metadata and default props.
   *
   * @returns The block catalog.
   */
  list(): BlockDefinitionResponse[] {
    return BlockFactory.catalog.map((definition) => ({
      type: definition.type,
      label: definition.label,
      description: definition.description,
      icon: definition.icon,
      defaultProps: definition.createDefaultProps(),
    }));
  }
}
