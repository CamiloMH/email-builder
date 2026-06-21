import { ExportFormat, personalizeDocument, safeParseTemplateDocument } from '@email/core';
import { renderTemplate } from '@email/emails';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  Braces,
  ChevronDown,
  Code2,
  Download,
  FileCode2,
  FileJson,
  FileText,
  Mail,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Redo2,
  Save,
  Send,
  ShieldCheck,
  Smartphone,
  Star,
  Undo2,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { templatesApi } from '../api/templates.api';
import { toDocument } from '../api/types';
import { LanguageSelector } from '../components/LanguageSelector';
import { Button, IconButton, TextInput } from '../components/ui/controls';
import { DropdownMenu, type DropdownMenuItem } from '../components/ui/DropdownMenu';
import { ResizeHandle } from '../components/ui/ResizeHandle';
import { Tabs } from '../components/ui/Tabs';
import { BlockInspector } from '../features/builder/BlockInspector';
import { BlockPalette } from '../features/builder/BlockPalette';
import { Canvas } from '../features/builder/Canvas';
import { PreflightModal } from '../features/builder/PreflightModal';
import { PreviewPane } from '../features/builder/PreviewPane';
import { SendStatus, SendTestModal } from '../features/builder/SendTestModal';
import { TemplateSwitcher } from '../features/builder/TemplateSwitcher';
import { ThemePanel } from '../features/builder/ThemePanel';
import { VariablesPanel } from '../features/builder/VariablesPanel';
import { HelpButton } from '../features/tour/HelpButton';
import { EDITOR_TOUR } from '../features/tour/tour';
import { useTour } from '../features/tour/use-tour';
import { useDocumentTitle } from '../hooks/use-document-title';
import { useTemplate, useUpdateTemplate } from '../hooks/use-template';
import { useTemplates } from '../hooks/use-templates';
import { useLocalePath } from '../i18n/use-locale-path';
import { cn } from '../lib/cn';
import { triggerDownload } from '../lib/download';
import { exportTemplate } from '../lib/export-template';
import { apiErrorMessage } from '../lib/error-message';
import { notify } from '../lib/toast';
import { loadPreferences, savePreferences } from '../lib/preferences';
import { useDebouncedValue } from '../lib/use-debounced-value';
import { useBuilderStore } from '../store/builder-store';
import { useFavoritesStore } from '../store/favorites-store';

/** Debounce before autosaving edits (ms). */
const AUTOSAVE_MS = 1200;

/** Left-sidebar tab identifiers. */
const PaletteTab = { Blocks: 'blocks', Theme: 'theme', Variables: 'variables' } as const;
type PaletteTab = (typeof PaletteTab)[keyof typeof PaletteTab];

/** Preview iframe (device) widths in pixels. */
const PreviewWidth = { Desktop: 640, Mobile: 375 } as const;

/** Resizable preview-pane width bounds (px). */
const PREVIEW_PANE_MIN = 320;
const PREVIEW_PANE_MAX = 900;

/** Panels shown one-at-a-time on small screens. */
const MobilePanel = {
  Blocks: 'blocks',
  Canvas: 'canvas',
  Preview: 'preview',
  Inspector: 'inspector',
} as const;
type MobilePanel = (typeof MobilePanel)[keyof typeof MobilePanel];

const MOBILE_PANELS: ReadonlyArray<{ id: MobilePanel; labelKey: string }> = [
  { id: MobilePanel.Blocks, labelKey: 'editor.panels.blocks' },
  { id: MobilePanel.Canvas, labelKey: 'editor.panels.canvas' },
  { id: MobilePanel.Preview, labelKey: 'editor.panels.preview' },
  { id: MobilePanel.Inspector, labelKey: 'editor.panels.inspector' },
];

/**
 * The email editor: a responsive layout with a collapsible palette/theme
 * sidebar, the canvas, a resizable live preview and a collapsible block
 * inspector. On large screens all panels are visible at once; on small screens a
 * panel switcher shows one at a time.
 */
