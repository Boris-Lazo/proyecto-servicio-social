# Guía de Despliegue (Deployment)

## 1. Código y Scripts (Ya realizados)
He añadido un script de inicio (`start`) en tu `package.json` y configurado CORS para ser más seguro.

## 2. Variables de Entorno (`.env`)
En tu servidor de producción, **NO** copies tu archivo `.env` de desarrollo. Configura las variables de entorno directamente en el panel de tu proveedor de hosting (Railway, Render, AWS, Heroku, etc.) o crea un archivo `.env` nuevo y seguro en el servidor.

Variables críticas:
- `NODE_ENV=production`: Optimiza Express para velocidad y seguridad.
- `JWT_SECRET`: ¡Cámbialo! Genera una cadena larga y aleatoria.
- `CORS_ORIGIN`: Pon la URL de tu dominio (ej. `https://mi-escuela.com`). Si lo dejas vacío, aceptará peticiones de cualquier sitio (inseguro).
- `SMTP_PASS`: Usa la contraseña de aplicación de Gmail que configuraste.
- `PORT`: Generalmente asignado automáticamente por el proveedor de hosting (déjalo como `PORT` o `4000` si te piden uno por defecto).

## 3. Persistencia de Datos (¡Muy Importante!)
Tu aplicación usa **SQLite** (un archivo) y guarda archivos en sistema (`private/upload`).
Si usas servicios de "Apps" como Render o Heroku (en sus planes gratuitos o básicos), el sistema de archivos es **efímero**. Esto significa que si reinicias la app, **perderás la base de datos y los archivos subidos**.

**Opciones:**
1.  **VPS (DigitalOcean Droplet, AWS Lightsail, etc.):** Tienes un disco real. Todo funciona igual que en tu PC. Recomendado para SQLite.
2.  **Docker con Volúmenes:** Si usas Docker, asegúrate de montar volúmenes para:
    - `/app/private/db` (Para `escuela.sqlite`)
    - `/app/private/upload` (Para fotos y documentos)
3.  **Base de Datos Externa (Recomendado para escalabilidad):** Cambiar SQLite por PostgreSQL o MySQL (requiere cambios en código en `db/init.js` y repositorios), o usar un servicio que soporte discos persistentes (Railway ofrece volúmenes, Render ofrece discos persistentes en planes de pago).

## 4. Frontend y Puerto
Tu backend sirve el frontend desde la carpeta `public` y escucha en el puerto 4000.
- Asegúrate de que tu servidor dirija el tráfico HTTP/HTTPS al puerto de tu aplicación.
- Si usas un VPS, necesitarás configurar Nginx o Apache como "Proxy Inverso" y configurar SSL (Certbot/Let's Encrypt).

## 5. Checklist Final
- [ ] Ejecutar `npm install --production` en el servidor (para no instalar devDependencies).
- [ ] Configurar variables de entorno y secretos.
- [ ] Verificar permisos de escritura en carpetas `db` y `upload`.
- [ ] Configurar HTTPS (el candadito seguro).

## Ejemplo de comando para ejecutar en servidor:
```bash
npm start
```
