import type { Block, TemplateDocument, Theme } from '@email/core';
import { create } from 'zustand';
import { arrayMove } from '../lib/array-move';

/** Maximum number of document snapshots kept for undo. */
const HISTORY_LIMIT = 50;

/**
 * State and actions for the email builder. Holds the working document and the
 * currently-selected block, with immutable update actions consumed by the
 * canvas, palette, inspector and theme panel. Document-changing actions are
 * recorded so they can be undone/redone.
 */
export interface BuilderState {
  /** The working template document, or `null` before one is loaded. */
  document: TemplateDocument | null;
  /** The id of the selected block, or `null`. */
  selectedBlockId: string | null;
  /** The theme color currently hovered in the theme panel, highlighted in the preview. */
  highlightColor: string | null;
  /** Past document snapshots (most recent last) available to undo. */
  past: TemplateDocument[];
  /** Undone document snapshots (next-to-redo first) available to redo. */
  future: TemplateDocument[];
  /** Label of the last commit, used to coalesce rapid same-kind edits. */
  lastLabel: string | null;
  /** Loads a document into the builder, selecting its first block. Resets history. */
  setDocument: (document: TemplateDocument) => void;
  /** Clears the builder. */
  reset: () => void;
  /** Updates the template name. */
  setName: (name: string) => void;
  /** Updates the template description. */
  setDescription: (description: string) => void;
  /** Replaces the template's personalization variables. */
  setVariables: (variables: TemplateDocument['variables']) => void;
  /** Selects a block (or clears the selection with `null`). */
  selectBlock: (id: string | null) => void;
  /** Inserts a block at `index` (defaults to the end) and selects it. */
  addBlock: (block: Block, index?: number) => void;
  /** Removes a block by id, clearing the selection if it was selected. */
  removeBlock: (id: string) => void;
  /** Reorders blocks, moving `activeId` to the position of `overId`. */
  reorderBlocks: (activeId: string, overId: string) => void;
  /** Merges a partial props patch into a block. */
  updateBlockProps: (id: string, patch: Record<string, unknown>) => void;
  /** Replaces the theme. */
  updateTheme: (theme: Theme) => void;
  /** Sets (or clears with `null`) the theme color highlighted in the preview. */
  setHighlightColor: (color: string | null) => void;
  /** Reverts to the previous document snapshot. */
  undo: () => void;
  /** Re-applies the next undone document snapshot. */
  redo: () => void;
}

/** Keeps the selected id only if it still exists in the given document. */
function keepSelection(document: TemplateDocument, selectedBlockId: string | null): string | null {
  return document.blocks.some((block) => block.id === selectedBlockId) ? selectedBlockId : null;
}

/**
 * Builds the state patch for a document change, recording history. Consecutive
 * commits with the same `label` are coalesced into a single undo step (e.g. a
 * burst of typing or a slider drag), so undo granularity stays meaningful.
 */
function commit(
  state: BuilderState,
  document: TemplateDocument,
  label: string,
  extra: Partial<BuilderState> = {},
): Partial<BuilderState> {
  if (!state.document) {
    return {};
  }
  const coalesce = label === state.lastLabel;
  const past = coalesce ? state.past : [...state.past, state.document].slice(-HISTORY_LIMIT);
  return { document, past, future: [], lastLabel: label, ...extra };
}

/**
 * Zustand store backing the email builder.
 */
export const useBuilderStore = create<BuilderState>((set) => ({
  document: null,
  selectedBlockId: null,
  highlightColor: null,
  past: [],
  future: [],
  lastLabel: null,

  setDocument: (document) =>
    set({
      document,
      selectedBlockId: document.blocks[0]?.id ?? null,
      past: [],
      future: [],
      lastLabel: null,
    }),

  reset: () =>
    set({
      document: null,
      selectedBlockId: null,
      highlightColor: null,
      past: [],
      future: [],
      lastLabel: null,
    }),

  setName: (name) =>
    set((state) => (state.document ? commit(state, { ...state.document, name }, 'name') : {})),

  setDescription: (description) =>
    set((state) =>
      state.document ? commit(state, { ...state.document, description }, 'description') : {},
    ),

  setVariables: (variables) =>
    set((state) => (state.document ? commit(state, { ...state.document, variables }, 'variables') : {})),

  selectBlock: (id) => set({ selectedBlockId: id }),

  addBlock: (block, index) =>
    set((state) => {
      if (!state.document) {
        return {};
      }
      const blocks = [...state.document.blocks];
      blocks.splice(index ?? blocks.length, 0, block);
      return commit(state, { ...state.document, blocks }, `add:${block.id}`, {
        selectedBlockId: block.id,
      });
    }),

  removeBlock: (id) =>
    set((state) => {
      if (!state.document) {
        return {};
      }
      const blocks = state.document.blocks.filter((block) => block.id !== id);
      return commit(state, { ...state.document, blocks }, `remove:${id}`, {
        selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
      });
    }),

  reorderBlocks: (activeId, overId) =>
    set((state) => {
      if (!state.document) {
        return {};
      }
      const from = state.document.blocks.findIndex((block) => block.id === activeId);
      const to = state.document.blocks.findIndex((block) => block.id === overId);
      if (from === -1 || to === -1) {
        return {};
      }
      return commit(
        state,
        { ...state.document, blocks: arrayMove(state.document.blocks, from, to) },
        `reorder:${activeId}`,
      );
    }),

  updateBlockProps: (id, patch) =>
    set((state) => {
      if (!state.document) {
        return {};
      }
      const blocks = state.document.blocks.map((block) =>
        block.id === id ? ({ ...block, props: { ...block.props, ...patch } } as Block) : block,
      );
      return commit(state, { ...state.document, blocks }, `props:${id}`);
    }),

  updateTheme: (theme) =>
    set((state) => (state.document ? commit(state, { ...state.document, theme }, 'theme') : {})),

  setHighlightColor: (highlightColor) => set({ highlightColor }),

  undo: () =>
    set((state) => {
      const previous = state.past.at(-1);
      if (!previous || !state.document) {
        return {};
      }
      return {
        document: previous,
        past: state.past.slice(0, -1),
        future: [state.document, ...state.future],
        selectedBlockId: keepSelection(previous, state.selectedBlockId),
        lastLabel: null,
      };
    }),

  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next || !state.document) {
        return {};
      }
      return {
        document: next,
        past: [...state.past, state.document],
        future: state.future.slice(1),
        selectedBlockId: keepSelection(next, state.selectedBlockId),
        lastLabel: null,
      };
    }),
}));
