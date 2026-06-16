import sanityConfig from '@sanity/prettier-config';

/**
 * Project Prettier config: the shared Sanity base with our house overrides.
 * - semi: true              → semicolons at the end of statements
 * - bracketSpacing: true    → spaces inside braces, e.g. { file } not {file}
 * - singleQuote: true       → single quotes (kept from the Sanity base)
 * - trailingComma: 'all'    → trailing commas wherever valid (cleaner diffs)
 *
 * The frontend workspace keeps its own copy of this config so Prettier can
 * resolve it during isolated (frontend-only) Vercel builds — keep the two in sync.
 */
const config = {
  ...sanityConfig,
  semi: true,
  bracketSpacing: true,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'always',
  printWidth: 100,
  tabWidth: 2,
  endOfLine: 'lf',
};

export default config;
