import { defineConfig, globalIgnores } from "eslint/config";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Отключаем проблемные правила react пока eslint-plugin-react не совместим с ESLint 10
      "react/display-name": "off",
      "react/prop-types": "off",
    },
  },
]);

export default eslintConfig;
