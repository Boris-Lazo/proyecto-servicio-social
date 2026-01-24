// admin.js – Panel de administración mejorado con tabs y estadísticas

const MAX_FOTOS = 30;
const MAX_PDF_MB = 10;

// ---------- UTILIDADES ----------
function $(id) { return document.getElementById(id); }
function mostrarError(caja, mensaje) {
    caja.textContent = mensaje;
    caja.setAttribute('role', 'alert');
}
function mostrarExito(caja, mensaje) {
    caja.textContent = mensaje;
    caja.setAttribute('role', 'status');
}
function reiniciarMensajes(...cajas) {
    cajas.forEach(caja => caja.textContent = '');
}

// ---------- VERIFICAR AUTENTICACIÓN ----------
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');

    if (!token || !usuario) {
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
    const nombreUsuarioEl = $('nombre-usuario');
    if (nombreUsuarioEl) {
        nombreUsuarioEl.textContent = nombresUsuarios[usuario] || usuario;
    }

    return true;
}

// Verificar al cargar la página
if (!verificarAutenticacion()) {
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
        const idDestino = boton.dataset.tab;

        // Remover active de todos los botones y contenidos
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-contenido').forEach(c => c.classList.remove('active'));

        // Activar el botón y contenido seleccionado
        boton.classList.add('active');
        document.getElementById(`tab-${idDestino}`).classList.add('active');
    });
});

// ---------- CARGAR ESTADÍSTICAS ----------
async function cargarEstadisticas() {
    try {
        // Cargar álbumes
        const albumes = await api.obtener('/api/albumes');
        $('stat-albums').textContent = albumes.length || 0;

        // Contar fotos totales
        const fotosTotales = albumes.reduce((suma, album) => suma + (album.fotos?.length || 0), 0);
        $('stat-photos').textContent = fotosTotales;

        // Última actualización
        if (albumes.length > 0) {
            const ultimaFecha = new Date(albumes[0].fecha);
            $('stat-fecha').textContent = ultimaFecha.toLocaleDateString('es-SV');
        }

        // Cargar documentos
        const documentos = await api.obtener('/api/documentos');
        $('stat-docs').textContent = documentos.length || 0;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// Cargar estadísticas al iniciar
cargarEstadisticas();

// ---------- PREVIEW DE FOTOS ----------
$('fotos').addEventListener('change', (evento) => {
    const archivos = Array.from(evento.target.files);
    const etiquetaArchivo = evento.target.parentElement.querySelector('.file-input-label');

    if (archivos.length > MAX_FOTOS) {
        mostrarError($('form-error-album'), `Máximo ${MAX_FOTOS} fotos`);
        evento.target.value = '';
        $('preview').innerHTML = '';
        etiquetaArchivo.textContent = 'Haz clic para seleccionar archivos';
        return;
    }

    etiquetaArchivo.textContent = `${archivos.length} archivo(s) seleccionado(s)平衡`;
    $('preview').innerHTML = '';

    archivos.forEach(archivo => {
        if (archivo.type !== 'image/jpeg' && archivo.type !== 'image/png') return;
        const lector = new FileReader();
        lector.onload = ev => {
            const img = document.createElement('img');
            img.src = ev.target.result;
            img.alt = 'vista previa';
            $('preview').appendChild(img);
        };
        lector.readAsDataURL(archivo);
    });
});

// ---------- PREVIEW DE PDF ----------
$('doc-file').addEventListener('change', (evento) => {
    const archivo = evento.target.files[0];
    const etiquetaArchivo = evento.target.parentElement.querySelector('.file-input-label');

    if (archivo) {
        etiquetaArchivo.textContent = archivo.name;
    } else {
        etiquetaArchivo.textContent = 'Haz clic para seleccionar archivo PDF';
    }
});

// ---------- SUBIR ÁLBUM ----------
$('album-form').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    reiniciarMensajes($('form-error-album'), $('form-success-album'));

    const titulo = $('titulo').value.trim();
    const fecha = $('fecha').value;
    const descripcion = $('descripcion').value.trim();
    const archivos = Array.from($('fotos').files);

    if (!titulo || !fecha || archivos.length === 0) {
        mostrarError($('form-error-album'), 'Completa título, fecha y al menos una foto');
        return;
    }

    const datosFormulario = new FormData();
    datosFormulario.append('titulo', titulo);
    datosFormulario.append('fecha', fecha);
    datosFormulario.append('descripcion', descripcion);
    archivos.forEach(f => datosFormulario.append('fotos', f));

    const boton = $('btn-enviar-album');
    boton.disabled = true;
    boton.textContent = 'Subiendo…';

    try {
        const respuesta = await api.subir('/api/albumes', datosFormulario, (porcentaje) => {
            $('progress').value = porcentaje;
            $('progress-text').textContent = `${porcentaje}%`;
        });

        const album = respuesta.album;
        mostrarExito($('form-success-album'), `✅ Álbum "${album.titulo}" publicado con ${album.fotos.length} fotos.`);
        $('album-form').reset();
        $('preview').innerHTML = '';
        $('progress').value = 0;
        $('progress-text').textContent = '0%';
        document.querySelector('#fotos + .file-input-label').textContent = 'Haz clic para seleccionar archivos';
        cargarEstadisticas();
    } catch (error) {
        mostrarError($('form-error-album'), '❌ ' + error.message);
    } finally {
        boton.disabled = false;
        boton.textContent = 'Publicar álbum';
    }
});

