# Guía de Despliegue (Deployment)

## 1. Preparación del Entorno
La aplicación requiere Node.js (v14+) y las dependencias instaladas en la carpeta `private`.

```bash
cd private
npm install --production
```

## 2. Variables de Entorno (`.env`)
Configura las siguientes variables en tu entorno de producción:
-   `JWT_SECRET`: Clave secreta para firmar los tokens.
-   `CORS_ORIGIN`: URL permitida para el frontend.
-   `PORT`: Puerto del servidor (por defecto 4000).
-   Variables SMTP para el envío de correos de recuperación.

## 3. Estructura de Archivos y Persistencia
Asegúrate de que el proceso de Node tenga permisos de escritura en:
-   `private/base_de_datos/`: Para el archivo `escuela.sqlite`.
-   `private/upload/`: Para las subidas de archivos (álbumes, documentos, miniaturas).

**Nota sobre Cloud Hosting:** Si usas servicios efímeros (como el plan gratuito de Render o Heroku), los datos se perderán al reiniciar. Usa volúmenes persistentes o una base de datos externa.

## 4. Ejecución
El punto de entrada principal es `private/servidor.js`. Puedes usar `pm2` para mantener el proceso vivo:

```bash
pm2 start private/servidor.js --name escuela-api
```

## 5. Frontend
El backend sirve automáticamente la carpeta `public`. No es necesario un servidor web adicional para el frontend, aunque se recomienda usar Nginx como proxy inverso para manejar SSL/HTTPS.
