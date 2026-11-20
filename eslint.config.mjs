import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The taste kit: vendored plain scripts, kept byte-for-byte as the skill ships them.
    "public/assets/**",
    "test-results/**",
    "playwright-report/**",
    ".taste-skill/**",
  ]),
  {
    rules: {
      // Pages link with plain <a> on purpose: each page load starts the taste kit's scripts (nav sheet,
      // hover layer, hero entrance, moments) fresh. In-page state (stock filters) uses the router.
      "@next/next/no-html-link-for-pages": "off",
      // The kit's stylesheets and fonts are linked as plain files (public/assets), as the skill requires.
      "@next/next/no-css-tags": "off",
      "@next/next/no-page-custom-font": "off",
    },
  },
]);

export default eslintConfig;
