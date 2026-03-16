import { defineConfig, globalIgnores } from 'eslint/config';
import nextTs from 'eslint-config-next/typescript';
import security from 'eslint-plugin-security';

const eslintConfig = defineConfig([
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    plugins: {
      security,
    },
    rules: {
      // Отключаем проблемные правила react пока eslint-plugin-react не совместим с ESLint 10
      'react/display-name': 'off',
      'react/prop-types': 'off',

      // Security — уязвимости (отключаем ложные срабатывания для React/Next.js)
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-non-literal-regexp': 'off',
      'security/detect-non-literal-require': 'off',
      'security/detect-possible-timing-attacks': 'off',
      'security/detect-pseudoRandomBytes': 'off',
      'security/detect-unsafe-regex': 'off',
    },
  },
]);

export default eslintConfig;
