import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper para mantener la compatibilidad con las reglas nativas de Next.js
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // 1. Ignorar carpetas de compilación y dependencias
  {
    ignores: [
      ".next/*",
      "node_modules/*",
      "dist/*",
      "out/*",
      "build/*"
    ],
  },

  // 2. Extender las configuraciones recomendadas de Next.js y Core Web Vitals
  ...compat.extends("next/core-web-vitals"),

  // 3. Configuración principal para archivos TypeScript (React / Next.js)
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react": reactPlugin,
      "react-hooks": hooksPlugin,
    },
    rules: {
      // === 🛠️ REGLAS DE TYPESCRIPT ===
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_", 
        varsIgnorePattern: "^_" 
      }], // Advierte variables no usadas, excepto las que empiezan con barra baja (ej: _index)
      "@typescript-eslint/no-explicit-any": "warn", // Evita el uso descontrolado de 'any', prefiere 'unknown'
      "@typescript-eslint/consistent-type-imports": ["error", { 
        prefer: "type-imports" 
      }], // Fuerza a importar tipos usando 'import type { ... }' (mejora el tree-shaking)

      // === ⚛️ REGLAS DE REACT ===
      "react/react-in-jsx-scope": "off", // Desactivado (Next.js/React 17+ ya no lo necesitan)
      "react/prop-types": "off", // Desactivado (TypeScript ya se encarga de la validación de props)
      "react/self-closing-comp": "error", // Fuerza a cerrar etiquetas vacías automáticamente (ej: <Component />)
      "react-hooks/rules-of-hooks": "error", // Verifica las reglas de los Hooks a rajatabla
      "react-hooks/exhaustive-deps": "warn", // Advierte cuando faltan dependencias en useEffect/useCallback

      // === 🚀 REGLAS DE NEXT.JS & CALIDAD ===
      "no-console": ["warn", { allow: ["warn", "error"] }], // Evita dejar console.logs de debug en producción
      "prefer-const": "error", // Si una variable no se reasigna, debe ser 'const'
      "no-debugger": "error", // Prohibido usar debbuger en código final
    },
  },
];