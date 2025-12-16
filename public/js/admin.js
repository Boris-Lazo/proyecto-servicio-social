// admin.js – Panel de administración mejorado con tabs y estadísticas

const MAX_FOTOS = 30;
const MAX_PDF_MB = 10;

// ---------- UTILIDADES ----------
function $(id) { return document.getElementById(id); }
function showError(caja, mensaje) {
    caja.textContent = mensaje;
    caja.setAttribute('role', 'alert');
}
function showSuccess(caja, mensaje) {
    caja.textContent = mensaje;
    caja.setAttribute('role', 'status');
}
function resetMsgs(...cajas) {
    cajas.forEach(c => c.textContent = '');
}

// ---------- VERIFICAR AUTENTICACIÓN ----------
function checkAuth() {
    const ficha = localStorage.getItem('token');
    const usuario = localStorage.getItem('user');

    if (!ficha || !usuario) {
        window.location.href = 'login.html';
        return false;
    }

    // Mapear email a nombre de rol
    const nombresUsuarios = {
        'directora@amatal.edu.sv': 'Directora',
        'ericka.flores@clases.edu.sv': 'Subdirectora',
        'borisstanleylazocastillo@gmail.com': 'Desarrollador'
    };

    // Mostrar nombre del usuario
    const elementoNombreUsuario = $('user-name');
    if (elementoNombreUsuario) {
        elementoNombreUsuario.textContent = nombresUsuarios[usuario] || usuario;
    }

    return true;
}

// Verificar al cargar la página
if (!checkAuth()) {
    throw new Error('No autorizado');
}

// ---------- MENÚ HAMBURGUESA (MÓVIL) ----------
const alternarMenu = $('admin-menu-toggle');
const menuNavegacion = $('admin-nav-menu');

if (alternarMenu && menuNavegacion) {
    alternarMenu.addEventListener('click', () => {
        const estaExpandido = alternarMenu.getAttribute('aria-expanded') === 'true';
        alternarMenu.setAttribute('aria-expanded', !estaExpandido);
        menuNavegacion.classList.toggle('show');
    });
}

// ---------- SISTEMA DE PESTAÑAS ----------
document.querySelectorAll('.tab-btn').forEach(boton => {
    boton.addEventListener('click', () => {
        const pestanaObjetivo = boton.dataset.tab;

        // Remover active de todos los botones y contenidos
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(contenido => contenido.classList.remove('active'));

        // Activar el botón y contenido seleccionado
        boton.classList.add('active');
        document.getElementById(`tab-${pestanaObjetivo}`).classList.add('active');
    });
});

// ---------- CARGAR ESTADÍSTICAS ----------
async function loadStats() {
    try {
        const ficha = localStorage.getItem('token');

        // Cargar álbumes
        const respuestaAlbums = await fetch('/api/albums', {
            headers: { 'Authorization': 'Bearer ' + ficha }
        });

        if (respuestaAlbums.ok) {
            const albumes = await respuestaAlbums.json();
            $('stat-albums').textContent = albumes.length || 0;

            // Contar fotos totales
            const totalFotos = albumes.reduce((suma, album) => suma + (album.fotos?.length || 0), 0);
            $('stat-photos').textContent = totalFotos;

            // Última actualización
            if (albumes.length > 0) {
                const ultimaFecha = new Date(albumes[0].fecha);
                $('stat-date').textContent = ultimaFecha.toLocaleDateString('es-SV');
            }
        }

        // Cargar documentos
        const respuestaDocs = await fetch('/api/docs', {
            headers: { 'Authorization': 'Bearer ' + ficha }
        });

        if (respuestaDocs.ok) {
            const documentos = await respuestaDocs.json();
            $('stat-docs').textContent = documentos.length || 0;
        }
    } catch (err) {
        console.error('Error al cargar estadísticas:', err);
    }
}

// Cargar estadísticas al iniciar
loadStats();

