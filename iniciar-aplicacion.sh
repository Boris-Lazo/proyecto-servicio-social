#!/bin/bash

# =================================================================
# 🚀 Script de Inicio Rápido - Proyecto Escuela
# Automatiza la configuración inicial y ejecución de la aplicación.
# =================================================================

set -e # Terminar ante cualquier error

echo "================================================="
echo "   Iniciando Configuración Automática...         "
echo "================================================="

# 1. Verificación de Requisitos
echo "--> Verificando Node.js y npm..."
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "❌ Error: Node.js y npm son necesarios para este proyecto."
    exit 1
fi
echo "✅ Node.js y npm detectados."

# 2. Instalación de Dependencias
echo ""
echo "--> Instalando dependencias del proyecto (Root y Backend)..."
npm run instalar-todo
echo "✅ Dependencias instaladas."

# 3. Configuración de Variables de Entorno (.env)
echo ""
if [ ! -f .env ]; then
    echo "--> Creando archivo .env con valores seguros por defecto..."

    # Generar un secreto seguro para JWT
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

    cat > .env <<EOF
# Configuración generada automáticamente
PORT=4000
JWT_SECRET=$JWT_SECRET

# Usuarios por defecto (Claves iniciales)
USER_DIRECTORA_PASS=Directora.2025!
USER_SUBDIRECTORA_PASS=Subdirectora.2025!
USER_DEV_PASS=Desarrollador.2025!

# Configuración SMTP (Ejemplo con Ethereal)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Notificaciones Escuela <noreply@amatal.edu.sv>"

# Origen CORS
CORS_ORIGIN=*
EOF
    echo "✅ Archivo .env creado. (Claves por defecto: Directora.2025!, Subdirectora.2025!)"
else
    echo "ℹ️ El archivo .env ya existe, se conservará la configuración actual."
fi

# 4. Creación de Directorios de Datos
echo ""
echo "--> Preparando directorios de persistencia..."
mkdir -p private/base_de_datos
mkdir -p private/upload/albums
mkdir -p private/upload/docs
mkdir -p private/upload/thumbnails
mkdir -p private/upload/temp_albums
echo "✅ Directorios listos."

# 5. Construcción del Frontend (Vue.js)
echo ""
echo "--> Compilando el frontend (Vite + Vue 3)..."
npm run build
echo "✅ Frontend compilado exitosamente."

# 6. Inicio de la Aplicación
echo ""
echo "================================================="
echo "   Configuración Finalizada con Éxito            "
echo "================================================="
echo "🚀 Iniciando el servidor backend en el puerto 4000..."
echo "Puedes acceder a la aplicación en: http://localhost:4000"
echo ""

npm start
