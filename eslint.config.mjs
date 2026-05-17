import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import prettierConfig from "eslint-config-prettier"
import { defineConfig, globalIgnores } from "eslint/config"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Prettier must be last to override other formatting rules
  prettierConfig,
  globalIgnores([
    ".backup/**",
    ".next/**",
    ".omx/**",
    "build/**",
    "next-env.d.ts",
    "out/**",
    "node_modules/**",
    "pnpm-lock.yaml",
  ]),
])

export default eslintConfig
