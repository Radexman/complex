// Self-contained copy of the root Prettier config. Prettier resolves config by
// walking up from each file, but `sanity typegen` (run during the Vercel build,
// which installs only the frontend workspace) needs the config — and its
// `@sanity/prettier-config` dependency — resolvable from frontend's own
// node_modules. Importing the root config would walk up to the (uninstalled)
// root node_modules and fail, so we duplicate the override here.
// Keep in sync with ../prettier.config.mjs.
import sanityConfig from '@sanity/prettier-config';

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