export const EditorPage = (): ReactNode => {
  const { t } = useTranslation();
  const path = useLocalePath();
  const startTour = useTour('email-builder-tour-editor', EDITOR_TOUR);
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: template, isLoading, isError } = useTemplate(id);
  const { data: templates } = useTemplates();
  const updateTemplate = useUpdateTemplate(id);

  const document = useBuilderStore((state) => state.document);
  const setDocument = useBuilderStore((state) => state.setDocument);
  const setName = useBuilderStore((state) => state.setName);
  const selectBlock = useBuilderStore((state) => state.selectBlock);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);
  const canUndo = useBuilderStore((state) => state.past.length > 0);
  const canRedo = useBuilderStore((state) => state.future.length > 0);

  const favoriteIds = useFavoritesStore((state) => state.ids);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);

  // Autosave: persist debounced edits and surface a save status.
  const debouncedDocument = useDebouncedValue(document, AUTOSAVE_MS);
  const lastSavedRef = useRef<string | null>(null);
  const loadedIdRef = useRef<string | null>(null);
  const mutateRef = useRef(updateTemplate.mutate);
  mutateRef.current = updateTemplate.mutate;
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Editor preferences (device, pane width, collapse) persist across sessions.
  const initialPreferences = useMemo(loadPreferences, []);
  const [tab, setTab] = useState<PaletteTab>(PaletteTab.Blocks);
  const [previewWidth, setPreviewWidth] = useState<number>(initialPreferences.previewWidth);
  const [previewPaneWidth, setPreviewPaneWidth] = useState<number>(
    initialPreferences.previewPaneWidth,
  );
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(MobilePanel.Canvas);
  const [paletteCollapsed, setPaletteCollapsed] = useState(initialPreferences.paletteCollapsed);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(
    initialPreferences.inspectorCollapsed,
  );
  // Pending export format awaiting preflight confirmation, and the test-send modal.
  const [preflightFormat, setPreflightFormat] = useState<ExportFormat | null>(null);
  const [checkOpen, setCheckOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const sendTest = useMutation({
    mutationFn: async (to: string) => {
      if (!document) {
        throw new Error('No template loaded');
      }
      const rendered = await renderTemplate(personalizeDocument(document));
      return templatesApi.sendTest({
        to,
        subject: document.name,
        html: rendered.html,
        text: rendered.text,
      });
    },
    onSuccess: () => {
      setSendOpen(false);
      notify.success(t('send.success'));
    },
    onError: (error) => notify.error(apiErrorMessage(error, t)),
  });

  useDocumentTitle(`${document?.name ?? t('editor.defaultTitle')} · Email Builder`);

  // Hydrate the builder once per template id. Re-running on every `template`
  // change would reset the document/history when autosave refreshes the query.
  useEffect(() => {
    if (template && loadedIdRef.current !== template.id) {
      loadedIdRef.current = template.id;
      const loaded = toDocument(template);
      setDocument(loaded);
      lastSavedRef.current = JSON.stringify(loaded);
      setSavedAt(null);
    }
  }, [template, setDocument]);

  useEffect(() => {
    savePreferences({ previewWidth, previewPaneWidth, paletteCollapsed, inspectorCollapsed });
  }, [previewWidth, previewPaneWidth, paletteCollapsed, inspectorCollapsed]);

  // Autosave whenever the debounced document differs from what was last saved.
  // Skip while the document is invalid (e.g. a half-typed variable) to avoid 400s.
  useEffect(() => {
    if (!debouncedDocument || lastSavedRef.current === null) {
      return;
    }
    const serialized = JSON.stringify(debouncedDocument);
    if (serialized === lastSavedRef.current || !safeParseTemplateDocument(debouncedDocument).success) {
      return;
    }
    mutateRef.current(debouncedDocument, {
      onSuccess: () => {
        lastSavedRef.current = serialized;
        setSavedAt(Date.now());
      },
      onError: (error) => notify.error(apiErrorMessage(error, t)),
    });
  }, [debouncedDocument, t]);

  // Keyboard undo/redo (ignored while typing in a field, which keeps native undo).
  useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }
      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement | null;
      const editable =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable === true;
      if (key === 'z' && !editable) {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (key === 'y' && !editable) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // Templates for the quick switcher, favorites first.
  const switcherTemplates = useMemo(
    () =>
      [...(templates ?? [])].sort(
        (a, b) => Number(favoriteIds.includes(b.id)) - Number(favoriteIds.includes(a.id)),
      ),
    [templates, favoriteIds],
  );
  const canSwitch =
    switcherTemplates.length > 1 && switcherTemplates.some((item) => item.id === id);
  const isFavorite = favoriteIds.includes(id);

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-gray-600">{t('editor.notFound')}</p>
        <Button onClick={() => navigate(path('/app'))}>{t('editor.back')}</Button>
      </div>
    );
  }

  if (isLoading || !document) {
    return <p className="p-8 text-sm text-gray-500">{t('editor.loading')}</p>;
  }

  const handleExport = async (format: ExportFormat): Promise<void> => {
    const file = await exportTemplate(document, format);
    triggerDownload(file.blob, file.filename);
  };

  const save = (): void => {
    const serialized = JSON.stringify(document);
    updateTemplate.mutate(document, {
      onSuccess: () => {
        lastSavedRef.current = serialized;
        setSavedAt(Date.now());
        notify.success(t('common.saved'));
      },
      onError: (error) => notify.error(apiErrorMessage(error, t)),
    });
  };

  const dirty =
    lastSavedRef.current !== null && JSON.stringify(document) !== lastSavedRef.current;
  const saveStatus = updateTemplate.isPending
    ? t('common.saving')
    : dirty
      ? t('common.unsaved')
      : savedAt !== null
        ? t('common.saved')
        : '';

  const exportItems: DropdownMenuItem[] = [
    {
      id: ExportFormat.Html,
      label: t('editor.exportHtml'),
      icon: <Code2 size={16} />,
      onSelect: () => setPreflightFormat(ExportFormat.Html),
    },
    {
      id: ExportFormat.Text,
      label: t('editor.exportText'),
      icon: <FileText size={16} />,
      onSelect: () => setPreflightFormat(ExportFormat.Text),
    },
    {
      id: ExportFormat.React,
      label: t('editor.exportReact'),
      icon: <FileCode2 size={16} />,
      onSelect: () => setPreflightFormat(ExportFormat.React),
    },
    {
      id: ExportFormat.Hbs,
      label: t('editor.exportHbs'),
      icon: <Braces size={16} />,
      onSelect: () => setPreflightFormat(ExportFormat.Hbs),
    },
    {
      id: ExportFormat.Eml,
      label: t('editor.exportEml'),
      icon: <Mail size={16} />,
      onSelect: () => setPreflightFormat(ExportFormat.Eml),
    },
    {
      id: ExportFormat.Json,
      label: t('editor.exportJson'),
      icon: <FileJson size={16} />,
      onSelect: () => setPreflightFormat(ExportFormat.Json),
    },
  ];

  const sendStatus: SendStatus = sendTest.isPending
    ? SendStatus.Pending
    : sendTest.isSuccess
      ? SendStatus.Success
      : sendTest.isError
        ? SendStatus.Error
        : SendStatus.Idle;

  /** Mobile display token: show the panel when selected, otherwise hide it. */
  const onMobile = (panel: MobilePanel, display: 'flex' | 'block'): string =>
    mobilePanel === panel ? display : 'hidden';

  const previewStyle: CSSProperties & Record<'--preview-w', string> = {
    '--preview-w': `${previewPaneWidth}px`,
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <IconButton label={t('editor.back')} onClick={() => navigate(path('/app'))}>
            <ArrowLeft size={18} />
          </IconButton>
          {canSwitch ? (
            <div className="hidden sm:block">
              <TemplateSwitcher
                currentId={id}
                templates={switcherTemplates}
                favoriteIds={favoriteIds}
              />
            </div>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <TextInput
            aria-label={t('editor.templateName')}
            value={document.name}
            onChange={(event) => setName(event.target.value)}
            className="w-full min-w-0 max-w-xs"
          />
          <IconButton
            label={isFavorite ? t('favorite.remove') : t('favorite.add')}
            onClick={() => toggleFavorite(id)}
          >
            <Star
              size={18}
              aria-hidden
              className={isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}
            />
          </IconButton>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-gray-300 p-0.5" data-tour="history">
            <IconButton label={t('common.undo')} onClick={undo} disabled={!canUndo}>
              <Undo2 size={16} />
            </IconButton>
            <IconButton label={t('common.redo')} onClick={redo} disabled={!canRedo}>
              <Redo2 size={16} />
            </IconButton>
          </div>
          <div className="flex rounded-md border border-gray-300 p-0.5">
            <IconButton
              label={t('editor.desktopView')}
              onClick={() => setPreviewWidth(PreviewWidth.Desktop)}
              className={previewWidth === PreviewWidth.Desktop ? 'bg-gray-100 text-gray-900' : ''}
            >
              <Monitor size={16} />
            </IconButton>
            <IconButton
              label={t('editor.mobileView')}
              onClick={() => setPreviewWidth(PreviewWidth.Mobile)}
              className={previewWidth === PreviewWidth.Mobile ? 'bg-gray-100 text-gray-900' : ''}
            >
              <Smartphone size={16} />
            </IconButton>
          </div>
          <LanguageSelector />
          <HelpButton onClick={startTour} />
          <span
            className="hidden w-24 shrink-0 text-right text-xs text-gray-400 sm:inline-block"
            aria-live="polite"
          >
            {saveStatus}
          </span>
          <Button variant="secondary" onClick={() => setCheckOpen(true)}>
            <ShieldCheck size={16} /> {t('editor.check')}
          </Button>
          <div data-tour="send">
            <Button variant="secondary" onClick={() => setSendOpen(true)}>
              <Send size={16} /> {t('editor.sendTest')}
            </Button>
          </div>
          <div data-tour="export">
            <DropdownMenu
              ariaLabel={t('editor.export')}
              trigger={
                <>
                  <Download size={16} /> {t('editor.export')} <ChevronDown size={14} aria-hidden />
                </>
              }
              items={exportItems}
            />
          </div>
          <div data-tour="save">
            <Button onClick={save} loading={updateTemplate.isPending}>
              {updateTemplate.isPending ? (
                t('common.save')
              ) : (
                <>
                  <Save size={16} /> {t('common.save')}
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <nav
        className="flex shrink-0 border-b border-gray-200 bg-white lg:hidden"
        aria-label={t('editor.panelsAria')}
      >
        {MOBILE_PANELS.map((panel) => (
          <button
            key={panel.id}
            type="button"
            aria-pressed={mobilePanel === panel.id}
            onClick={() => setMobilePanel(panel.id)}
            className={cn(
              'flex-1 px-2 py-2 text-xs font-medium transition',
              mobilePanel === panel.id
                ? 'border-b-2 border-brand-500 text-brand-600'
                : 'text-gray-500 hover:text-gray-800',
            )}
          >
            {t(panel.labelKey)}
          </button>
        ))}
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Collapsed palette rail (desktop) */}
        <button
          type="button"
          aria-label={t('editor.expandPalette')}
          onClick={() => setPaletteCollapsed(false)}
          className={cn(
            'hidden shrink-0 items-center justify-center border-r border-gray-200 bg-white px-1 text-gray-500 hover:text-gray-900',
            paletteCollapsed ? 'lg:flex' : 'lg:hidden',
          )}
        >
          <PanelLeftOpen size={18} />
        </button>

        <aside
          data-tour="palette"
          className={cn(
            onMobile(MobilePanel.Blocks, 'flex'),
            paletteCollapsed ? 'lg:hidden' : 'lg:flex lg:w-72',
            'w-full flex-col overflow-y-auto border-r border-gray-200 bg-white',
          )}
        >
          <div className="flex items-center border-b border-gray-200">
            <div className="flex-1">
              <Tabs
                items={[
                  { id: PaletteTab.Blocks, label: t('editor.tabBlocks') },
                  { id: PaletteTab.Theme, label: t('editor.tabTheme') },
                  { id: PaletteTab.Variables, label: t('variables.tab') },
                ]}
                active={tab}
                onChange={(next) => setTab(next as PaletteTab)}
              />
            </div>
            <button
              type="button"
              aria-label={t('editor.collapsePalette')}
              onClick={() => setPaletteCollapsed(true)}
              className="hidden px-2 text-gray-400 hover:text-gray-700 lg:block"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
          {tab === PaletteTab.Blocks ? (
            <BlockPalette />
          ) : tab === PaletteTab.Theme ? (
            <ThemePanel />
          ) : (
            <VariablesPanel />
          )}
        </aside>

        <main
          data-tour="canvas"
          className={cn(
            onMobile(MobilePanel.Canvas, 'block'),
            'min-w-0 flex-1 overflow-y-auto lg:block',
          )}
        >
          <Canvas />
        </main>

        <ResizeHandle
          width={previewPaneWidth}
          min={PREVIEW_PANE_MIN}
          max={PREVIEW_PANE_MAX}
          onChange={setPreviewPaneWidth}
        />

        <section
          data-tour="preview"
          className={cn(
            onMobile(MobilePanel.Preview, 'block'),
            'w-full shrink-0 border-l border-gray-200 lg:block lg:w-[var(--preview-w)]',
          )}
          style={previewStyle}
        >
          <PreviewPane width={previewWidth} />
        </section>

        <aside
          className={cn(
            onMobile(MobilePanel.Inspector, 'block'),
            inspectorCollapsed ? 'lg:hidden' : 'lg:block lg:w-80',
            'w-full shrink-0 overflow-y-auto border-l border-gray-200 bg-white',
          )}
        >
          <div className="flex items-center border-b border-gray-200 px-1 py-1">
            <button
              type="button"
              aria-label={t('editor.collapseInspector')}
              onClick={() => setInspectorCollapsed(true)}
              className="hidden text-gray-400 hover:text-gray-700 lg:block"
            >
              <PanelRightClose size={16} />
            </button>
          </div>
          <BlockInspector />
        </aside>

        {/* Collapsed inspector rail (desktop) */}
        <button
          type="button"
          aria-label={t('editor.expandInspector')}
          onClick={() => setInspectorCollapsed(false)}
          className={cn(
            'hidden shrink-0 items-center justify-center border-l border-gray-200 bg-white px-1 text-gray-500 hover:text-gray-900',
            inspectorCollapsed ? 'lg:flex' : 'lg:hidden',
          )}
        >
          <PanelRightOpen size={18} />
        </button>
      </div>

      <PreflightModal
        open={checkOpen || preflightFormat !== null}
        document={document}
        onClose={() => {
          setPreflightFormat(null);
          setCheckOpen(false);
        }}
        onSelectBlock={(blockId) => {
          selectBlock(blockId);
          setMobilePanel(MobilePanel.Canvas);
          setPreflightFormat(null);
          setCheckOpen(false);
        }}
        onConfirm={
          preflightFormat !== null
            ? () => {
                const format = preflightFormat;
                setPreflightFormat(null);
                if (format) {
                  void handleExport(format);
                }
              }
            : undefined
        }
      />
      <SendTestModal
        open={sendOpen}
        status={sendStatus}
        onClose={() => {
          setSendOpen(false);
          sendTest.reset();
        }}
        onSubmit={(to) => sendTest.mutate(to)}
      />
    </div>
  );
};
