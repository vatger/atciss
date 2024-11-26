import eslint from "@eslint/js"
import reactPlugin from "eslint-plugin-react"
import tseslint from "typescript-eslint"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  eslintPluginPrettierRecommended,
  reactPlugin.configs.flat.recommended,
  // TODO maybe enable some at some point
  // reactPlugin.configs.flat.all,
  reactPlugin.configs.flat["jsx-runtime"],
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/no-unknown-property": ["error", { ignore: ["sx"] }],
      "react/prop-types": ["error", { ignore: ["pane"] }],
    },
  },
)
