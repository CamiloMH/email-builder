import { useMemo, type CSSProperties, type ReactNode } from 'react';

/** A single floating dot's randomized parameters. */
interface Dot {
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

// Builds randomized dots. Negative delays distribute them mid-flight so the
// effect looks continuous from the first paint (no empty warm-up).
function buildDots(count: number): Dot[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    size: 3 + Math.random() * 5,
    duration: 9 + Math.random() * 12,
    delay: -(Math.random() * 20),
    opacity: 0.2 + Math.random() * 0.4,
  }));
}

/**
 * Decorative background of small blue dots that rise upward on a white surface.
 * Purely ornamental (`aria-hidden`, non-interactive) and respects
 * `prefers-reduced-motion` via the global stylesheet. Anchored to the viewport
 * (`fixed`) so the dots cover the whole page as you scroll, behind the content.
 * Accepts an optional `count` (number of dots, default 28).
 *
 * @returns The dots layer.
 */
export const RisingDots = ({ count = 28 }: { count?: number }): ReactNode => {
  const dots = useMemo(() => buildDots(count), [count]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {dots.map((dot, index) => {
        const style: CSSProperties & Record<'--dot-opacity', string> = {
          left: `${dot.left}%`,
          width: `${dot.size}px`,
          height: `${dot.size}px`,
          animationDuration: `${dot.duration}s`,
          animationDelay: `${dot.delay}s`,
          '--dot-opacity': String(dot.opacity),
        };
        return <span key={index} className="rising-dot" style={style} />;
      })}
    </div>
  );
};
