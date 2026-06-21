import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import type { TFunction } from 'i18next';

/** A guided-tour step: a CSS selector to highlight and its i18n keys. */
export interface TourStep {
  /** CSS selector of the element to highlight. */
  selector: string;
  /** i18n key for the step title. */
  titleKey: string;
  /** i18n key for the step description. */
  descKey: string;
}

/** Dashboard tour: create, examples and language. */
export const DASHBOARD_TOUR: readonly TourStep[] = [
  {
    selector: '[data-tour="new-template"]',
    titleKey: 'tour.dashboard.newTitle',
    descKey: 'tour.dashboard.newDesc',
  },
  {
    selector: '[data-tour="examples"]',
    titleKey: 'tour.dashboard.examplesTitle',
    descKey: 'tour.dashboard.examplesDesc',
  },
  {
    selector: '[data-tour="language"]',
    titleKey: 'tour.dashboard.languageTitle',
    descKey: 'tour.dashboard.languageDesc',
  },
];

/** Editor tour: palette, canvas, preview, history and the header actions. */
export const EDITOR_TOUR: readonly TourStep[] = [
  { selector: '[data-tour="palette"]', titleKey: 'tour.editor.paletteTitle', descKey: 'tour.editor.paletteDesc' },
  { selector: '[data-tour="canvas"]', titleKey: 'tour.editor.canvasTitle', descKey: 'tour.editor.canvasDesc' },
  { selector: '[data-tour="preview"]', titleKey: 'tour.editor.previewTitle', descKey: 'tour.editor.previewDesc' },
  { selector: '[data-tour="history"]', titleKey: 'tour.editor.historyTitle', descKey: 'tour.editor.historyDesc' },
  { selector: '[data-tour="export"]', titleKey: 'tour.editor.exportTitle', descKey: 'tour.editor.exportDesc' },
  { selector: '[data-tour="send"]', titleKey: 'tour.editor.sendTitle', descKey: 'tour.editor.sendDesc' },
  { selector: '[data-tour="save"]', titleKey: 'tour.editor.saveTitle', descKey: 'tour.editor.saveDesc' },
];

/**
 * Maps {@link TourStep}s to driver.js steps, translating their copy.
 *
 * @param steps - The tour steps.
 * @param t - The i18n translation function.
 * @returns The driver.js steps.
 */
export function buildSteps(steps: readonly TourStep[], t: TFunction): DriveStep[] {
  return steps.map((step) => ({
    element: step.selector,
    popover: { title: t(step.titleKey), description: t(step.descKey) },
  }));
}

/**
 * Runs a guided tour, skipping steps whose target is not currently in the DOM
 * (e.g. collapsed panels), so the tour never shows an empty popover.
 *
 * @param steps - The tour steps.
 * @param t - The i18n translation function.
 */
export function runTour(steps: readonly TourStep[], t: TFunction): void {
  const present = steps.filter((step) => document.querySelector(step.selector));
  if (present.length === 0) {
    return;
  }
  driver({
    showProgress: true,
    allowClose: true,
    nextBtnText: t('tour.next'),
    prevBtnText: t('tour.prev'),
    doneBtnText: t('tour.done'),
    steps: buildSteps(present, t),
  }).drive();
}