// ---------- SUBIR PDF ----------
$('doc-form').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    reiniciarMensajes($('form-error-doc'), $('form-success-doc'));

    const titulo = $('doc-titulo').value.trim();
    const mes = $('doc-mes').value;
    const archivo = $('doc-file').files[0];

    if (!titulo || !mes || !archivo) {
        mostrarError($('form-error-doc'), 'Completa título, mes y selecciona un PDF');
        return;
    }

    if (archivo.size > MAX_PDF_MB * 1024 * 1024) {
        mostrarError($('form-error-doc'), `Máximo ${MAX_PDF_MB} MB por PDF`);
        return;
    }

    const datosFormulario = new FormData();
    datosFormulario.append('titulo', titulo);
    datosFormulario.append('mes', mes);
    datosFormulario.append('doc', archivo);

    const boton = $('btn-enviar-doc');
    boton.disabled = true;
    boton.textContent = 'Subiendo…';

    try {
        await api.subir('/api/documentos', datosFormulario, (porcentaje) => {
            $('progress-doc').value = porcentaje;
            $('progress-text-doc').textContent = `${porcentaje}%`;
        });

        mostrarExito($('form-success-doc'), `✅ PDF "${titulo}" subido correctamente.`);
        $('doc-form').reset();
        $('progress-doc').value = 0;
        $('progress-text-doc').textContent = '0%';
        document.querySelector('#doc-file + .file-input-label').textContent = 'Haz clic para seleccionar archivo PDF';
        cargarEstadisticas();
    } catch (error) {
        mostrarError($('form-error-doc'), '❌ ' + error.message);
    } finally {
        boton.disabled = false;
        boton.textContent = 'Subir documento';
    }
});

// ---------- MODAL REUTILIZABLE ----------
const modalConfirmacion = document.getElementById('confirm-modal');
const tituloModal = document.getElementById('modal-title');
const mensajeModal = document.getElementById('modal-message');
const pistaModal = document.getElementById('modal-hint');
const cancelarModal = document.getElementById('modal-cancel');
const confirmarModal = document.getElementById('modal-confirm');

let accionConfirmarModal = null;

function mostrarModal(titulo, mensaje, pista, textoConfirmar, alConfirmar) {
    tituloModal.textContent = titulo;
    mensajeModal.textContent = mensaje;
    pistaModal.textContent = pista;
    confirmarModal.textContent = textoConfirmar;
    accionConfirmarModal = alConfirmar;
    modalConfirmacion.classList.add('active');
}

function ocultarModal() {
    modalConfirmacion.classList.remove('active');
    accionConfirmarModal = null;
}

// Cancelar - cerrar modal
cancelarModal.addEventListener('click', ocultarModal);

// Confirmar - ejecutar acción
confirmarModal.addEventListener('click', () => {
    if (accionConfirmarModal) {
        accionConfirmarModal();
    }
    ocultarModal();
});

// Cerrar modal al hacer click fuera
modalConfirmacion.addEventListener('click', (evento) => {
    if (evento.target === modalConfirmacion) {
        ocultarModal();
    }
});

// Cerrar modal con tecla ESC
document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && modalConfirmacion.classList.contains('active')) {
        ocultarModal();
    }
});

// ---------- CERRAR SESIÓN ----------
$('btn-logout').addEventListener('click', () => {
    mostrarModal(
        '🚪 Cerrar Sesión',
        '¿Estás seguro de que deseas cerrar sesión?',
        'Perderás cualquier progreso no guardado.',
        'Cerrar Sesión',
        () => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'login.html';
        }
    );
});

// ---------- GESTIÓN DE CONTENIDO ----------

