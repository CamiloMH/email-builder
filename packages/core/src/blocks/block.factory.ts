import { generateId } from '../common/id';
import { BLOCK_CATALOG, type BlockDefinition } from './block.catalog';
import { BLOCK_TYPE_VALUES, type Block, type BlockOfType, type BlockType } from './block.schema';

/**
 * Factory (creational design pattern) that produces fresh, schema-valid blocks
 * from a {@link BlockType}. The per-type defaults live in {@link BLOCK_CATALOG},
 * so adding a new block kind only requires extending the catalog.
 */
export const BlockFactory = {
  /**
   * The list of block kinds that can be created, in catalog order.
   *
   * @returns A readonly array of every supported {@link BlockType}.
   */
  get availableTypes(): readonly BlockType[] {
    return BLOCK_TYPE_VALUES;
  },

  /**
   * Returns the catalog definitions for every block kind (label, icon, etc.).
   *
   * @returns A readonly array of {@link BlockDefinition}.
   */
  get catalog(): readonly BlockDefinition[] {
    return this.availableTypes.map((type) => BLOCK_CATALOG[type]);
  },

  /**
   * Creates a new block of the given kind with a unique id and default props.
   *
   * @param type - The kind of block to create.
   * @returns A new, fully-populated block.
   */
  create<T extends BlockType>(type: T): BlockOfType<T> {
    const definition = BLOCK_CATALOG[type];
    // The catalog returns props typed as the union; narrowing back to the
    // specific block kind is safe because the entry is keyed by `type`.
    return {
      id: generateId(),
      type,
      props: definition.createDefaultProps(),
    } as unknown as BlockOfType<T>;
  },

  /**
   * Creates several blocks at once, preserving order.
   *
   * @param types - The kinds of block to create.
   * @returns The newly created blocks.
   */
  createMany(types: readonly BlockType[]): Block[] {
    return types.map((type) => this.create(type));
  },
};
