# 🏗 Arquitectura del Proyecto Escuela

Este documento describe detalladamente la estructura técnica, los patrones de diseño y la organización del **Proyecto Escuela**. El sistema ha sido diseñado bajo los principios **SOLID** y una **Arquitectura de Capas** para garantizar mantenibilidad, legibilidad y facilidad de pruebas.

---

## 📐 Diagrama de Arquitectura

```mermaid
graph TD
    subgraph Cliente [Frontend (Vue.js 3)]
        Vue[Componentes .vue]
        Router[Vue Router]
        API_Client[clienteApi.js (Fetch/XHR)]

        Vue --> Router
        Router --> API_Client
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
            ServiciosExt[Servicios Externos: Correo, Imagen, Archivos]
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

    subgraph Persistencia [Almacenamiento]
        DB[(SQLite3)]
        FS[Sistema de Archivos /upload]
    end

    API_Client -- HTTP Fetch/XHR Req --> Rutas
    Repositorios -- SQL Queries --> DB
    ServiciosExt -- Write/Read --> FS
```

---

## 📂 Capas del Sistema (Backend)

El backend está organizado en tres capas principales que separan las responsabilidades de forma estricta:

### 1. Capa de Presentación (Controladores)
*   **Ubicación:** `private/controladores/`
*   **Responsabilidad:** Manejar la entrada y salida HTTP. Recibe los objetos `peticion` (request) y `respuesta` (response) de Express.
*   **Regla:** No debe contener lógica de negocio ni consultas directas a la base de datos. Su única misión es extraer datos de la petición, llamar al servicio correspondiente y devolver el resultado (o el error) al cliente.

### 2. Capa de Negocio (Servicios)
*   **Ubicación:** `private/servicios/`
*   **Responsabilidad:** Es el "corazón" de la aplicación. Aquí residen las reglas de negocio, validaciones complejas y la orquestación de procesos.
*   **Regla:** Es agnóstica al transporte. No sabe si la petición viene de HTTP, de una consola o de una prueba. Utiliza los Repositorios para obtener o guardar datos.

### 3. Capa de Datos (Repositorios)
*   **Ubicación:** `private/repositorios/`
*   **Responsabilidad:** Encapsular toda la interacción con la base de datos (SQLite).
*   **Regla:** Solo debe encargarse de ejecutar consultas SQL y devolver objetos de datos simples. Implementa una clase `RepositorioBase` para reutilizar lógica común de consulta.

---

## 💉 Inyección de Dependencias (DI)

Para evitar el acoplamiento fuerte (que una clase dependa directamente de la creación de otra), el proyecto utiliza un **Contenedor de Dependencias** (`private/contenedor.js`).

*   **Composition Root:** Al iniciar la aplicación, el contenedor instancia todos los Repositorios, luego los Servicios (inyectándoles los Repositorios) y finalmente los Controladores (inyectándoles los Servicios).
*   **Beneficio:** Esto permite cambiar un componente por otro fácilmente o usar "Mocks" durante las pruebas unitarias sin modificar el código fuente de las clases.

---

## 🌐 Frontend (Vue.js 3 + Vite)

El frontend ha sido migrado de Vanilla JS a **Vue.js 3**, utilizando una arquitectura de componentes reactivos y **Vite** como herramienta de construcción.

### Estructura de la SPA
*   **Vistas (`src/vistas/`):** Representan las páginas completas (Inicio, Eventos, Admin).
*   **Componentes (`src/componentes/`):** Partes reutilizables de la UI (Barra de Navegación, Pie de Página, Visor de Imágenes).
*   **Enrutador (`src/router/`):** Gestiona la navegación del lado del cliente sin recargar la página.

### Comunicación API (`src/api/clienteApi.js`)
Se mantiene el uso de **AJAX** para la comunicación con el backend:
1.  **Fetch API:** Utilizado para operaciones estándar (GET, POST, DELETE).
2.  **XMLHttpRequest (XHR):** Utilizado exclusivamente para la subida de archivos con seguimiento de progreso, integrado dentro de la lógica reactiva de los componentes de Vue.

---

## 🔐 Seguridad y Errores
*   **JWT (JSON Web Tokens):** Se utiliza para mantener el estado de la sesión de forma segura y sin estado en el servidor. El token se guarda en el `localStorage` del navegador.
*   **Manejo Centralizado de Errores:** Existe un intermediario (middleware) en `private/intermediarios/manejadorErrores.js` que captura cualquier fallo en la cadena de ejecución y devuelve una respuesta JSON coherente al cliente, evitando fugas de información sensible en los logs de error del navegador.
