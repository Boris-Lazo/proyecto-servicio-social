# 🏫 Proyecto Escuela

![Node.js Version](https://img.shields.io/badge/Node.js-14%2B-green)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-success)

Bienvenido a la documentación técnica del **Proyecto Escuela**. Esta aplicación web integral sirve como portal público para la comunidad educativa y como sistema de gestión de contenidos (CMS) para la administración de la institución.

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

## 📸 Capturas de Pantalla
*(Espacio reservado para screenshots del sistema)*

| Login Administrativo | Gestión de Álbumes | Vista Pública |
|:---:|:---:|:---:|
| ![Login](public/img/screenshots/login.png) | ![Admin](public/img/screenshots/admin.png) | ![Public](public/img/screenshots/public.png) |

---

## 🏗 Arquitectura del Sistema
El proyecto sigue una arquitectura **Cliente-Servidor** desacoplada pero servida monolíticamente para facilitar el despliegue.

*   **Cliente (Frontend):** Archivos estáticos (`HTML/CSS/JS`) alojados en `public/`. Se comunica con el servidor mediante peticiones asíncronas (`fetch`).
*   **Servidor (Backend):** Una aplicación **Node.js/Express** alojada en `private/`. Maneja la lógica de negocio, la autenticación y la persistencia de datos en **SQLite**.

---

## 💻 Stack Tecnológico

### Backend (Servidor)
*   **Runtime:** Node.js
*   **Framework:** Express.js (v5.x)
*   **Base de Datos:** SQLite3 (Serverless, basada en archivo local)
*   **Autenticación:** JWT (JSON Web Tokens) + Bcryptjs
*   **Manejo de Archivos:** Multer (Subida de imágenes y PDFs)
*   **Emails:** Nodemailer (Sistema de recuperación de contraseñas)
*   **Calidad:** ESLint (Linting), Prettier (Formato), Jest (Testing)

### Frontend (Cliente)
*   **Lenguajes:** HTML5 Semántico, CSS3 (Diseño Responsivo/Vanilla), JavaScript (ES6+)
*   **Comunicación:** Fetch API
*   **Librerías:** Ninguna (Zero-dependency frontend para máximo rendimiento)

---

## 📂 Estructura de Directorios

```text
proyecto-escuela/
├── LICENSE               # Licencia MIT
├── .env                  # Variables de entorno (Credenciales, claves secretas) — NO SUBIR A REPO
├── README.md             # Esta documentación
├── private/              # LÓGICA DEL SERVIDOR (BACKEND)
│   ├── db/
│   │   ├── escuela.sqlite  # Archivo de Base de Datos
│   │   └── init.js         # Script de creación de tablas y seeds
│   ├── middleware/
│   │   ├── auth.js         # Verificación de Token JWT
│   │   └── errorHandler.js # Manejo centralizado de errores
│   ├── upload/             # ALMACENAMIENTO DE ARCHIVOS
│   │   ├── albums/         # Carpetas generadas dinámicamente por álbum
│   │   └── docs/           # Archivos PDF subidos
│   ├── server.js           # Punto de entrada de la aplicación (API Routes + Config)
│   └── package.json        # Dependencias del backend
└── public/               # INTERFAZ DE USUARIO (FRONTEND)
    ├── css/                # Hojas de estilo por página (admin.css, login.css, etc.)
    ├── js/                 # Lógica del cliente (admin.js, login.js, etc.)
    ├── img/                # Assets estáticos del sitio
    ├── index.html          # Página principal
    ├── admin.html          # Dashboard (Protegido)
    ├── login.html          # Login
    └── [otras vistas]      # documentos.html, eventos.html, recuperar.html
```

---

## 🗄 Esquema de Base de Datos
El sistema utiliza **SQLite**. Las tablas se generan automáticamente en `private/db/init.js`.

### 1. `users` (Usuarios Administrativos)
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | INTEGER PK | Identificador único |
| `user` | TEXT UNIQUE | Correo electrónico (ej. directora@...) |
| `hash` | TEXT | Contraseña encriptada con Bcrypt |
| `created_at` | DATETIME | Fecha de creación |

### 2. `albums` (Galerías de Fotos)
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | TEXT PK | Slug único generado (ej. "2024-05-dia-madre") |
| `titulo` | TEXT | Título del evento |
| `fecha` | DATE | Fecha del evento |
| `descripcion`| TEXT | Descripción opcional |
| `fotos` | TEXT | Array JSON con los nombres de archivo `["img1.jpg", "img2.jpg"]` |

### 3. `docs` (Documentos PDF)
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | INTEGER PK | Identificador único |
| `titulo` | TEXT | Nombre visible del documento |
| `mes` | TEXT | Mes de referencia (Formato "YYYY-MM") |
| `filename` | TEXT | Nombre físico del archivo en el servidor |

### 4. `password_resets` (Seguridad)
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `token` | TEXT | Código temporal de 6 dígitos |
| `user_email` | TEXT | Usuario que solicitó el cambio |
| `expires_at` | INTEGER | Timestamp de expiración (15 minutos) |

---

## 🔌 Documentación de la API
Todas las respuestas de la API son en formato **JSON**.

### Autenticación
*   `POST /api/login`: Recibe `{user, password}`. Retorna `{token}` si es exitoso.
*   `POST /api/recover`: Inicia proceso de recuperación de contraseña.
*   `POST /api/recover/change`: Finaliza cambio de contraseña con token.
*   `POST /api/change-password` 🔒: Cambiar contraseña estando logueado.

### Área: Álbumes
*   `GET /api/albums`: Lista todos los álbumes (Público).
*   `POST /api/albums` 🔒: Crea un álbum. Requiere `multipart/form-data` con campos `titulo`, `fecha`, `descripcion` y archivos `fotos` (Max 30).
*   `DELETE /api/albums/:id` 🔒: Elimina un álbum y sus archivos del disco.

### Área: Documentos
*   `GET /api/docs`: Lista documentos organizados por mes.
*   `POST /api/docs` 🔒: Sube un PDF. Requiere `multipart/form-data` con `titulo`, `mes` y archivo `doc` (PDF).
*   `DELETE /api/docs/:id` 🔒: Elimina un documento.

*(🔒 indica que requiere Header `Authorization: Bearer <TOKEN>`)*

---

## ⚙️ Instalación y Configuración

### 1. Prerrequisitos
*   Node.js (v14 o superior recomendado)
*   NPM (Viene con Node)

### 2. Configuración de Entorno
Crea un archivo `.env` dentro de la carpeta `/root` (o vincula correctamente desde `/private`) con las siguientes variables:

```env
# Servidor
PORT=4000
JWT_SECRET=tu_secreto_super_seguro_cambiar_esto

# Credenciales de Email (Para recuperación de contraseña)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
SMTP_FROM=notificaciones@escuela.edu.sv

# Usuarios Iniciales (Se crean la primera vez que corre la DB)
USER_DIRECTORA_PASS=clave_temporal_1
USER_SUBDIRECTORA_PASS=clave_temporal_2
USER_DEV_PASS=clave_temporal_3
```

### 3. Ejecución
```bash
cd private
npm install    # Instala dependencias
npm start      # Inicia el servidor
```
El servidor estará disponible en: `http://localhost:4000`.

### 4. Verificación y Calidad
El proyecto incluye herramientas para asegurar la calidad del código:

```bash
# Ejecutar pruebas unitarias/integración
npm test

# Analizar código en busca de errores (Linting)
npm run lint

# Corregir formato de código automáticamente
npm run format
```

---

## 🛡 Seguridad
Este proyecto implementa varias capas de seguridad estándar:
1.  **Protección de Rutas:** Middleware `auth.js` intercepta peticiones sin token válido.
2.  **Sanitización:** SQLite previenen inyecciones SQL básicas mediante el uso de *Prepared Statements*.
3.  **No-Cache de Credenciales:** Las contraseñas nunca se viajan en texto plano excepto en el login (HTTPS recomendado en producción).
4.  **Validación de Archivos:** El backend verifica tipos MIME (solo imágenes para álbumes, solo PDF para docs) antes de guardar nada en el disco, evitando subida de scripts maliciosos.

---

## 🤝 Contribución
Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1.  Haz un Fork del proyecto.
2.  Crea tu rama de funcionalidad (`git checkout -b feature/nueva-funcionalidad`).
3.  Haz Commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`).
4.  Push a la rama (`git push origin feature/nueva-funcionalidad`).
5.  Abre un Pull Request.

---

## ✍️ Autores y Licencia
Este proyecto es desarrollado por el equipo técnico del **Proyecto Escuela**.

Distribuido bajo la licencia **MIT**. Ver `LICENSE` para más información.
