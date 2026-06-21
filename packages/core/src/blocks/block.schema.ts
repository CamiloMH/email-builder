import { z } from 'zod';
import { alignSchema, hexColorSchema } from '../common/color.schema';

/**
 * Enum-like `const` of every supported block kind. Single source of truth for
 * the discriminated union, the factory and the block catalog. Reference
 * `BlockType.Header` rather than the bare string `'header'`.
 */
export const BlockType = {
  Header: 'header',
  Text: 'text',
  Image: 'image',
  Button: 'button',
  Card: 'card',
  Divider: 'divider',
  Spacer: 'spacer',
  Columns: 'columns',
  Social: 'social',
  Footer: 'footer',
} as const;

/**
 * The kind of a block (`header`, `text`, `image`, ...).
 */
export type BlockType = (typeof BlockType)[keyof typeof BlockType];

/**
 * Zod schema validating a {@link BlockType} value.
 */
export const blockTypeSchema = z.nativeEnum(BlockType);

/**
 * All block kinds in declaration order. Use instead of magic-string arrays.
 */
export const BLOCK_TYPE_VALUES: readonly BlockType[] = Object.values(BlockType);

/**
 * Enum-like `const` of supported social network identifiers.
 */
export const SocialPlatform = {
  Twitter: 'twitter',
  Facebook: 'facebook',
  Instagram: 'instagram',
  LinkedIn: 'linkedin',
  YouTube: 'youtube',
  GitHub: 'github',
} as const;

/**
 * A social network identifier.
 */
export type SocialPlatform = (typeof SocialPlatform)[keyof typeof SocialPlatform];

/**
 * Zod schema validating a {@link SocialPlatform} value.
 */
export const socialPlatformSchema = z.nativeEnum(SocialPlatform);

/**
 * Enum-like `const` of button styles.
 */
export const ButtonVariant = {
  Filled: 'filled',
  Outline: 'outline',
} as const;

/**
 * A button style variant.
 */
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

/**
 * Zod schema validating a {@link ButtonVariant} value.
 */
export const buttonVariantSchema = z.nativeEnum(ButtonVariant);

const withId = <TType extends BlockType, TShape extends z.ZodRawShape>(
  type: TType,
  props: z.ZodObject<TShape>,
) =>
  z.object({
    id: z.string().min(1),
    type: z.literal(type),
    props,
  });

/** Header block: optional logo, title and subtitle. */
export const headerBlockSchema = withId(
  BlockType.Header,
  z.object({
    logoUrl: z.string().url().optional(),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    align: alignSchema,
    /** Logo alignment, independent of the title/subtitle alignment. */
    logoAlign: alignSchema.optional(),
    /** When true, the logo is shown inline with the title (logo + text). */
    logoInline: z.boolean().optional(),
    /** Optional background color for the header section. */
    backgroundColor: hexColorSchema.optional(),
  }),
);

/** Rich-ish paragraph of text. */
export const textBlockSchema = withId(
  BlockType.Text,
  z.object({
    text: z.string(),
    align: alignSchema,
    fontSize: z.number().int().min(8).max(72),
  }),
);

/** Standalone image, optionally linking somewhere. */
export const imageBlockSchema = withId(
  BlockType.Image,
  z.object({
    src: z.string().url(),
    alt: z.string(),
    href: z.string().url().optional(),
    widthPercent: z.number().int().min(10).max(100),
  }),
);

/** Call-to-action button. */
export const buttonBlockSchema = withId(
  BlockType.Button,
  z.object({
    label: z.string().min(1),
    href: z.string().url(),
    align: alignSchema,
    variant: buttonVariantSchema,
    fullWidth: z.boolean(),
  }),
);

/** Content card: a bordered, padded box with a heading, text and optional CTA. */
export const cardBlockSchema = withId(
  BlockType.Card,
  z.object({
    title: z.string().min(1),
    text: z.string(),
    imageUrl: z.string().url().optional(),
    buttonLabel: z.string().optional(),
    buttonHref: z.string().url().optional(),
    backgroundColor: hexColorSchema,
    align: alignSchema,
  }),
);

/** Horizontal rule. */
export const dividerBlockSchema = withId(BlockType.Divider, z.object({}));

/** Vertical whitespace of a configurable height in pixels. */
export const spacerBlockSchema = withId(
  BlockType.Spacer,
  z.object({
    height: z.number().int().min(4).max(160),
  }),
);

/** A single column inside a {@link columnsBlockSchema}. */
export const columnSchema = z.object({
  id: z.string().min(1),
  heading: z.string().optional(),
  text: z.string(),
});

/** Two or three side-by-side text columns. */
export const columnsBlockSchema = withId(
  BlockType.Columns,
  z.object({
    columns: z.array(columnSchema).min(2).max(3),
  }),
);

/** A single social link inside a {@link socialBlockSchema}. */
export const socialLinkSchema = z.object({
  id: z.string().min(1),
  platform: socialPlatformSchema,
  url: z.string().url(),
});

/** Row of social network icons/links. */
export const socialBlockSchema = withId(
  BlockType.Social,
  z.object({
    links: z.array(socialLinkSchema).min(1).max(6),
  }),
);

/** Footer with company info and an unsubscribe link. */
export const footerBlockSchema = withId(
  BlockType.Footer,
  z.object({
    companyName: z.string().min(1),
    address: z.string().optional(),
    unsubscribeUrl: z.string().url().optional(),
    text: z.string().optional(),
  }),
);

/**
 * Discriminated union of every block kind, keyed on `type`.
 */
export const blockSchema = z.discriminatedUnion('type', [
  headerBlockSchema,
  textBlockSchema,
  imageBlockSchema,
  buttonBlockSchema,
  cardBlockSchema,
  dividerBlockSchema,
  spacerBlockSchema,
  columnsBlockSchema,
  socialBlockSchema,
  footerBlockSchema,
]);

/** Any block in its persisted form. */
export type Block = z.infer<typeof blockSchema>;

/** A header block. */
export type HeaderBlock = z.infer<typeof headerBlockSchema>;
/** A text block. */
export type TextBlock = z.infer<typeof textBlockSchema>;
/** An image block. */
export type ImageBlock = z.infer<typeof imageBlockSchema>;
/** A button block. */
export type ButtonBlock = z.infer<typeof buttonBlockSchema>;
/** A card block. */
export type CardBlock = z.infer<typeof cardBlockSchema>;
/** A divider block. */
export type DividerBlock = z.infer<typeof dividerBlockSchema>;
/** A spacer block. */
export type SpacerBlock = z.infer<typeof spacerBlockSchema>;
/** A columns block. */
export type ColumnsBlock = z.infer<typeof columnsBlockSchema>;
/** A social block. */
export type SocialBlock = z.infer<typeof socialBlockSchema>;
/** A footer block. */
export type FooterBlock = z.infer<typeof footerBlockSchema>;

/**
 * Maps a {@link BlockType} to its concrete block type. Useful for writing
 * strongly-typed render strategies (`BlockOfType<'header'>` → `HeaderBlock`).
 */
export type BlockOfType<T extends BlockType> = Extract<Block, { type: T }>;

/**
 * Maps a {@link BlockType} to its `props` shape.
 */
export type BlockProps<T extends BlockType> = BlockOfType<T>['props'];
