import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "prisma/migrations/**"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
