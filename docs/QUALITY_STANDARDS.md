# Estándares de Calidad y Codificación

## 1. Introducción
Este documento define los estándares técnicos para mantener la calidad del código en el **Proyecto Escuela**.

## 2. Herramientas de Calidad
Utilizamos las siguientes herramientas automatizadas:
-   **ESLint**: Para análisis estático de código (detectar errores y malas prácticas).
-   **Prettier**: Para formateo automático de código.
-   **Jest**: Para pruebas unitarias e integración.

## 3. Guía de Estilo

### JavaScript (General)
-   **Identación**: 2 espacios.
-   **Comillas**: Simples (`'`).
-   **Punto y coma**: Obligatorio al final de las sentencias.
-   **Variables**: Preferir `const` y `let`. Evitar `var`.
-   **Funciones**: Preferir *Arrow Functions* para callbacks y funciones anónimas.

### Naming Conventions
-   **Archivos**: `kebab-case` (ej. `user-controller.js`).
-   **Clases**: `PascalCase` (ej. `UserController`).
-   **Variables/Funciones**: `camelCase` (ej. `getUser`).
-   **Constantes**: `UPPER_SNAKE_CASE` (ej. `MAX_RETRIES`).

## 4. Pruebas (Testing)
-   Todos los nuevos módulos deben incluir pruebas unitarias.
-   Usar `npm test` para ejecutar la suite de pruebas.
-   Mínimo de cobertura aceptable: 70% (objetivo futuro).

## 5. Control de Versiones (Git)
-   **Commits**: Usar verbos en imperativo (ej. "Add login validation", "Fix crash on startup").
-   **Ramas**: `feature/nombre-feature`, `bugfix/nombre-bug`.
