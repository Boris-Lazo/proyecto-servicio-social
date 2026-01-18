# Usar una imagen ligera de Node.js
FROM node:20-alpine

# Instalar dependencias necesarias para sqlite3 y herramientas de compilación
RUN apk add --no-cache python3 make g++

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --only=production

# Reconstruir sqlite3 para asegurar compatibilidad con el entorno alpine
RUN npm rebuild sqlite3

# Copiar el resto del código del backend
COPY . .

# Crear carpetas necesarias para subidas y base de datos si no existen
RUN mkdir -p base_de_datos upload/albums upload/docs upload/temp_albums upload/thumbnails

# Exponer el puerto del servidor
EXPOSE 4000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
