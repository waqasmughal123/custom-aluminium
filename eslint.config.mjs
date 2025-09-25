import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Import organization rules
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external", 
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before"
            },
            {
              pattern: "../**",
              group: "parent",
              position: "before"
            },
            {
              pattern: "../../views/components/**",
              group: "internal", 
              position: "after"
            }
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "never",
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          }
        }
      ],
      // Component organization rules
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../../*"],
              message: "Avoid deep relative imports. Consider using absolute imports or moving components closer."
            }
          ]
        }
      ]
    }
  }
];

export default eslintConfig;
