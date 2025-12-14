# Manual de Control de Calidad (QA Manual)

Este documento sirve como guía para la validación manual del sistema antes de cualquier despliegue.

## 📋 Checklist de Verificación Manual

### 1. Autenticación y Seguridad
- [ ] **Login Exitoso**: Ingresar con credenciales válidas redirige al Dashboard (`/admin.html`).
- [ ] **Login Fallido**: Ingresar credenciales erróneas muestra mensaje de error claro.
- [ ] **Protección de Rutas**: Intentar acceder a `/admin.html` sin loguearse debe redirigir a `/login.html`.
- [ ] **Recuperación de Contraseña**:
    - [ ] El correo se envía correctamente (ver logs o inbox simulado).
    - [ ] El token funciona y permite cambiar la contraseña.
    - [ ] Token expirado o inválido es rechazado.

### 2. Panel Administrativo (Dashboard)
- [ ] **Crear Álbum**: Subir título, fecha y fotos. Verificar que aparece en la lista.
- [ ] **Eliminar Álbum**: Borrar un álbum y confirmar que desaparece del listado y de la vista pública.
- [ ] **Subir Documento**: Cargar un PDF con mes y título. Verificar descarga.
- [ ] **Eliminar Documento**: Borrar documento y confirmar eliminación.

### 3. Vista Pública (Frontend)
- [ ] **Responsive Design**:
    - [ ] Verificar menú hamburguesa en móvil (< 768px).
    - [ ] Verificar grid de álbumes en escritorio y móvil.
- [ ] **Carga de Imágenes**: Las imágenes de fondo y de los álbumes cargan correctamente.
- [ ] **Descarga de PDFs**: Los enlaces a documentos funcionan.

### 4. API & Backend
- [ ] **Respuestas JSON**: Verificar que la API responda JSON válido en `/api/albums`.
- [ ] **Manejo de Errores**: Enviar petición malformada (ej. sin token) y recibir 401/400.

## 🚀 Comandos de Verificación Automática
Antes de realizar pruebas manuales, ejecutar:
1. `npm run lint` - Para verificar estilo de código.
2. `npm test` - Para verificar lógica básica.
