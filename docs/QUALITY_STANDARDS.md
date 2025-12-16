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
-   **Sangría (Identación)**: 2 espacios.
-   **Comillas**: Simples (`'`).
-   **Punto y coma**: Obligatorio al final de las sentencias.
-   **Variables**: Preferir `const` y `let`. Evitar `var`.
-   **Funciones**: Preferir *Funciones Flecha* (Arrow Functions) para funciones anónimas.

### Convenciones de Nombres
-   **Archivos**: `kebab-case` (minúsculas separadas por guiones, ej. `controlador-usuario.js`).
-   **Clases**: `PascalCase` (Primera letra mayúscula, ej. `ControladorUsuario`).
-   **Variables/Funciones**: `camelCase` (primera minúscula, siguientes mayúsculas, ej. `obtenerUsuario`).
-   **Constantes**: `UPPER_SNAKE_CASE` (mayúsculas con guion bajo, ej. `MAX_INTENTOS`).

## 4. Pruebas (Testing)
-   Todos los nuevos módulos deben incluir pruebas unitarias.
-   Usar `npm test` para ejecutar el conjunto de pruebas.
-   Mínimo de cobertura aceptable: 70% (objetivo futuro).

## 5. Control de Versiones (Git)
-   **Mensajes de Confirmación (Commits)**: Usar verbos en imperativo en español (ej. "Agregar validación de login", "Arreglar error al iniciar").
-   **Ramas (Branches)**:
    -   `feature/nombre-funcionalidad` (para nuevas características)
    -   `bugfix/nombre-error` (para correcciones)
