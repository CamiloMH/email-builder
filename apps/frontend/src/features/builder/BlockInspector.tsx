import { BlockType, ButtonVariant, SocialPlatform, generateId, type Block } from '@email/core';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorField } from '../../components/ui/ColorField';
import { ImageUrlField } from '../../components/ui/ImageUrlField';
import {
  Button,
  Checkbox,
  Field,
  IconButton,
  SegmentedControl,
  TextArea,
  TextInput,
  RangeSlider,
  Select,
} from '../../components/ui/controls';
import { useBuilderStore } from '../../store/builder-store';

const SOCIAL_PLATFORM_OPTIONS = Object.values(SocialPlatform);

const BUTTON_VARIANT_OPTIONS: ReadonlyArray<{ value: ButtonVariant; labelKey: string }> = [
  { value: ButtonVariant.Filled, labelKey: 'inspector.variantFilled' },
  { value: ButtonVariant.Outline, labelKey: 'inspector.variantOutline' },
];

/** Default background used by the header background picker when none is set. */
const DEFAULT_HEADER_BG = '#FFFFFF';

type UpdateFn = (patch: Record<string, unknown>) => void;

/** Renders the editing form for a header block. */
const HeaderForm = (
  block: Extract<Block, { type: 'header' }>,
  update: UpdateFn,
  t: TFunction,
): ReactNode => (
  <>
    <Field label={t('inspector.title')}>
      <TextInput value={block.props.title} onChange={(e) => update({ title: e.target.value })} />
    </Field>
    <Field label={t('inspector.subtitle')}>
      <TextInput
        value={block.props.subtitle ?? ''}
        onChange={(e) => update({ subtitle: e.target.value })}
      />
    </Field>
    <ImageUrlField
      label={t('inspector.logoUrl')}
      value={block.props.logoUrl ?? ''}
      onChange={(v) => update({ logoUrl: v || undefined })}
    />
    <Field label={t('inspector.logoAlign')}>
      <SegmentedControl
        value={block.props.logoAlign ?? block.props.align}
        onChange={(logoAlign) => update({ logoAlign })}
      />
    </Field>
    <Checkbox
      label={t('inspector.logoInline')}
      checked={block.props.logoInline ?? false}
      onChange={(logoInline) => update({ logoInline })}
    />
    <Field label={t('inspector.align')}>
      <SegmentedControl value={block.props.align} onChange={(align) => update({ align })} />
    </Field>
    <ColorField
      label={t('inspector.background')}
      value={block.props.backgroundColor ?? DEFAULT_HEADER_BG}
      onChange={(backgroundColor) => update({ backgroundColor })}
    />
  </>
);

/** Renders the editing form for a text block. */
const TextForm = (
  block: Extract<Block, { type: 'text' }>,
  update: UpdateFn,
  t: TFunction,
): ReactNode => (
  <>
    <Field label={t('inspector.text')}>
      <TextArea value={block.props.text} onChange={(e) => update({ text: e.target.value })} />
    </Field>
    <Field label={t('inspector.fontSize', { value: block.props.fontSize })}>
      <RangeSlider
        value={block.props.fontSize}
        min={8}
        max={72}
        onChange={(fontSize) => update({ fontSize })}
      />
    </Field>
    <Field label={t('inspector.align')}>
      <SegmentedControl value={block.props.align} onChange={(align) => update({ align })} />
    </Field>
  </>
);

/** Renders the editing form for an image block. */
const ImageForm = (
  block: Extract<Block, { type: 'image' }>,
  update: UpdateFn,
  t: TFunction,
): ReactNode => (
  <>
    <ImageUrlField
      label={t('inspector.imageUrl')}
      value={block.props.src}
      onChange={(v) => update({ src: v })}
    />
    <Field label={t('inspector.alt')}>
      <TextInput value={block.props.alt} onChange={(e) => update({ alt: e.target.value })} />
    </Field>
    <Field label={t('inspector.linkOptional')}>
      <TextInput
        value={block.props.href ?? ''}
        onChange={(e) => update({ href: e.target.value || undefined })}
      />
    </Field>
    <Field label={t('inspector.width', { value: block.props.widthPercent })}>
      <RangeSlider
        value={block.props.widthPercent}
        min={10}
        max={100}
        onChange={(widthPercent) => update({ widthPercent })}
      />
    </Field>
  </>
);

