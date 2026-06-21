import { beforeEach, describe, expect, it, vi } from 'vitest';

const { drive, driverMock } = vi.hoisted(() => {
  const driveFn = vi.fn();
  return { drive: driveFn, driverMock: vi.fn(() => ({ drive: driveFn })) };
});
vi.mock('driver.js', () => ({ driver: driverMock }));

import { DASHBOARD_TOUR, EDITOR_TOUR, buildSteps, runTour, type TourStep } from './tour';

const t = ((key: string) => key) as unknown as Parameters<typeof buildSteps>[1];

describe('buildSteps', () => {
  it('maps steps to driver steps with translated copy', () => {
    const steps: TourStep[] = [{ selector: '#x', titleKey: 'a.title', descKey: 'a.desc' }];
    expect(buildSteps(steps, t)).toEqual([
      { element: '#x', popover: { title: 'a.title', description: 'a.desc' } },
    ]);
  });
});

describe('tour catalogs', () => {
  it('define the expected steps', () => {
    expect(DASHBOARD_TOUR.length).toBeGreaterThanOrEqual(3);
    expect(EDITOR_TOUR.length).toBeGreaterThanOrEqual(5);
  });
});

describe('runTour', () => {
  beforeEach(() => {
    drive.mockClear();
    driverMock.mockClear();
    document.body.innerHTML = '';
  });

  it('drives the tour when a target element is present', () => {
    const el = document.createElement('div');
    el.setAttribute('data-tour', 'x');
    document.body.appendChild(el);
    runTour([{ selector: '[data-tour="x"]', titleKey: 'a', descKey: 'b' }], t);
    expect(drive).toHaveBeenCalledTimes(1);
  });

  it('does nothing when no target element exists', () => {
    runTour([{ selector: '[data-tour="missing"]', titleKey: 'a', descKey: 'b' }], t);
    expect(drive).not.toHaveBeenCalled();
  });
});
