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

## Descripción de Componentes

### Frontend (`public/`)
*   **Páginas HTML**: Interfaz de usuario (`index.html`, `admin.html`).
*   **Javascript**: Lógica de interacción y manipulación del DOM.
*   **cliente-api.js**: Abstracción para realizar peticiones HTTP al backend, manejando tokens y errores.

### Backend (`private/`)
*   **servidor.js**: Punto de entrada. Configura Express, Middlewares y CORS.
*   **contenedor.js**: "Composition Root". Instancia todas las clases (Repositorios, Servicios, Controladores) e inyecta las dependencias.
*   **Capa de Presentación**:
    *   **Rutas**: Definen los endpoints (API REST).
    *   **Controladores**: Reciben la `request`, extraen datos y llaman a los servicios. Responden con `response`.
*   **Capa de Negocio (Servicios)**: Contiene la lógica principal (validaciones, reglas de negocio, orquestación). No saben de HTTP ni de SQL.
*   **Capa de Datos (Repositorios)**: Abstraen el acceso a la base de datos. Ejecutan las consultas SQL.

### Persistencia
*   **SQLite**: Base de datos relacional ligera almacenada en archivo.