/** Renders the editing form for a button block. */
const ButtonForm = (
  block: Extract<Block, { type: 'button' }>,
  update: UpdateFn,
  t: TFunction,
): ReactNode => (
  <>
    <Field label={t('inspector.buttonText')}>
      <TextInput value={block.props.label} onChange={(e) => update({ label: e.target.value })} />
    </Field>
    <Field label={t('inspector.link')}>
      <TextInput value={block.props.href} onChange={(e) => update({ href: e.target.value })} />
    </Field>
    <Field label={t('inspector.align')}>
      <SegmentedControl value={block.props.align} onChange={(align) => update({ align })} />
    </Field>
    <Field label={t('inspector.style')}>
      <Select
        value={block.props.variant}
        onChange={(e) => update({ variant: e.target.value as ButtonVariant })}
      >
        {BUTTON_VARIANT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </Select>
    </Field>
    <Checkbox
      label={t('inspector.fullWidth')}
      checked={block.props.fullWidth}
      onChange={(fullWidth) => update({ fullWidth })}
    />
  </>
);

/** Renders the editing form for a card block. */
const CardForm = (
  block: Extract<Block, { type: 'card' }>,
  update: UpdateFn,
  t: TFunction,
): ReactNode => (
  <>
    <Field label={t('inspector.title')}>
      <TextInput value={block.props.title} onChange={(e) => update({ title: e.target.value })} />
    </Field>
    <Field label={t('inspector.text')}>
      <TextArea value={block.props.text} onChange={(e) => update({ text: e.target.value })} />
    </Field>
    <ImageUrlField
      label={t('inspector.cardImageUrl')}
      value={block.props.imageUrl ?? ''}
      onChange={(v) => update({ imageUrl: v || undefined })}
    />
    <Field label={t('inspector.cardButtonText')}>
      <TextInput
        value={block.props.buttonLabel ?? ''}
        onChange={(e) => update({ buttonLabel: e.target.value || undefined })}
      />
    </Field>
    <Field label={t('inspector.cardButtonHref')}>
      <TextInput
        value={block.props.buttonHref ?? ''}
        onChange={(e) => update({ buttonHref: e.target.value || undefined })}
      />
    </Field>
    <ColorField
      label={t('inspector.background')}
      value={block.props.backgroundColor}
      onChange={(backgroundColor) => update({ backgroundColor })}
    />
    <Field label={t('inspector.align')}>
      <SegmentedControl value={block.props.align} onChange={(align) => update({ align })} />
    </Field>
  </>
);

/** Renders the editing form for a spacer block. */
const SpacerForm = (
  block: Extract<Block, { type: 'spacer' }>,
  update: UpdateFn,
  t: TFunction,
): ReactNode => (
  <Field label={t('inspector.height', { value: block.props.height })}>
    <RangeSlider
      value={block.props.height}
      min={4}
      max={160}
      onChange={(height) => update({ height })}
    />
  </Field>
);

/** Renders the editing form for a columns block. */
const ColumnsForm = (
  block: Extract<Block, { type: 'columns' }>,
  update: UpdateFn,
  t: TFunction,
): ReactNode => {
  const { columns } = block.props;
  const setColumns = (next: typeof columns): void => update({ columns: next });
  return (
    <div className="flex flex-col gap-4">
      {columns.map((column, index) => (
        <div key={column.id} className="flex flex-col gap-2 rounded-md border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              {t('inspector.columnLabel', { n: index + 1 })}
            </span>
            {columns.length > 2 ? (
              <IconButton
                label={t('inspector.removeColumn', { n: index + 1 })}
                onClick={() => setColumns(columns.filter((item) => item.id !== column.id))}
              >
                ✕
              </IconButton>
            ) : null}
          </div>
          <Field label={t('inspector.columnHeading')}>
            <TextInput
              value={column.heading ?? ''}
              onChange={(e) =>
                setColumns(
                  columns.map((item) =>
                    item.id === column.id ? { ...item, heading: e.target.value } : item,
                  ),
                )
              }
            />
          </Field>
          <Field label={t('inspector.text')}>
            <TextArea
              value={column.text}
              onChange={(e) =>
                setColumns(
                  columns.map((item) =>
                    item.id === column.id ? { ...item, text: e.target.value } : item,
                  ),
                )
              }
            />
          </Field>
        </div>
      ))}
      {columns.length < 3 ? (
        <Button
          variant="secondary"
          onClick={() => setColumns([...columns, { id: generateId(), heading: '', text: '' }])}
        >
          {t('inspector.addColumn')}
        </Button>
      ) : null}
    </div>
  );
};

/** Renders the editing form for a social block. */
const SocialForm = (
  block: Extract<Block, { type: 'social' }>,
  update: UpdateFn,
  t: TFunction,
): ReactNode => {
  const { links } = block.props;
  const setLinks = (next: typeof links): void => update({ links: next });
  return (
    <div className="flex flex-col gap-4">
      {links.map((link, index) => (
        <div key={link.id} className="flex flex-col gap-2 rounded-md border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              {t('inspector.linkLabel', { n: index + 1 })}
            </span>
            {links.length > 1 ? (
              <IconButton
                label={t('inspector.removeLink', { n: index + 1 })}
                onClick={() => setLinks(links.filter((item) => item.id !== link.id))}
              >
                ✕
              </IconButton>
            ) : null}
          </div>
          <Field label={t('inspector.network')}>
            <Select
              value={link.platform}
              onChange={(e) =>
                setLinks(
                  links.map((item) =>
                    item.id === link.id
                      ? { ...item, platform: e.target.value as SocialPlatform }
                      : item,
                  ),
                )
              }
            >
              {SOCIAL_PLATFORM_OPTIONS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('inspector.url')}>
            <TextInput
              value={link.url}
              onChange={(e) =>
                setLinks(
                  links.map((item) =>
                    item.id === link.id ? { ...item, url: e.target.value } : item,
                  ),
                )
              }
            />
          </Field>
        </div>
      ))}
      {links.length < 6 ? (
        <Button
          variant="secondary"
          onClick={() =>
            setLinks([
              ...links,
              { id: generateId(), platform: SocialPlatform.Twitter, url: 'https://' },
            ])
          }
        >
          {t('inspector.addLink')}
        </Button>
      ) : null}
    </div>
  );
};

/** Renders the editing form for a footer block. */
const FooterForm = (
  block: Extract<Block, { type: 'footer' }>,
  update: UpdateFn,
  t: TFunction,
): ReactNode => (
  <>
    <Field label={t('inspector.company')}>
      <TextInput
        value={block.props.companyName}
        onChange={(e) => update({ companyName: e.target.value })}
      />
    </Field>
    <Field label={t('inspector.address')}>
      <TextInput
        value={block.props.address ?? ''}
        onChange={(e) => update({ address: e.target.value || undefined })}
      />
    </Field>
    <Field label={t('inspector.unsubscribeUrl')}>
      <TextInput
        value={block.props.unsubscribeUrl ?? ''}
        onChange={(e) => update({ unsubscribeUrl: e.target.value || undefined })}
      />
    </Field>
    <Field label={t('inspector.legalText')}>
      <TextArea
        value={block.props.text ?? ''}
        onChange={(e) => update({ text: e.target.value || undefined })}
      />
    </Field>
  </>
);

/** Renders the per-type editing form for the given block. */
const renderForm = (block: Block, update: UpdateFn, t: TFunction): ReactNode => {
  switch (block.type) {
    case BlockType.Header:
      return HeaderForm(block, update, t);
    case BlockType.Text:
      return TextForm(block, update, t);
    case BlockType.Image:
      return ImageForm(block, update, t);
    case BlockType.Button:
      return ButtonForm(block, update, t);
    case BlockType.Card:
      return CardForm(block, update, t);
    case BlockType.Spacer:
      return SpacerForm(block, update, t);
    case BlockType.Columns:
      return ColumnsForm(block, update, t);
    case BlockType.Social:
      return SocialForm(block, update, t);
    case BlockType.Footer:
      return FooterForm(block, update, t);
    case BlockType.Divider:
      return <p className="text-sm text-gray-500">{t('inspector.noOptions')}</p>;
    default:
      return null;
  }
};

/**
 * Inspector panel that edits the props of the currently-selected block.
 */
export const BlockInspector = (): ReactNode => {
  const { t } = useTranslation();
  const document = useBuilderStore((state) => state.document);
  const selectedBlockId = useBuilderStore((state) => state.selectedBlockId);
  const updateBlockProps = useBuilderStore((state) => state.updateBlockProps);
  const block = document?.blocks.find((item) => item.id === selectedBlockId) ?? null;

  if (!block) {
    return <p className="p-4 text-sm text-gray-500">{t('inspector.selectPrompt')}</p>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {t('inspector.heading')}: {t(`blocks.${block.type}.label`)}
      </h3>
      {renderForm(block, (patch) => updateBlockProps(block.id, patch), t)}
    </div>
  );
};