// Cargar lista de álbumes
async function cargarListaAlbumes() {
    const contenedor = $('lista-albumes');
    try {
        const albumes = await api.obtener('/api/albumes');

        if (albumes.length === 0) {
            contenedor.innerHTML = '<p class="empty-list">No hay álbumes publicados.</p>';
            return;
        }

        contenedor.innerHTML = '';
        albumes.forEach(album => {
            const item = document.createElement('div');
            item.className = 'contenido-item';

            const fecha = new Date(album.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-SV');

            item.innerHTML = `
                <div class="contenido-info">
                    <h4>${sanearHTML(album.titulo)}</h4>
                    <div class="contenido-meta">
                        <span>📅 ${fechaFormateada}</span>
                        <span>📸 ${album.fotos.length} fotos</span>
                    </div>
                </div>
                <button class="btn-delete" data-album-id="${album.id}">🗑️ Eliminar</button>
            `;

            contenedor.appendChild(item);
        });

        // Agregar event listeners a botones de eliminar
        contenedor.querySelectorAll('.btn-delete').forEach(boton => {
            boton.addEventListener('click', () => {
                const idAlbum = boton.dataset.idAlbum;
                const tituloAlbum = boton.closest('.contenido-item').querySelector('h4').textContent;
                const conteoFotos = albumes.find(a => a.id === idAlbum).fotos.length;

                mostrarModal(
                    '🗑️ Eliminar Álbum',
                    `¿Estás seguro de eliminar "${tituloAlbum}"?`,
                    `Se eliminarán ${conteoFotos} fotos. Esta acción no se puede deshacer.`,
                    'Eliminar',
                    () => eliminarAlbum(idAlbum)
                );
            });
        });

    } catch (error) {
        console.error('Error al cargar álbumes:', error);
        contenedor.innerHTML = '<p class="error-contenido">Error al cargar álbumes.</p>';
    }
}

// Cargar lista de documentos
async function cargarListaDocumentos() {
    const contenedor = $('lista-documentos');
    try {
        const documentos = await api.obtener('/api/documentos');

        if (documentos.length === 0) {
            contenedor.innerHTML = '<p class="empty-list">No hay documentos publicados.</p>';
            return;
        }

        contenedor.innerHTML = '';
        documentos.forEach(doc => {
            const item = document.createElement('div');
            item.className = 'contenido-item';

            const [anio, mes] = doc.mes.split('-');
            const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const nombreMes = nombresMeses[parseInt(mes) - 1];

            item.innerHTML = `
                <div class="contenido-info">
                    <h4>${sanearHTML(doc.titulo)}</h4>
                    <div class="contenido-meta">
                        <span>📅 ${nombreMes} ${anio}</span>
                        <span>📄 PDF</span>
                    </div>
                </div>
                <button class="btn-delete" data-doc-id="${doc.id}">🗑️ Eliminar</button>
            `;

            contenedor.appendChild(item);
        });

        // Agregar event listeners a botones de eliminar
        contenedor.querySelectorAll('.btn-delete').forEach(boton => {
            boton.addEventListener('click', () => {
                const idDoc = boton.dataset.idDoc;
                const tituloDoc = boton.closest('.contenido-item').querySelector('h4').textContent;

                mostrarModal(
                    '🗑️ Eliminar Documento',
                    `¿Estás seguro de eliminar "${tituloDoc}"?`,
                    'Esta acción no se puede deshacer.',
                    'Eliminar',
                    () => eliminarDocumento(idDoc)
                );
            });
        });

    } catch (error) {
        console.error('Error al cargar documentos:', error);
        contenedor.innerHTML = '<p class="error-contenido">Error al cargar documentos.</p>';
    }
}

// Eliminar álbum
async function eliminarAlbum(idAlbum) {
    try {
        await api.eliminar(`/api/albumes/${idAlbum}`);
        cargarListaAlbumes();
        cargarEstadisticas();
    } catch (error) {
        console.error('Error al eliminar álbum:', error);
        alert('Error al eliminar el álbum. Por favor, intenta nuevamente.');
    }
}

// Eliminar documento
async function eliminarDocumento(idDoc) {
    try {
        await api.eliminar(`/api/documentos/${idDoc}`);
        cargarListaDocumentos();
        cargarEstadisticas();
    } catch (error) {
        console.error('Error al eliminar documento:', error);
        alert('Error al eliminar el documento. Por favor, intenta nuevamente.');
    }
}

// Cargar listas cuando se abre la pestaña de gestión
document.querySelectorAll('.tab-btn').forEach(boton => {
    boton.addEventListener('click', () => {
        if (boton.dataset.tab === 'gestionar') {
            cargarListaAlbumes();
            cargarListaDocumentos();
        }
    });
});
