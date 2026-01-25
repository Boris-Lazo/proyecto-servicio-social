# Arquitectura del Proyecto Escuela

Este documento describe la arquitectura de alto nivel del proyecto, siguiendo el patrón de diseño implementado (Capas + Inyección de Dependencias).

```mermaid
graph TD
    subgraph Cliente [Frontend (Navegador)]
        HTML[Páginas HTML]
        JS[Lógica JS (Frontend)]
        API_Client[cliente-api.js]

        HTML --> JS
        JS --> API_Client
    end

    subgraph Servidor [Backend (Node.js/Express)]
        Server[servidor.js]
        Container[contenedor.js]

        subgraph CapaPresentacion [Capa de Presentación (HTTP)]
            Rutas[Rutas (Express)]
            Controladores[Controladores]
        end

        subgraph CapaNegocio [Capa de Lógica de Negocio]
            Servicios[Servicios]
            ServiciosExt[Servicios Externos (Correo, Almacenamiento)]
        end

        subgraph CapaDatos [Capa de Acceso a Datos]
            Repositorios[Repositorios]
        end

        Server -- Inicializa --> Container
        Server -- Usa --> Rutas
        Container -- Inyecta Dependencias --> Controladores
        Container -- Inyecta Dependencias --> Servicios
        Container -- Inyecta Dependencias --> Repositorios

        Rutas --> Controladores
        Controladores --> Servicios
        Servicios --> Repositorios
        Servicios --> ServiciosExt
    end

    subgraph Persistencia [Base de Datos]
        DB[(SQLite3)]
    end

    API_Client -- HTTP Fetch Req --> Rutas
    Repositorios -- SQL Queries --> DB
```

El sistema ha sido rediseñado para seguir una arquitectura limpia, basada en capas y orientada a los principios **SOLID**. El objetivo es facilitar el mantenimiento, la escalabilidad y la realización de pruebas automatizadas.

## 📐 Capas del Sistema

### 1. Capa de Presentación (Controladores)
Ubicada en `private/controladores/`.
-   Recibe las peticiones HTTP (req) y devuelve las respuestas (res).
-   No contiene lógica de negocio.
-   Delega el trabajo pesado a la capa de servicios.

### 2. Capa de Negocio (Servicios)
Ubicada en `private/servicios/`.
-   Contiene las reglas de negocio de la aplicación.
-   Es independiente del transporte (HTTP) y de la base de datos específica.
-   Utiliza los repositorios para acceder a los datos.

### 3. Capa de Datos (Repositorios)
Ubicada en `private/repositorios/`.
-   Encapsula toda la interacción con SQLite.
-   Implementa una clase base `RepositorioBase` para consultas comunes.
-   Permite cambiar la base de datos en el futuro con un impacto mínimo en el resto del sistema.

## 💉 Inyección de Dependencias
Se utiliza un enfoque de inyección por constructor gestionado centralizadamente en `private/contenedor.js` (Composition Root). Esto evita el acoplamiento fuerte entre clases y facilita el uso de "mocks" durante las pruebas.

## 🔐 Seguridad y Errores
-   **Middlewares**: Ubicados en `private/intermediarios/`, gestionan la autenticación JWT, limitación de peticiones (Rate Limit) y validación de esquemas con Zod.
-   **Errores**: Se utiliza una jerarquía de errores en `private/errores/` para manejar fallos de forma semántica (ej. `ErrorNoEncontrado`, `ErrorValidacion`).

## 🌐 Frontend
El frontend se mantiene simple y ligero (Vanilla JS), pero ahora utiliza un cliente de API centralizado (`public/js/servicios/cliente-api.js`) que encapsula la lógica de autenticación y manejo de errores para todas las vistas.
