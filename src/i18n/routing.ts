import { defineRouting } from 'next-intl/routing';

/**
 * Central routing configuration for next-intl
 *
 * Korean only, no locale prefix in URL.
 */
export const routing = defineRouting({
  locales: ['ko'],
  defaultLocale: 'ko',
  localePrefix: 'never',
});

export type Locale = (typeof routing.locales)[number];
