# 🏫 Proyecto "Mi Escuelita"

![Versión de Node.js](https://img.shields.io/badge/Node.js-14%2B-green)
![Licencia](https://img.shields.io/badge/Licencia-MIT-blue.svg)
![Estado](https://img.shields.io/badge/Estado-Activo-success)

Bienvenido a la documentación técnica del **Proyecto "Mi Escuelita"**. Esta aplicación web integral sirve como portal público para la comunidad educativa y como un robusto sistema de gestión de contenidos (CMS) para la administración de la institución.

---

## 📋 Tabla de Contenidos
1. [Visión General](#-visión-general)
2. [Características Principales](#-características-principales)
3. [Capturas de Pantalla](#-capturas-de-pantalla)
4. [Arquitectura del Sistema](#-arquitectura-del-sistema)
5. [Stack Tecnológico](#-stack-tecnológico)
6. [Estructura de Directorios](#-estructura-de-directorios)
7. [Esquema de la Base de Datos](#-esquema-de-la-base-de-datos)
8. [Documentación de la API](#-documentación-de-la-api)
9. [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
10. [Seguridad](#-seguridad)
11. [Cómo Contribuir](#-cómo-contribuir)
12. [Autores y Licencia](#-autores-y-licencia)

---

## 🔭 Visión General
El sistema permite a la escuela mantener a padres y alumnos informados sobre eventos y circulares de manera eficiente. Ofrece a la dirección herramientas sencillas para actualizar el contenido sin necesidad de conocimientos técnicos avanzados, promoviendo una comunicación fluida y constante.

---

## ✨ Características Principales

*   **Portal Público:**
    *   **Galería de Eventos:** Visualiza álbumes de fotos de actividades escolares.
    *   **Sección de Documentos:** Accede y descarga circulares, avisos y otros documentos importantes en formato PDF.
    *   **Diseño Adaptable:** Interfaz amigable y accesible desde cualquier dispositivo (móvil, tableta o escritorio).

*   **Panel de Administración (CMS):**
    *   **Gestión de Álbumes:** Sube múltiples imágenes simultáneamente para crear y gestionar galerías de fotos.
    *   **Gestión de Documentos:** Publica y organiza documentos PDF por mes y año.
    *   **Seguridad Integrada:** Sistema de autenticación robusto basado en JWT y recuperación de contraseñas vía correo electrónico.
    *   **Dashboard Intuitivo:** Un panel de control fácil de usar para administrar todo el contenido del sitio.

---

## 📸 Capturas de Pantalla
*(Imágenes de demostración del sistema en funcionamiento)*

| Login Administrativo | Gestión de Álbumes | Vista Pública |
|:---:|:---:|:---:|
| ![Login](ruta/a/login.png) | ![Admin](ruta/a/admin.png) | ![Public](ruta/a/public.png) |

---

## 🏗 Arquitectura del Sistema
El proyecto sigue una arquitectura **Cliente-Servidor**, con una clara separación entre el frontend y el backend, aunque se sirven desde el mismo repositorio para simplificar el despliegue.

*   **Cliente (Frontend):** Construido con archivos estáticos (`HTML`, `CSS`, `JavaScript`). Se encuentra en el directorio `public/` y se comunica con el servidor a través de peticiones asíncronas (`fetch`) a la API REST.
*   **Servidor (Backend):** Una aplicación **Node.js** con **Express**, ubicada en el directorio `private/`. Gestiona toda la lógica de negocio, la autenticación de usuarios y la interacción con la base de datos **SQLite**.

---

## 💻 Stack Tecnológico

### Backend (Servidor)
*   **Entorno de Ejecución:** Node.js
*   **Framework:** Express.js
*   **Base de Datos:** SQLite3 (Serverless, basada en un archivo local para simplicidad y portabilidad).
*   **Autenticación:** JSON Web Tokens (JWT) y `bcryptjs` para el hash de contraseñas.
*   **Manejo de Archivos:** `multer` para la subida de imágenes y documentos PDF.
*   **Envío de Correos:** `nodemailer` para el sistema de recuperación de contraseñas.
*   **Calidad de Código:** ESLint, Prettier y Jest para pruebas unitarias.

### Frontend (Cliente)
*   **Lenguajes:** HTML5 Semántico, CSS3 (con diseño adaptable, sin frameworks), JavaScript (ES6+).
*   **Comunicación con API:** Fetch API nativa del navegador.
*   **Dependencias:** Cero dependencias externas para un rendimiento óptimo y mantenimiento sencillo.

---

## 📂 Estructura de Directorios

```text
proyecto-escuela/
├── .env                  # Variables de entorno (credenciales, secretos). NO versionar.
├── README.md             # Esta documentación.
├── private/              # LÓGICA DEL SERVIDOR (BACKEND)
│   ├── db/
│   │   ├── escuela.sqlite  # Archivo de la base de datos.
│   │   └── init.js         # Script para inicializar tablas y datos.
│   ├── middleware/
│   │   ├── autenticacion.js # Middleware para verificar el token JWT.
│   │   └── manejadorDeErrores.js # Middleware para gestionar errores centralizadamente.
│   ├── upload/             # Almacenamiento de archivos subidos.
│   │   ├── albums/         # Carpetas generadas para cada álbum de fotos.
│   │   └── docs/           # Archivos PDF.
│   ├── server.js           # Punto de entrada de la API y configuración del servidor.
│   └── package.json        # Dependencias del backend.
└── public/               # INTERFAZ DE USUARIO (FRONTEND)
    ├── css/                # Hojas de estilo.
    ├── js/                 # Lógica del cliente.
    ├── img/                # Imágenes y otros recursos estáticos.
    ├── index.html          # Página principal.
    ├── admin.html          # Panel de administración (protegido).
    └── ...                 # Otras páginas HTML.
```

---

## 🗄 Esquema de la Base de Datos
Se utiliza **SQLite** para la persistencia de datos. El script `private/db/init.js` se encarga de crear las tablas si no existen.

### 1. `users` (Usuarios Administrativos)
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | INTEGER PK | Identificador único. |
| `user` | TEXT UNIQUE | Correo electrónico del usuario. |
| `hash` | TEXT | Contraseña encriptada con Bcrypt. |
| `created_at` | DATETIME | Fecha de creación del registro. |

### 2. `albums` (Galerías de Fotos)
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | TEXT PK | Identificador único generado (ej. "2024-05-dia-de-la-madre"). |
| `titulo` | TEXT | Título del evento. |
| `fecha` | DATE | Fecha en que ocurrió el evento. |
| `descripcion`| TEXT | Descripción opcional del álbum. |
| `fotos` | TEXT | Array en formato JSON con los nombres de los archivos. |

### 3. `docs` (Documentos PDF)
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | INTEGER PK | Identificador único. |
| `titulo` | TEXT | Nombre público del documento. |
| `mes` | TEXT | Mes de referencia en formato "YYYY-MM". |
| `filename` | TEXT | Nombre del archivo físico en el servidor. |

### 4. `password_resets` (Recuperación de Contraseña)
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `token` | TEXT | Código temporal de 6 dígitos. |
| `user_email` | TEXT | Correo del usuario que solicitó el cambio. |
| `expires_at` | INTEGER | Marca de tiempo de expiración (15 minutos). |

---

## 🔌 Documentación de la API
Todas las respuestas de la API son en formato **JSON**.

### Autenticación
*   `POST /api/login`: Recibe `{user, password}`. Retorna un `{token}` si las credenciales son correctas.
*   `POST /api/recover`: Inicia el proceso de recuperación de contraseña.
*   `POST /api/recover/change`: Finaliza el cambio de contraseña usando un token temporal.
*   `POST /api/change-password` 🔒: Permite a un usuario autenticado cambiar su propia contraseña.

### Gestión de Álbumes
*   `GET /api/albums`: Lista todos los álbumes para el público.
*   `POST /api/albums` 🔒: Crea un nuevo álbum. Requiere `multipart/form-data`.
*   `DELETE /api/albums/:id` 🔒: Elimina un álbum y todos sus archivos asociados.

### Gestión de Documentos
*   `GET /api/docs`: Lista todos los documentos públicos.
*   `POST /api/docs` 🔒: Sube un nuevo documento PDF. Requiere `multipart/form-data`.
*   `DELETE /api/docs/:id` 🔒: Elimina un documento y su archivo asociado.

*(🔒 indica que el endpoint requiere un token de autenticación en la cabecera `Authorization: Bearer <TOKEN>`)*

---

## ⚙️ Instalación y Puesta en Marcha

### 1. Prerrequisitos
*   **Node.js:** Versión 14 o superior.
*   **NPM:** Se instala automáticamente con Node.js.

### 2. Configuración del Entorno
1.  Clona este repositorio en tu máquina local.
2.  Crea un archivo `.env` en la raíz del proyecto (al mismo nivel que `README.md`).
3.  Copia y pega el siguiente contenido en el archivo `.env`, reemplazando los valores con tus propias credenciales:

```env
# Configuración del servidor
PORT=4000
JWT_SECRET=tu_secreto_super_seguro_y_largo

# Credenciales de Email (se recomienda usar una cuenta de Gmail con contraseña de aplicación)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion_de_gmail
SMTP_FROM=notificaciones@tu-escuela.com

# Contraseñas para los usuarios iniciales (se crearán al iniciar el servidor por primera vez)
USER_DIRECTORA_PASS=clave_segura_para_directora
USER_SUBDIRECTORA_PASS=clave_segura_para_subdirectora
USER_DEV_PASS=clave_segura_para_desarrollador
```

### 3. Ejecución de la Aplicación
Abre una terminal en la raíz del proyecto y ejecuta los siguientes comandos:

```bash
# Navega a la carpeta del backend
cd private

# Instala las dependencias
npm install

# Inicia el servidor
npm start
```
El servidor se iniciará y estará disponible en `http://localhost:4000`. La primera vez que se inicie, creará la base de datos y los usuarios iniciales.

### 4. Herramientas de Calidad de Código
Para mantener un código limpio y funcional, puedes usar los siguientes comandos:

```bash
# Ejecutar pruebas (desde la carpeta /private)
npm test

# Analizar el código en busca de errores
npm run lint

# Formatear el código automáticamente
npm run format
```

---

## 🛡 Seguridad
Este proyecto implementa varias medidas de seguridad estándar para proteger la aplicación y sus datos:
1.  **Protección de Rutas:** El middleware `autenticacion.js` protege las rutas que requieren autenticación.
2.  **Prevención de Inyección SQL:** Se utilizan *prepared statements* de SQLite para evitar ataques de inyección SQL.
3.  **Manejo Seguro de Contraseñas:** Las contraseñas se almacenan hasheadas con `bcrypt` y nunca se transmiten en texto plano (se recomienda HTTPS en producción).
4.  **Validación de Archivos:** El backend valida el tipo de archivo (MIME type) antes de guardarlo, previniendo la subida de scripts maliciosos.

---

## 🤝 Cómo Contribuir
¡Las contribuciones son bienvenidas! Si deseas mejorar el proyecto, sigue estos pasos:

1.  Haz un "Fork" del repositorio.
2.  Crea una nueva rama para tu funcionalidad (`git checkout -b feature/nombre-de-la-funcionalidad`).
3.  Realiza tus cambios y haz "commit" (`git commit -m 'Añade una nueva funcionalidad'`).
4.  Sube tus cambios a tu "fork" (`git push origin feature/nombre-de-la-funcionalidad`).
5.  Abre un "Pull Request" para que podamos revisar tus cambios.

---

## ✍️ Autores y Licencia
Este proyecto es mantenido por el equipo técnico del **Proyecto "Mi Escuelita"**.

Distribuido bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.
