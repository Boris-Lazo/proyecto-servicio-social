#!/bin/bash

# Script de limpieza para producción - Centro Escolar
# Este script elimina todos los archivos y carpetas no esenciales para el funcionamiento
# del proyecto en un entorno de host de producción.

set -e

echo "===================================================="
echo "   Iniciando Limpieza para Producción              "
echo "===================================================="

# 1. Verificación de Seguridad
if [ ! -d "dist" ]; then
    echo "ERROR: La carpeta 'dist' no se encuentra."
    echo "Debes ejecutar 'npm run build' antes de limpiar el proyecto."
    exit 1
fi

# 2. Eliminación de carpetas de desarrollo y código fuente
echo "--> Eliminando carpetas de desarrollo (src, public, docs, test-results)..."
rm -rf src
rm -rf public
rm -rf docs
rm -rf test-results

# 3. Eliminación de archivos de configuración de desarrollo en la raíz
echo "--> Eliminando archivos de configuración de desarrollo..."
rm -f vite.config.js
rm -f index.html
rm -f *.spec.js
rm -f verify_optimization.js
rm -f .gitignore
rm -f .prettierrc
rm -f .eslintrc.json

# 4. Eliminación de documentación y archivos informativos
echo "--> Eliminando documentación y archivos informativos..."
rm -f README.md
rm -f DEPLOY.md
rm -f LICENSE

# 5. Eliminación de scripts de utilidad/configuración inicial
echo "--> Eliminando scripts de configuración inicial..."
rm -f configurar_produccion.sh
rm -f iniciar-aplicacion.sh

# 6. Limpieza de dependencias en la raíz
echo "--> Eliminando node_modules de la raíz (solo necesarios para construcción)..."
rm -rf node_modules

# 7. Limpieza en la carpeta 'private' (Backend)
echo "--> Limpiando carpeta 'private'..."
if [ -d "private" ]; then
    rm -rf private/pruebas
    rm -f private/.eslintrc.json
    rm -f private/.prettierrc

    echo "--> Optimizando dependencias de producción en 'private'..."
    cd private
    # npm prune --production elimina devDependencies ya instaladas
    npm prune --production
    cd ..
else
    echo "ERROR: Carpeta 'private' no encontrada. El backend es esencial."
    exit 1
fi

# 8. Verificación de archivos esenciales restantes
echo ""
echo "===================================================="
echo "   Limpieza Completada Exitosamente                "
echo "===================================================="
echo "Archivos y carpetas esenciales restantes:"
ls -F

echo ""
echo "Instrucciones para iniciar en producción:"
echo "1. Asegúrate de que el archivo .env esté configurado."
echo "2. Ejecuta: npm start (desde la raíz) o 'node private/servidor.js'"
echo "===================================================="
