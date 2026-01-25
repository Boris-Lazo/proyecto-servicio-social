# 💎 Estándares de Calidad y Codificación

Este documento define los lineamientos técnicos que garantizan la sostenibilidad y robustez del **Proyecto Escuela**. Todos los colaboradores deben seguir estas reglas para mantener la coherencia del sistema.

---

## 1. Principios de Arquitectura
El código debe escribirse pensando en el largo plazo, siguiendo los principios **SOLID**:
-   **Responsabilidad Única (SRP):** Cada clase (Controlador, Servicio, Repositorio) debe tener una sola razón para cambiar.
-   **Inyección de Dependencias:** No instanciar clases dentro de otras. Pasar las dependencias por el constructor para facilitar el desacoplamiento.
-   **Arquitectura de Capas:** Respetar estrictamente el flujo `Controlador -> Servicio -> Repositorio`.

## 2. Idioma y Nomenclatura
El **español** es el idioma oficial del proyecto para toda la lógica de negocio y documentación técnica.

-   **Variables y Funciones:** `camelCase` en español (ej. `obtenerListaDeAlbumes`).
-   **Clases:** `PascalCase` en español (ej. `ServicioAutenticacion`).
-   **Archivos:** `PascalCase` para clases y `kebab-case` para otros (ej. `ControladorDocumento.js`, `manejador-errores.js`).
-   **Base de Datos:** Se mantiene el uso de identificadores en inglés para compatibilidad técnica (`users`, `albums`), pero se documentan en español.

## 3. Estilo de Código (Linting & Formatting)
El proyecto utiliza herramientas automatizadas para garantizar que el código se vea igual, sin importar quién lo escriba:
-   **ESLint:** Para detectar errores potenciales y malas prácticas.
-   **Prettier:** Para formatear el código automáticamente (espaciado, comillas, punto y coma).

> Antes de subir cualquier cambio, ejecuta: `cd private && npm run format && npm run lint`

## 4. Gestión de Errores
-   Nunca uses `try/catch` vacíos.
-   Lanza errores semánticos definidos en `private/errores/` (ej. `ErrorNoEncontrado`, `ErrorValidacion`).
-   Deja que el `manejadorErrores.js` centralizado se encargue de transformar esos errores en respuestas HTTP adecuadas.

## 5. Pruebas Automatizadas (Testing)
La calidad se demuestra con pruebas. El proyecto cuenta con dos niveles de testing:
1.  **Unitarias (Backend):** Usando **Jest**. Enfocadas en la lógica de los servicios y repositorios.
2.  **E2E (Frontend/Sistema):** Usando **Playwright**. Pruebas de "caja negra" que simulan la navegación real del usuario.

## 6. Seguridad
-   **Sanitización:** Toda entrada del usuario debe ser validada (usando `Zod` en el backend) y saneada antes de mostrarse en el HTML para evitar ataques XSS (usando `sanearHTML` en el frontend).
-   **Secretos:** Nunca subir el archivo `.env` al repositorio. Usa el archivo `.env.example` como guía.
-   **Contraseñas:** Siempre encriptadas con `Bcryptjs` (mínimo 10 rondas de sal).
