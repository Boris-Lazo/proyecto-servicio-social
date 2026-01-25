# 🏫 Proyecto Escuela

![Node.js Version](https://img.shields.io/badge/Node.js-14%2B-green)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-success)

Bienvenido a la documentación técnica del **Proyecto Escuela**. Esta aplicación web integral sirve como portal público para la comunidad educativa y como sistema de gestión de contenidos (CMS) para la administración de la institución.

El proyecto ha sido recientemente refactorizado siguiendo principios **SOLID** y una arquitectura de capas, y todo el código ha sido traducido íntegramente al **español**.

---

## 📋 Tabla de Contenidos
1. [Visión General](#-visión-general)
2. [Capturas de Pantalla](#-capturas-de-pantalla)
3. [Arquitectura del Sistema](#-arquitectura-del-sistema)
4. [Stack Tecnológico](#-stack-tecnológico)
5. [Estructura de Directorios](#-estructura-de-directorios)
6. [Esquema de Base de Datos](#-esquema-de-base-de-datos)
7. [Documentación de la API](#-documentación-de-la-api)
8. [Instalación y Configuración](#-instalación-y-configuración)
9. [Seguridad](#-seguridad)
10. [Contribución](#-contribución)
11. [Autores y Licencia](#-autores-y-licencia)

---

## 🔭 Visión General
El sistema permite a la escuela mantener a los padres y alumnos informados sobre eventos y circulares, mientras ofrece a la dirección herramientas sencillas para actualizar este contenido sin necesidad de tocar código.

*   **Público:** Puede ver galerías de fotos de eventos recientes y descargar documentos PDF (circulares, avisos).
*   **Administrativo:** Permite subir álbumes de fotos masivos, gestionar documentos PDF y administrar la seguridad del sitio.

---

## 🏗 Arquitectura del Sistema
El proyecto sigue una arquitectura **Cliente-Servidor** desacoplada. El backend ha sido rediseñado bajo una **Arquitectura de Capas** y principios **SOLID**:

*   **Cliente (Frontend):** Archivos estáticos (`HTML/CSS/JS`) alojados en `public/`. Utiliza un cliente de API centralizado (`cliente-api.js`).
*   **Servidor (Backend):** Aplicación **Node.js/Express** en `private/`.
    *   **Controladores:** Manejan la entrada/salida HTTP.
    *   **Servicios:** Contienen la lógica de negocio.
    *   **Repositorios:** Gestionan la persistencia en la base de datos.
    *   **Contenedor de Dependencias:** Gestiona la inyección de dependencias (`contenedor.js`).

---

## 💻 Stack Tecnológico

### Backend (Servidor)
*   **Runtime:** Node.js
*   **Framework:** Express.js (v5.x)
*   **Base de Datos:** SQLite3
*   **Autenticación:** JWT (JSON Web Tokens) + Bcryptjs
*   **Inyección de Dependencias:** Implementación nativa mediante constructor.
*   **Calidad:** ESLint, Prettier, Jest (Testing)

### Frontend (Cliente)
*   **Lenguajes:** HTML5 Semántico, CSS3, JavaScript (ES6+)
*   **Comunicación:** Fetch API (encapsulada en `cliente-api.js`)
*   **Seguridad:** Sanitización XSS manual.

---

## 📂 Estructura de Directorios

```text
proyecto-escuela/
├── .env                  # Variables de entorno
├── private/              # BACKEND (Lógica del servidor)
│   ├── base_de_datos/    # SQLite e inicialización
│   ├── configuracion/    # Configuración de App, JWT, Multer, etc.
│   ├── controladores/    # Capa de Presentación (HTTP)
│   ├── errores/          # Clases de error personalizadas
│   ├── intermediarios/   # Middlewares (Auth, Errores, Validación)
│   ├── repositorios/     # Capa de Acceso a Datos
│   ├── rutas/            # Definición de Endpoints de la API
│   ├── servicios/        # Capa de Lógica de Negocio
│   ├── contenedor.js     # Composición e Inyección de Dependencias
│   ├── servidor.js       # Punto de entrada de la aplicación
│   └── package.json      # Dependencias y scripts del backend
└── public/               # FRONTEND (Interfaz de Usuario)
    ├── js/
    │   ├── servicios/    # cliente-api.js
    │   └── [lógica]      # admin.js, login.js, etc.
    └── [vistas]          # index.html, admin.html, etc.
```

---

## 🗄 Esquema de Base de Datos
El sistema utiliza **SQLite**. Las tablas se generan automáticamente en `private/base_de_datos/init.js`.

### 1. `users` (Usuarios Administrativos)
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `user` | TEXT UNIQUE | Correo electrónico del usuario |
| `hash` | TEXT | Contraseña encriptada |

### 2. `albums` (Galerías de Fotos)
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | TEXT PK | Slug generado |
| `fotos` | TEXT | Array JSON con nombres de archivo |

---

## 🔌 Documentación de la API
Todas las respuestas de la API son en formato **JSON**.

### Autenticación
*   `POST /api/login`: Iniciar sesión. Cuerpo: `{usuario, contrasena}`.
*   `POST /api/recover`: Solicitar código de recuperación. Cuerpo: `{correo}`.
*   `POST /api/recover/change`: Cambiar contraseña con código. Cuerpo: `{tokenTemporal, nuevaClave}`.

### Gestión
*   `GET /api/albums`: Listar álbumes.
*   `POST /api/albums` 🔒: Crear álbum (Multipart).
*   `GET /api/docs`: Listar documentos.
*   `POST /api/docs` 🔒: Subir PDF (Multipart).

*(🔒 requiere Header `Authorization: Bearer <TOKEN>`)*

---

## ⚙️ Instalación y Configuración

```bash
cd private
npm install
npm start
```
Ejecutar pruebas: `npm test`

---

## ✍️ Autores y Licencia
Distribuido bajo la licencia **MIT**.
