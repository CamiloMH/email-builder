import { BlockFactory } from '@email/core';
import type { BlockDefinitionDto } from './types';

/**
 * Block catalog source. The catalog lives in `@email/core`, so the static app
 * reads it directly instead of calling a backend endpoint.
 */
export const blocksApi = {
  /** Lists every available block kind with metadata and default props. */
  list: (): Promise<BlockDefinitionDto[]> =>
    Promise.resolve(
      BlockFactory.catalog.map((definition) => ({
        type: definition.type,
        label: definition.label,
        description: definition.description,
        icon: definition.icon,
        defaultProps: definition.createDefaultProps(),
      })),
    ),
};
