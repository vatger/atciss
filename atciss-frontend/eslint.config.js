import eslint from "@eslint/js"
import eslintReact from "@eslint-react/eslint-plugin"
import tseslint from "typescript-eslint"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import { defineConfig } from "eslint/config"

export default defineConfig({
  ignores: ["build/**"],
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    eslintPluginPrettierRecommended,
    eslintReact.configs["strict-type-checked"],
  ],
  // Configure language/parsing options
  languageOptions: {
    // Use TypeScript ESLint parser for TypeScript files
    parser: tseslint.parser,
    parserOptions: {
      // Enable project service for better TypeScript integration
      projectService: {
        allowDefaultProject: ["eslint.config.js"],
      },
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    "@typescript-eslint/no-invalid-void-type": "off",
    "@typescript-eslint/require-await": "error",
  },
})
