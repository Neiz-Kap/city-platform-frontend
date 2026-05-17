/**
 * Lint-staged configuration
 * Runs linting and formatting on staged files before commit
 */
export default {
  // TypeScript and JavaScript files - run ESLint with auto-fix, then Prettier
  // --no-warn-ignored: Don't warn about files ignored by ESLint config
  '*.{js,jsx,ts,tsx}': ['eslint --fix --quiet', 'prettier --write'],

  // Other file types - run Prettier only
  '*.{json,md,yml,yaml,css,scss,html}': ['prettier --write'],
};
