# 🧪 Manual de Control de Calidad (QA)

Este manual detalla los procedimientos para validar que el **Proyecto Escuela** funciona correctamente desde el punto de vista del usuario final y del administrador.

---

## 📋 Pruebas Manuales (Checklist)

### 1. Seguridad y Acceso
- [ ] **Login:** Verificar que al ingresar correo y clave válidos se redirige a `admin.html`.
- [ ] **Logout:** Al presionar "Salir", se debe limpiar el `localStorage` y redirigir a `login.html`.
- [ ] **Protección de Rutas:** Intentar acceder directamente a `admin.html` sin haber iniciado sesión. El sistema debe denegar el acceso (redirigir o mostrar error).
- [ ] **Recuperación de Clave:** Solicitar recuperación, recibir el correo (simulado en logs o Ethereal), y cambiar la clave exitosamente.

### 2. Gestión de Contenido (CMS)
- [ ] **Subida de Álbumes:**
    - [ ] Seleccionar varias imágenes (JPG/PNG).
    - [ ] Verificar que aparece la barra de progreso AJAX.
    - [ ] Confirmar que el álbum aparece en la lista administrativa y en la página pública.
- [ ] **Gestión de Documentos:**
    - [ ] Subir un archivo PDF.
    - [ ] Verificar que se puede descargar desde la sección de circulares.
    - [ ] Eliminar un documento y confirmar que ya no es accesible.

### 3. Experiencia de Usuario (UX)
- [ ] **Visor de Imágenes (Lightbox):** Abrir un álbum en la parte pública, hacer clic en una foto y verificar que se abre el visor a pantalla completa.
- [ ] **Diseño Responsivo:** Probar la web en una ventana estrecha (móvil). El menú debe convertirse en un botón "hamburguesa" y las cuadrículas de fotos deben ajustarse a una sola columna.
- [ ] **Sanitización:** Intentar crear un álbum con un título que contenga etiquetas HTML (ej. `<script>alert('XSS')</script>`). Verificar que el sistema limpia el texto y no ejecuta el script.

---

## 🤖 Pruebas Automatizadas

El proyecto incluye suites de pruebas que deben ejecutarse antes de cada entrega importante.

### Pruebas de Integración (Backend)
Verifican la lógica de los servicios y la conexión con la base de datos.
```bash
cd private
npm test
```

### Pruebas de Extremo a Extremo (E2E)
Verifican el flujo completo en el navegador usando Playwright.
```bash
# Desde la raíz del proyecto
npm test
```

---

## 🛡️ Verificación de Calidad de Código
Asegúrate de que el código cumple con los estándares antes de reportar una tarea como finalizada:
1.  Ejecutar `npm run lint` en la carpeta `private`.
2.  Asegurarse de que no hay "hardcoded secrets" (como contraseñas) en el código.
3.  Verificar que todos los mensajes de error mostrados al usuario estén en español y sean claros.
