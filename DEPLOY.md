# 🚀 Guía de Despliegue (Deployment)

Esta guía detalla los pasos necesarios para desplegar el **Proyecto Escuela** en un entorno de producción.

## 1. Requisitos del Sistema
-   **Node.js**: Versión 20 o superior (LTS recomendada).
-   **NPM**: Gestor de paquetes incluido con Node.js.
-   **Espacio en disco**: Suficiente para almacenar imágenes y documentos PDF.
-   **Sistema Operativo**: Linux (Ubuntu/Debian recomendado) o Docker.

## 2. Preparación del Entorno
Clona el repositorio e instala todas las dependencias (tanto del root como del backend):

```bash
npm run instalar-todo
```

## 3. Variables de Entorno (`.env`)
Crea un archivo `.env` en el directorio raíz basándote en la siguiente configuración obligatoria:

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `PORT` | Puerto donde escuchará el servidor. | `4000` |
| `JWT_SECRET` | Clave secreta para firmar tokens de sesión. | `un_secreto_muy_largo_y_aleatorio` |
| `CORS_ORIGIN` | Origen permitido (URL del frontend). | `https://tu-dominio.com` o `*` |
| `SMTP_HOST` | Servidor para envío de correos. | `smtp.gmail.com` |
| `SMTP_USER` | Usuario del servidor de correo. | `notificaciones@escuela.edu.sv` |
| `SMTP_PASS` | Contraseña o App Password del correo. | `xxxx xxxx xxxx xxxx` |
| `USER_DIRECTORA_PASS` | Clave inicial para usuario Directora. | `claveSegura123` |

## 4. Persistencia y Permisos
El sistema utiliza almacenamiento local. Asegúrate de que el usuario que ejecuta el proceso de Node.js tenga permisos de **lectura y escritura** en las siguientes rutas:

-   `private/base_de_datos/`: Para la base de datos SQLite (`escuela.sqlite`).
-   `private/upload/`: Carpeta raíz de subidas.
    -   `private/upload/albums/`: Fotos de los eventos.
    -   `private/upload/docs/`: Documentos circulares en PDF.
    -   `private/upload/thumbnails/`: Miniaturas generadas automáticamente.
    -   `private/upload/temp_albums/`: Procesamiento temporal de archivos.

> [!IMPORTANT]
> Si despliegas en servicios como Render, Railway o Heroku sin volúmenes persistentes, los archivos subidos y la base de datos se borrarán en cada reinicio. Se recomienda el uso de volúmenes montados o servicios de almacenamiento externo para producción.

## 5. Ejecución en Producción
Se recomienda el uso de un gestor de procesos como **PM2** para asegurar que la aplicación se reinicie automáticamente ante fallos.

```bash
# Iniciar con PM2
pm2 start private/servidor.js --name "escuela-api"

# Guardar configuración para reinicios del sistema
pm2 save
```

## 6. Servidor Web y Proxy Inverso (Nginx)
Para producción, es altamente recomendable usar **Nginx** frente a Node.js para gestionar SSL (HTTPS), compresión Gzip y servir archivos estáticos con mayor eficiencia.

Ejemplo básico de configuración de Nginx:
```nginx
server {
    listen 80;
    server_name escuela.edu.sv;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 7. Verificación Post-Despliegue
Una vez desplegado, verifica:
1.  Que el login funciona correctamente.
2.  Que puedes subir una imagen y se visualiza en la galería (esto confirma permisos en `upload`).
3.  Que el envío de correos de recuperación funciona (esto confirma configuración SMTP).
