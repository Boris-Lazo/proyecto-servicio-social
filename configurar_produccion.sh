#!/bin/bash

# Script de Configuración de Producción
# Este script automatiza la instalación de dependencias y la configuración de variables de entorno.
# Puede ser borrado después de la primera ejecución exitosa.

set -e # Terminar si ocurre un error

echo "==========================================="
echo "   Configuración Inicial del Proyecto      "
echo "==========================================="

# 1. Verificar herramientas necesarias
echo "--> Verificando herramientas instaladas..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm no está instalado."
    exit 1
fi
echo "✓ Node.js y npm detectados."

# 2. Instalar dependencias
echo ""
echo "--> Instalando dependencias en carpeta 'private'..."
if [ -d "private" ]; then
    cd private
    npm install --production
    cd ..
    echo "✓ Dependencias instaladas correctamente."
else
    echo "ERROR: No se encuentra la carpeta 'private'."
    exit 1
fi

# 3. Configuración de Variables de Entorno (.env)
echo ""
echo "--> Configuración de Variables de Entorno..."

ARCHIVO_ENV=".env"

if [ -f "$ARCHIVO_ENV" ]; then
    echo "AVISO: El archivo $ARCHIVO_ENV ya existe. Saltando configuración de variables."
    echo "Si deseas reconfigurar, borra o renombra el archivo .env actual."
else
    echo "Se creará un nuevo archivo $ARCHIVO_ENV. Por favor ingresa los valores solicitados."
    echo "Presiona Enter para usar el valor por defecto (entre paréntesis) si existe."
    echo ""

    # Función para pedir variables
    pedir_var() {
        local nombre_var=$1
        local mensaje=$2
        local valor_por_defecto=$3
        local es_secreto=$4
        local entrada

        if [ "$es_secreto" = "true" ]; then
            if [ -n "$valor_por_defecto" ]; then
                read -s -p "$mensaje [$valor_por_defecto]: " entrada
            else
                read -s -p "$mensaje: " entrada
            fi
            echo "" # Salto de línea después de input oculto
        else
            if [ -n "$valor_por_defecto" ]; then
                read -p "$mensaje [$valor_por_defecto]: " entrada
            else
                read -p "$mensaje: " entrada
            fi
        fi

        # Usar valor por defecto si la entrada está vacía
        if [ -z "$entrada" ] && [ -n "$valor_por_defecto" ]; then
            entrada="$valor_por_defecto"
        fi

        # Exportar variable para usarla en el script
        eval "$nombre_var=\"$entrada\""
    }

    # Solicitar variables
    
    # Generar un secreto por defecto aleatorio
    SECRETO_ALEATORIO=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    echo "--- Configuración de Seguridad ---"
    echo "Para JWT_SECRET, puedes presionar Enter para generar uno aleatorio y seguro automáticamente."
    pedir_var "JWT_SECRET" "Ingrese el secreto JWT" "$SECRETO_ALEATORIO" "true"
    pedir_var "USER_DIRECTORA_PASS" "Contraseña para usuario Directora" "Directora.2024!" "false"
    pedir_var "USER_SUBDIRECTORA_PASS" "Contraseña para usuario Subdirectora" "Subdirectora.2024!" "false"
    pedir_var "USER_DEV_PASS" "Contraseña para usuario Developer" "dev2024!" "false"
    
    echo "--- Configuración de Correo (SMTP) ---"
    pedir_var "SMTP_HOST" "Host SMTP" "smtp.ethereal.email" "false"
    pedir_var "SMTP_PORT" "Puerto SMTP" "587" "false"
    pedir_var "SMTP_USER" "Usuario SMTP" "" "false"
    pedir_var "SMTP_PASS" "Contraseña SMTP" "" "true"
    pedir_var "SMTP_FROM" "Correo Remitente" "Centro Escolar <noreply@amatal.edu.sv>" "false"
    
    pedir_var "PORT" "Puerto del Servidor" "4000" "false"

    # Generar archivo .env
    cat > "$ARCHIVO_ENV" <<EOF
# Variables de entorno generadas por configurar_produccion.sh
# Fecha: $(date)

JWT_SECRET=$JWT_SECRET

# Usuarios por defecto
USER_DIRECTORA_PASS="$USER_DIRECTORA_PASS"
USER_SUBDIRECTORA_PASS="$USER_SUBDIRECTORA_PASS"
USER_DEV_PASS="$USER_DEV_PASS"

# Configuración SMTP
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_FROM="$SMTP_FROM"

# Servidor
PORT=$PORT
EOF

    echo "✓ Archivo $ARCHIVO_ENV creado exitosamente."
    
    # Seguridad: Restringir permisos de lectura del .env
    chmod 600 "$ARCHIVO_ENV"
    echo "✓ Permisos de seguridad (600) aplicados a $ARCHIVO_ENV."
fi

# 4. Crear Directorios de Persistencia
echo ""
echo "--> Verificando directorios de persistencia..."
mkdir -p private/base_de_datos
mkdir -p private/upload

# Asegurar permisos (Solo el dueño puede escribir)
chmod 700 private/base_de_datos
chmod 700 private/upload
echo "✓ Directorios 'private/base_de_datos' y 'private/upload' listos y asegurados."

echo ""
echo "==========================================="
echo "   Configuración Completada Exitosamente   "
echo "==========================================="
echo "Ahora puedes iniciar el servidor con:"
echo "  pm2 start private/servidor.js --name escuela-api"
echo ""
echo "NOTA: Puedes borrar este archivo 'configurar_produccion.sh' si lo deseas."
