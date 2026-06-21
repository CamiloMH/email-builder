import {
  Columns2,
  Image,
  Minus,
  MousePointerClick,
  MoveVertical,
  PanelBottom,
  PanelTop,
  Share2,
  Square,
  Type,
  type LucideIcon,
} from 'lucide-react';

/** Maps a block catalog icon name to its Lucide component. */
const BLOCK_ICONS: Record<string, LucideIcon> = {
  'panel-top': PanelTop,
  type: Type,
  image: Image,
  'mouse-pointer-click': MousePointerClick,
  minus: Minus,
  'move-vertical': MoveVertical,
  'columns-2': Columns2,
  'share-2': Share2,
  'panel-bottom': PanelBottom,
};

/**
 * Resolves a block icon name to a Lucide icon component, falling back to a
 * generic square.
 *
 * @param name - The icon name from the block catalog.
 * @returns The matching Lucide icon component.
 */
export function blockIcon(name: string): LucideIcon {
  return BLOCK_ICONS[name] ?? Square;
}
