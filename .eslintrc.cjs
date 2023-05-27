module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  root: true,
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
