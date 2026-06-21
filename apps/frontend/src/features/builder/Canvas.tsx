import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BLOCK_CATALOG, type Block } from '@email/core';
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { blockIcon } from '../../components/icons';
import { IconButton } from '../../components/ui/controls';
import { cn } from '../../lib/cn';
import { useBuilderStore } from '../../store/builder-store';
import { blockSummary } from './block-summary';

interface SortableBlockProps {
  /** The block to render. */
  block: Block;
  /** Whether the block is selected. */
  selected: boolean;
  /** Whether the block can move up. */
  canMoveUp: boolean;
  /** Whether the block can move down. */
  canMoveDown: boolean;
  /** Selection handler. */
  onSelect: () => void;
  /** Removal handler. */
  onRemove: () => void;
  /** Move-up handler (keyboard/pointer alternative to dragging). */
  onMoveUp: () => void;
  /** Move-down handler. */
  onMoveDown: () => void;
}

/**
 * A single draggable, selectable block card in the canvas. Besides dragging, it
 * exposes move up/down buttons so reordering works without a pointer drag
 * (WCAG 2.5.7).
 */
const SortableBlock = ({
  block,
  selected,
  canMoveUp,
  canMoveDown,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
}: SortableBlockProps): ReactNode => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const Icon = blockIcon(BLOCK_CATALOG[block.type].icon);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm transition',
        selected ? 'border-brand-500 ring-2 ring-brand-200' : 'border-gray-200',
        isDragging && 'opacity-60',
      )}
    >
      <button
        type="button"
        aria-label={t('canvas.reorder')}
        className="shrink-0 cursor-grab text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <Icon size={18} className="shrink-0 text-brand-500" aria-hidden />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-gray-800">
            {t(`blocks.${block.type}.label`)}
          </span>
          <span className="truncate text-xs text-gray-500">{blockSummary(block)}</span>
        </span>
      </button>
      <div className="flex shrink-0 items-center">
        <IconButton label={t('canvas.moveUp')} onClick={onMoveUp} disabled={!canMoveUp}>
          <ChevronUp size={16} aria-hidden />
        </IconButton>
        <IconButton label={t('canvas.moveDown')} onClick={onMoveDown} disabled={!canMoveDown}>
          <ChevronDown size={16} aria-hidden />
        </IconButton>
        <IconButton label={t('canvas.remove')} onClick={onRemove} className="hover:text-red-600">
          <Trash2 size={16} aria-hidden />
        </IconButton>
      </div>
    </div>
  );
};

/**
 * The canvas: a vertical, drag-and-drop-sortable list of the template's blocks.
 */
export const Canvas = (): ReactNode => {
  const document = useBuilderStore((state) => state.document);
  const selectedBlockId = useBuilderStore((state) => state.selectedBlockId);
  const selectBlock = useBuilderStore((state) => state.selectBlock);
  const removeBlock = useBuilderStore((state) => state.removeBlock);
  const reorderBlocks = useBuilderStore((state) => state.reorderBlocks);
  // A small activation distance keeps click-to-select reliable while still
  // allowing drags to start quickly.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  if (!document) {
    return null;
  }

  if (document.blocks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-gray-500">
        Añade bloques desde el panel izquierdo para empezar.
      </div>
    );
  }

  // Reorder live while dragging (not only on drop) so the canvas and the live
  // preview reflect the new layout in real time.
  const handleDragOver = (event: DragOverEvent): void => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderBlocks(String(active.id), String(over.id));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragOver={handleDragOver}>
      <SortableContext
        items={document.blocks.map((block) => block.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3 p-4 sm:p-6">
          {document.blocks.map((block, index) => (
            <SortableBlock
              key={block.id}
              block={block}
              selected={selectedBlockId === block.id}
              canMoveUp={index > 0}
              canMoveDown={index < document.blocks.length - 1}
              onSelect={() => selectBlock(block.id)}
              onRemove={() => removeBlock(block.id)}
              onMoveUp={() => {
                const previous = document.blocks[index - 1];
                if (previous) {
                  reorderBlocks(block.id, previous.id);
                }
              }}
              onMoveDown={() => {
                const next = document.blocks[index + 1];
                if (next) {
                  reorderBlocks(block.id, next.id);
                }
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
