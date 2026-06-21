import type { ReactNode } from 'react';

interface LogoProps {
  /** Pixel size (width and height). */
  size?: number;
  /** Optional class name. */
  className?: string;
  /** Accessible label; when omitted the logo is decorative (hidden from AT). */
  label?: string;
}

/**
 * The Email Builder brand mark: a rounded blue square with an envelope and a
 * violet accent block (hinting at the block builder). Decorative by default;
 * pass `label` to expose it as an image to assistive tech.
 */
export const Logo = ({ size = 28, className, label }: LogoProps): ReactNode => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    className={className}
  >
    <rect width="32" height="32" rx="8" fill="#2563EB" />
    <rect x="6.5" y="9" width="19" height="14" rx="2.5" fill="#ffffff" />
    <path
      d="M7.5 11 16 16.5 24.5 11"
      stroke="#2563EB"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="20" y="18.5" width="6" height="6" rx="2" fill="#7C3AED" />
  </svg>
);
