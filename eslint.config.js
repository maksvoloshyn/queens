import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
    {
        ignores: ['dist', 'node_modules', '.system_generated'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.vue', '**/*.ts', '**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: ['.vue'],
                sourceType: 'module',
            },
        },
    },
    {
        rules: {
            'vue/multi-word-component-names': 'off', // Common override for Vue 3 projects
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-unused-vars': 'off', // Let TS eslint rule handle it
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-empty-object-type': 'off', // Allow {} in TypeScript typings
            'no-useless-assignment': 'warn', // Downgrade useless assignments to warnings
        },
    },
    eslintConfigPrettier,
);
