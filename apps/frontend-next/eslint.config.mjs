import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // 未使用変数の警告（アンダースコア始まりは許可）
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // any型の使用を警告
      '@typescript-eslint/no-explicit-any': 'warn',
      // 本番コードでの console 使用を警告（error.tsx / mock / 開発ツールは除く）
      'no-console': ['warn', { allow: ['error'] }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/e2e/testids',
              message: 'Use "@/lib/testing/testids"; production code must not import from e2e/.',
            },
            {
              name: 'next/link',
              message: 'Use the locale-aware Link from "@/i18n/navigation".',
            },
            {
              name: 'next/navigation',
              importNames: ['useRouter', 'usePathname'],
              message: 'Use locale-aware navigation hooks from "@/i18n/navigation".',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['node_modules/', '.next/', 'out/', 'e2e/', '.claude/', '.codex/', 'next-env.d.ts'],
  },
];

export default eslintConfig;
