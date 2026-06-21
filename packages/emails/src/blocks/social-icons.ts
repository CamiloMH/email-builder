import { SocialPlatform, type SocialPlatform as SocialPlatformValue } from '@email/core';

/** Human-readable labels for each social platform (used as image alt text). */
export const SOCIAL_LABELS: Record<SocialPlatformValue, string> = {
  [SocialPlatform.Twitter]: 'Twitter',
  [SocialPlatform.Facebook]: 'Facebook',
  [SocialPlatform.Instagram]: 'Instagram',
  [SocialPlatform.LinkedIn]: 'LinkedIn',
  [SocialPlatform.YouTube]: 'YouTube',
  [SocialPlatform.GitHub]: 'GitHub',
};

/** Simple Icons slug used to fetch each platform's brand logo. */
const SOCIAL_ICON_SLUG: Record<SocialPlatformValue, string> = {
  [SocialPlatform.Twitter]: 'x',
  [SocialPlatform.Facebook]: 'facebook',
  [SocialPlatform.Instagram]: 'instagram',
  [SocialPlatform.LinkedIn]: 'linkedin',
  [SocialPlatform.YouTube]: 'youtube',
  [SocialPlatform.GitHub]: 'github',
};

/**
 * Builds the brand-coloured logo URL for a platform (Simple Icons CDN). Shared
 * by the render strategy and the React-source code generator so both emit the
 * exact same icon.
 *
 * @param platform - The social platform.
 * @returns The icon URL.
 */
export function socialIconUrl(platform: SocialPlatformValue): string {
  return `https://cdn.simpleicons.org/${SOCIAL_ICON_SLUG[platform]}`;
}