// ---------- PREVIEW DE FOTOS ----------
$('fotos').addEventListener('change', (e) => {
    const archivos = Array.from(e.target.files);
    const etiquetaArchivo = e.target.parentElement.querySelector('.file-input-label');

    if (archivos.length > MAX_FOTOS) {
        showError($('form-error-album'), `Máximo ${MAX_FOTOS} fotos`);
        e.target.value = '';
        $('preview').innerHTML = '';
        etiquetaArchivo.textContent = 'Haz clic para seleccionar archivos';
        return;
    }

    etiquetaArchivo.textContent = `${archivos.length} archivo(s) seleccionado(s)`;
    $('preview').innerHTML = '';

    archivos.forEach(archivo => {
        if (archivo.type !== 'image/jpeg') return;
        const lector = new FileReader();
        lector.onload = evento => {
            const imagen = document.createElement('img');
            imagen.src = evento.target.result;
            imagen.alt = 'preview';
            $('preview').appendChild(imagen);
        };
        lector.readAsDataURL(archivo);
    });
});

// ---------- PREVIEW DE PDF ----------
$('doc-file').addEventListener('change', (e) => {
    const archivo = e.target.files[0];
    const etiquetaArchivo = e.target.parentElement.querySelector('.file-input-label');

    if (archivo) {
        etiquetaArchivo.textContent = archivo.name;
    } else {
        etiquetaArchivo.textContent = 'Haz clic para seleccionar archivo PDF';
    }
});

// ---------- SUBIR ÁLBUM ----------
$('album-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    resetMsgs($('form-error-album'), $('form-success-album'));

    const ficha = localStorage.getItem('token');
    if (!ficha) { window.location.href = 'login.html'; return; }

    const titulo = $('titulo').value.trim();
    const fecha = $('fecha').value;
    const descripcion = $('descripcion').value.trim();
    const archivos = Array.from($('fotos').files);

    if (!titulo || !fecha || archivos.length === 0) {
        showError($('form-error-album'), 'Completa título, fecha y al menos una foto');
        return;
    }

    const datosFormulario = new FormData();
    datosFormulario.append('titulo', titulo);
    datosFormulario.append('fecha', fecha);
    datosFormulario.append('descripcion', descripcion);
    archivos.forEach(archivo => datosFormulario.append('fotos', archivo));

    const boton = $('btn-enviar-album');
    boton.disabled = true;
    boton.textContent = 'Subiendo…';

    const solicitud = new XMLHttpRequest();
    solicitud.open('POST', '/api/albums');
    solicitud.setRequestHeader('Authorization', 'Bearer ' + ficha);

    solicitud.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const porcentaje = Math.round((e.loaded / e.total) * 100);
            $('progress').value = porcentaje;
            $('progress-text').textContent = `${porcentaje}%`;
        }
    };

    solicitud.onload = () => {
        boton.disabled = false;
        boton.textContent = 'Publicar álbum';

        if (solicitud.status === 201) {
            const album = JSON.parse(solicitud.responseText).album;
            showSuccess($('form-success-album'), `✅ Álbum "${album.titulo}" publicado con ${album.fotos.length} fotos.`);
            $('album-form').reset();
            $('preview').innerHTML = '';
            $('progress').value = 0;
            $('progress-text').textContent = '0%';

            // Actualizar label del input
            document.querySelector('#fotos + .file-input-label').textContent = 'Haz clic para seleccionar archivos';

            // Recargar estadísticas
            loadStats();
        } else {
            const error = JSON.parse(solicitud.responseText).error || 'Error al publicar';
            showError($('form-error-album'), '❌ ' + error);
        }
    };

    solicitud.onerror = () => {
        boton.disabled = false;
        boton.textContent = 'Publicar álbum';
        showError($('form-error-album'), '❌ Falló la conexión');
    };

    solicitud.send(datosFormulario);
});

