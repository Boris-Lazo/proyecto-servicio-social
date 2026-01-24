# Estándares de Calidad y Codificación

## 1. Introducción
Este documento define los estándares técnicos para mantener la calidad del código en el **Proyecto Escuela**, enfocándose en la arquitectura SOLID y el uso del idioma español en el desarrollo.

## 2. Arquitectura y Diseño
El proyecto sigue una **Arquitectura de Capas** para garantizar el desacoplamiento y la testabilidad:
-   **Controladores**: Única capa que conoce el protocolo HTTP.
-   **Servicios**: Donde reside la lógica de negocio pura. No conocen HTTP ni la base de datos directamente.
-   **Repositorios**: Encargados únicamente de las consultas a la base de datos.
-   **Inyección de Dependencias**: Todas las dependencias deben inyectarse a través del constructor.

## 3. Idioma y Nomenclatura
**Todo el nuevo código debe escribirse en español.**
-   **Variables y Funciones**: `camelCase` en español (ej. `obtenerUsuario`).
-   **Clases**: `PascalCase` en español (ej. `RepositorioAlbum`).
-   **Archivos**: `PascalCase` para clases y `kebab-case` para otros archivos (ej. `ControladorAuth.js`, `cliente-api.js`).
-   **Comentarios**: Siempre en español, explicando el *porqué* más que el *qué*.

## 4. Herramientas de Calidad
-   **ESLint**: Configurado para detectar errores comunes.
-   **Prettier**: Asegura un formato consistente.
-   **Jest**: Marco de pruebas para unitarias e integración.

## 5. Pruebas (Testing)
-   Cada nueva funcionalidad en la capa de **Servicio** o **Repositorio** debe tener su prueba correspondiente.
-   Los controladores se prueban idealmente mediante pruebas de integración.

## 6. Git y Commits
-   Mensajes en español y tiempo imperativo: "Refactorizar capa de datos", "Corregir bug en login".
