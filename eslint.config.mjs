import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "prisma/generated/**",  
    "public/**",
    "*.config.js",           
  ]),

  ...nextVitals,
  ...nextTs,

  {
    rules: {

      "@typescript-eslint/no-explicit-any": "error",

      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/return-await": ["error", "in-try-catch"],

      "no-console": [
        "warn",
        { allow: ["error", "warn"] }, 
      ],

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",      
          varsIgnorePattern: "^_",      
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "prefer-const": "error",
      "no-var": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/self-closing-comp": ["warn", { component: true, html: true }],
    },
  },
]);

export default eslintConfig;