// ---------- SUBIR PDF ----------
$('doc-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    resetMsgs($('form-error-doc'), $('form-success-doc'));

    const ficha = localStorage.getItem('token');
    if (!ficha) { window.location.href = 'login.html'; return; }

    const titulo = $('doc-titulo').value.trim();
    const mes = $('doc-mes').value;
    const archivo = $('doc-file').files[0];

    if (!titulo || !mes || !archivo) {
        showError($('form-error-doc'), 'Completa título, mes y selecciona un PDF');
        return;
    }

    if (archivo.size > MAX_PDF_MB * 1024 * 1024) {
        showError($('form-error-doc'), `Máximo ${MAX_PDF_MB} MB por PDF`);
        return;
    }

    const datosFormulario = new FormData();
    datosFormulario.append('titulo', titulo);
    datosFormulario.append('mes', mes);
    datosFormulario.append('doc', archivo);

    const boton = $('btn-enviar-doc');
    boton.disabled = true;
    boton.textContent = 'Subiendo…';

    const solicitud = new XMLHttpRequest();
    solicitud.open('POST', '/api/docs');
    solicitud.setRequestHeader('Authorization', 'Bearer ' + ficha);

    solicitud.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const porcentaje = Math.round((e.loaded / e.total) * 100);
            $('progress-doc').value = porcentaje;
            $('progress-text-doc').textContent = `${porcentaje}%`;
        }
    };

    solicitud.onload = () => {
        boton.disabled = false;
        boton.textContent = 'Subir documento';

        if (solicitud.status === 200) {
            showSuccess($('form-success-doc'), `✅ PDF "${titulo}" subido correctamente.`);
            $('doc-form').reset();
            $('progress-doc').value = 0;
            $('progress-text-doc').textContent = '0%';

            // Actualizar label del input
            document.querySelector('#doc-file + .file-input-label').textContent = 'Haz clic para seleccionar archivo PDF';

            // Recargar estadísticas
            loadStats();
        } else {
            const error = JSON.parse(solicitud.responseText).error || 'Error al subir';
            showError($('form-error-doc'), '❌ ' + error);
        }
    };

    solicitud.onerror = () => {
        boton.disabled = false;
        boton.textContent = 'Subir documento';
        showError($('form-error-doc'), '❌ Falló la conexión');
    };

    solicitud.send(datosFormulario);
});

// ---------- MODAL REUTILIZABLE ----------
const modalConfirmacion = document.getElementById('confirm-modal');
const tituloModal = document.getElementById('modal-title');
const mensajeModal = document.getElementById('modal-message');
const pistaModal = document.getElementById('modal-hint');
const cancelarModal = document.getElementById('modal-cancel');
const confirmarModal = document.getElementById('modal-confirm');

let accionConfirmarModal = null;

function showModal(titulo, mensaje, pista, textoConfirmar, alConfirmar) {
    tituloModal.textContent = titulo;
    mensajeModal.textContent = mensaje;
    pistaModal.textContent = pista;
    confirmarModal.textContent = textoConfirmar;
    accionConfirmarModal = alConfirmar;
    modalConfirmacion.classList.add('active');
}

function hideModal() {
    modalConfirmacion.classList.remove('active');
    accionConfirmarModal = null;
}

// Cancelar - cerrar modal
cancelarModal.addEventListener('click', hideModal);

// Confirmar - ejecutar acción
confirmarModal.addEventListener('click', () => {
    if (accionConfirmarModal) {
        accionConfirmarModal();
    }
    hideModal();
});

// Cerrar modal al hacer click fuera
modalConfirmacion.addEventListener('click', (e) => {
    if (e.target === modalConfirmacion) {
        hideModal();
    }
});

// Cerrar modal con tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalConfirmacion.classList.contains('active')) {
        hideModal();
    }
});

// ---------- CERRAR SESIÓN ----------
$('btn-logout').addEventListener('click', () => {
    showModal(
        '🚪 Cerrar Sesión',
        '¿Estás seguro de que deseas cerrar sesión?',
        'Perderás cualquier progreso no guardado.',
        'Cerrar Sesión',
        () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    );
});

// ---------- GESTIÓN DE CONTENIDO ----------

