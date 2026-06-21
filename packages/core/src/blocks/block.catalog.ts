import { Align } from '../common/color.schema';
import { generateId } from '../common/id';
import {
  BlockType,
  ButtonVariant,
  SocialPlatform,
  type Block,
  type BlockProps,
} from './block.schema';

/**
 * Static, UI-facing metadata plus a default-props factory for a block kind.
 * Drives the builder palette in the frontend and the `GET /blocks` endpoint in
 * the backend, keeping both in sync from a single definition.
 */
export interface BlockDefinition {
  /** The block kind. */
  type: BlockType;
  /** Human-readable label shown in the palette. */
  label: string;
  /** Short description of what the block does. */
  description: string;
  /** Lucide icon name used to represent the block in the UI. */
  icon: string;
  /** Builds a fresh, schema-valid set of default props for the block. */
  createDefaultProps: () => Block['props'];
}

/**
 * Strongly-typed input accepted by {@link defineBlock}: identical to
 * {@link BlockDefinition} but with `createDefaultProps` narrowed to the props of
 * the specific block kind `T`.
 *
 * @typeParam T - The block kind.
 */
interface BlockDefinitionInput<T extends BlockType> {
  type: T;
  label: string;
  description: string;
  icon: string;
  createDefaultProps: () => BlockProps<T>;
}

/**
 * Identity helper that pins the generic parameter from the `type` field, so each
 * catalog entry's `createDefaultProps` is type-checked against the props of its
 * own block kind while the stored value widens to {@link BlockDefinition}.
 *
 * @typeParam T - The block kind, inferred from `definition.type`.
 * @param definition - The strongly-typed block definition to register.
 * @returns The definition widened to {@link BlockDefinition}.
 */
const defineBlock = <T extends BlockType>(definition: BlockDefinitionInput<T>): BlockDefinition =>
  definition;

/**
 * The full catalog of block definitions, keyed by {@link BlockType}.
 */
export const BLOCK_CATALOG = {
  [BlockType.Header]: defineBlock({
    type: BlockType.Header,
    label: 'Header',
    description: 'Logo, title and subtitle at the top of the email.',
    icon: 'panel-top',
    createDefaultProps: () => ({
      title: 'Welcome to our newsletter',
      subtitle: 'The latest news, straight to your inbox.',
      align: Align.Center,
    }),
  }),
  [BlockType.Text]: defineBlock({
    type: BlockType.Text,
    label: 'Text',
    description: 'A paragraph of text.',
    icon: 'type',
    createDefaultProps: () => ({
      text: 'Write your message here. Tell your readers what is new and why it matters.',
      align: Align.Left,
      fontSize: 16,
    }),
  }),
  [BlockType.Image]: defineBlock({
    type: BlockType.Image,
    label: 'Image',
    description: 'A responsive image, optionally linking somewhere.',
    icon: 'image',
    createDefaultProps: () => ({
      src: 'https://placehold.co/600x240/png',
      alt: 'Placeholder image',
      widthPercent: 100,
    }),
  }),
  [BlockType.Button]: defineBlock({
    type: BlockType.Button,
    label: 'Button',
    description: 'A call-to-action button.',
    icon: 'mouse-pointer-click',
    createDefaultProps: () => ({
      label: 'Get started',
      href: 'https://example.com',
      align: Align.Center,
      variant: ButtonVariant.Filled,
      fullWidth: false,
    }),
  }),
  [BlockType.Card]: defineBlock({
    type: BlockType.Card,
    label: 'Card',
    description: 'A bordered card with a title, text and an optional button.',
    icon: 'square',
    createDefaultProps: () => ({
      title: 'Card title',
      text: 'Use cards to highlight a feature, offer or announcement.',
      buttonLabel: 'Learn more',
      buttonHref: 'https://example.com',
      backgroundColor: '#FFFFFF',
      align: Align.Left,
    }),
  }),
  [BlockType.Divider]: defineBlock({
    type: BlockType.Divider,
    label: 'Divider',
    description: 'A horizontal rule that separates sections.',
    icon: 'minus',
    createDefaultProps: () => ({}),
  }),
  [BlockType.Spacer]: defineBlock({
    type: BlockType.Spacer,
    label: 'Spacer',
    description: 'Vertical whitespace between blocks.',
    icon: 'move-vertical',
    createDefaultProps: () => ({
      height: 24,
    }),
  }),
  [BlockType.Columns]: defineBlock({
    type: BlockType.Columns,
    label: 'Columns',
    description: 'Two or three side-by-side text columns.',
    icon: 'columns-2',
    createDefaultProps: () => ({
      columns: [
        { id: generateId(), heading: 'First', text: 'Describe your first point.' },
        { id: generateId(), heading: 'Second', text: 'Describe your second point.' },
      ],
    }),
  }),
  [BlockType.Social]: defineBlock({
    type: BlockType.Social,
    label: 'Social',
    description: 'A row of links to your social networks.',
    icon: 'share-2',
    createDefaultProps: () => ({
      links: [
        { id: generateId(), platform: SocialPlatform.Twitter, url: 'https://twitter.com' },
        { id: generateId(), platform: SocialPlatform.Instagram, url: 'https://instagram.com' },
      ],
    }),
  }),
  [BlockType.Footer]: defineBlock({
    type: BlockType.Footer,
    label: 'Footer',
    description: 'Company information and an unsubscribe link.',
    icon: 'panel-bottom',
    createDefaultProps: () => ({
      companyName: 'Your Company, Inc.',
      address: '123 Main Street, Anytown',
      unsubscribeUrl: 'https://example.com/unsubscribe',
      text: 'You are receiving this email because you subscribed to our list.',
    }),
  }),
} satisfies Record<BlockType, BlockDefinition>;