// Cargar lista de álbumes
async function loadAlbumsList() {
    const contenedor = $('albums-list');
    try {
        const ficha = localStorage.getItem('token');
        const respuesta = await fetch('/api/albums', {
            headers: { 'Authorization': 'Bearer ' + ficha }
        });

        if (!respuesta.ok) throw new Error('Error al cargar álbumes');

        const albumes = await respuesta.json();

        if (albumes.length === 0) {
            contenedor.innerHTML = '<p class="empty-list">No hay álbumes publicados.</p>';
            return;
        }

        contenedor.innerHTML = '';
        albumes.forEach(album => {
            const elemento = document.createElement('div');
            elemento.className = 'content-item';

            const fecha = new Date(album.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-SV');

            elemento.innerHTML = `
                <div class="content-info">
                    <h4>${sanitizarHTML(album.titulo)}</h4>
                    <div class="content-meta">
                        <span>📅 ${fechaFormateada}</span>
                        <span>📸 ${album.fotos.length} fotos</span>
                    </div>
                </div>
                <button class="btn-delete" data-album-id="${album.id}">🗑️ Eliminar</button>
            `;

            contenedor.appendChild(elemento);
        });

        // Agregar event listeners a botones de eliminar
        contenedor.querySelectorAll('.btn-delete').forEach(boton => {
            boton.addEventListener('click', () => {
                const idAlbum = boton.dataset.albumId;
                const tituloAlbum = boton.closest('.content-item').querySelector('h4').textContent;
                const cantidadFotos = albumes.find(a => a.id === idAlbum).fotos.length;

                showModal(
                    '🗑️ Eliminar Álbum',
                    `¿Estás seguro de eliminar "${tituloAlbum}"?`,
                    `Se eliminarán ${cantidadFotos} fotos. Esta acción no se puede deshacer.`,
                    'Eliminar',
                    () => deleteAlbum(idAlbum)
                );
            });
        });

    } catch (error) {
        console.error('Error al cargar álbumes:', error);
        contenedor.innerHTML = '<p class="error-content">Error al cargar álbumes.</p>';
    }
}

// Cargar lista de documentos
async function loadDocsList() {
    const contenedor = $('docs-list');
    try {
        const ficha = localStorage.getItem('token');
        const respuesta = await fetch('/api/docs', {
            headers: { 'Authorization': 'Bearer ' + ficha }
        });

        if (!respuesta.ok) throw new Error('Error al cargar documentos');

        const documentos = await respuesta.json();

        if (documentos.length === 0) {
            contenedor.innerHTML = '<p class="empty-list">No hay documentos publicados.</p>';
            return;
        }

        contenedor.innerHTML = '';
        documentos.forEach(doc => {
            const elemento = document.createElement('div');
            elemento.className = 'content-item';

            const [ano, mes] = doc.mes.split('-');
            const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const nombreMes = nombresMeses[parseInt(mes) - 1];

            elemento.innerHTML = `
                <div class="content-info">
                    <h4>${sanitizarHTML(doc.titulo)}</h4>
                    <div class="content-meta">
                        <span>📅 ${nombreMes} ${ano}</span>
                        <span>📄 PDF</span>
                    </div>
                </div>
                <button class="btn-delete" data-doc-id="${doc.id}">🗑️ Eliminar</button>
            `;

            contenedor.appendChild(elemento);
        });

        // Agregar event listeners a botones de eliminar
        contenedor.querySelectorAll('.btn-delete').forEach(boton => {
            boton.addEventListener('click', () => {
                const idDoc = boton.dataset.docId;
                const tituloDoc = boton.closest('.content-item').querySelector('h4').textContent;

                showModal(
                    '🗑️ Eliminar Documento',
                    `¿Estás seguro de eliminar "${tituloDoc}"?`,
                    'Esta acción no se puede deshacer.',
                    'Eliminar',
                    () => deleteDocument(idDoc)
                );
            });
        });

    } catch (error) {
        console.error('Error al cargar documentos:', error);
        contenedor.innerHTML = '<p class="error-content">Error al cargar documentos.</p>';
    }
}

// Eliminar álbum
async function deleteAlbum(idAlbum) {
    try {
        const ficha = localStorage.getItem('token');
        const respuesta = await fetch(`/api/albums/${idAlbum}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + ficha }
        });

        if (!respuesta.ok) throw new Error('Error al eliminar álbum');

        // Recargar lista
        loadAlbumsList();
        loadStats();
    } catch (error) {
        console.error('Error al eliminar álbum:', error);
        alert('Error al eliminar el álbum. Por favor, intenta nuevamente.');
    }
}

// Eliminar documento
async function deleteDocument(idDoc) {
    try {
        const ficha = localStorage.getItem('token');
        const respuesta = await fetch(`/api/docs/${idDoc}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + ficha }
        });

        if (!respuesta.ok) throw new Error('Error al eliminar documento');

        // Recargar lista
        loadDocsList();
        loadStats();
    } catch (error) {
        console.error('Error al eliminar documento:', error);
        alert('Error al eliminar el documento. Por favor, intenta nuevamente.');
    }
}

// Cargar listas cuando se abre la pestaña de gestión
document.querySelectorAll('.tab-btn').forEach(boton => {
    boton.addEventListener('click', () => {
        if (boton.dataset.tab === 'gestionar') {
            loadAlbumsList();
            loadDocsList();
        }
    });
});