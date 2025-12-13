// admin.js – Panel de administración mejorado con tabs y estadísticas

const MAX_FOTOS = 30;
const MAX_PDF_MB = 10;

// ---------- UTILIDADES ----------
function $(id) { return document.getElementById(id); }
function showError(box, msg) {
    box.textContent = msg;
    box.setAttribute('role', 'alert');
}
function showSuccess(box, msg) {
    box.textContent = msg;
    box.setAttribute('role', 'status');
}
function resetMsgs(...boxes) {
    boxes.forEach(b => b.textContent = '');
}

// ---------- VERIFICAR AUTENTICACIÓN ----------
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        window.location.href = 'login.html';
        return false;
    }

    // Mapear email a nombre de rol
    const userNames = {
        'directora@amatal.edu.sv': 'Directora',
        'ericka.flores@clases.edu.sv': 'Subdirectora',
        'borisstanleylazocastillo@gmail.com': 'Desarrollador'
    };

    // Mostrar nombre del usuario
    const userNameEl = $('user-name');
    if (userNameEl) {
        userNameEl.textContent = userNames[user] || user;
    }

    return true;
}

// Verificar al cargar la página
if (!checkAuth()) {
    throw new Error('No autorizado');
}

// ---------- MENÚ HAMBURGUESA (MÓVIL) ----------
const menuToggle = $('admin-menu-toggle');
const navMenu = $('admin-nav-menu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('show');
    });
}

// ---------- SISTEMA DE PESTAÑAS ----------
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        // Remover active de todos los botones y contenidos
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Activar el botón y contenido seleccionado
        btn.classList.add('active');
        document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
});

// ---------- CARGAR ESTADÍSTICAS ----------
async function loadStats() {
    try {
        const token = localStorage.getItem('token');

        // Cargar álbumes
        const albumsRes = await fetch('/api/albums', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (albumsRes.ok) {
            const albums = await albumsRes.json();
            $('stat-albums').textContent = albums.length || 0;

            // Contar fotos totales
            const totalPhotos = albums.reduce((sum, album) => sum + (album.fotos?.length || 0), 0);
            $('stat-photos').textContent = totalPhotos;

            // Última actualización
            if (albums.length > 0) {
                const lastDate = new Date(albums[0].fecha);
                $('stat-date').textContent = lastDate.toLocaleDateString('es-SV');
            }
        }

        // Cargar documentos
        const docsRes = await fetch('/api/docs', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (docsRes.ok) {
            const docs = await docsRes.json();
            $('stat-docs').textContent = docs.length || 0;
        }
    } catch (err) {
        console.error('Error al cargar estadísticas:', err);
    }
}

// Cargar estadísticas al iniciar
loadStats();

// ---------- PREVIEW DE FOTOS ----------
$('fotos').addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    const fileLabel = e.target.parentElement.querySelector('.file-input-label');

    if (files.length > MAX_FOTOS) {
        showError($('form-error-album'), `Máximo ${MAX_FOTOS} fotos`);
        e.target.value = '';
        $('preview').innerHTML = '';
        fileLabel.textContent = 'Haz clic para seleccionar archivos';
        return;
    }

    fileLabel.textContent = `${files.length} archivo(s) seleccionado(s)`;
    $('preview').innerHTML = '';

    files.forEach(file => {
        if (file.type !== 'image/jpeg') return;
        const reader = new FileReader();
        reader.onload = ev => {
            const img = document.createElement('img');
            img.src = ev.target.result;
            img.alt = 'preview';
            $('preview').appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

// ---------- PREVIEW DE PDF ----------
$('doc-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const fileLabel = e.target.parentElement.querySelector('.file-input-label');

    if (file) {
        fileLabel.textContent = file.name;
    } else {
        fileLabel.textContent = 'Haz clic para seleccionar archivo PDF';
    }
});

// ---------- SUBIR ÁLBUM ----------
$('album-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    resetMsgs($('form-error-album'), $('form-success-album'));

    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    const titulo = $('titulo').value.trim();
    const fecha = $('fecha').value;
    const descripcion = $('descripcion').value.trim();
    const files = Array.from($('fotos').files);

    if (!titulo || !fecha || files.length === 0) {
        showError($('form-error-album'), 'Completa título, fecha y al menos una foto');
        return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('fecha', fecha);
    formData.append('descripcion', descripcion);
    files.forEach(f => formData.append('fotos', f));

    const btn = $('btn-enviar-album');
    btn.disabled = true;
    btn.textContent = 'Subiendo…';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/albums');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const porc = Math.round((e.loaded / e.total) * 100);
            $('progress').value = porc;
            $('progress-text').textContent = `${porc}%`;
        }
    };

    xhr.onload = () => {
        btn.disabled = false;
        btn.textContent = 'Publicar álbum';

        if (xhr.status === 201) {
            const album = JSON.parse(xhr.responseText).album;
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
            const err = JSON.parse(xhr.responseText).error || 'Error al publicar';
            showError($('form-error-album'), '❌ ' + err);
        }
    };

    xhr.onerror = () => {
        btn.disabled = false;
        btn.textContent = 'Publicar álbum';
        showError($('form-error-album'), '❌ Falló la conexión');
    };

    xhr.send(formData);
});

// ---------- SUBIR PDF ----------
$('doc-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    resetMsgs($('form-error-doc'), $('form-success-doc'));

    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    const titulo = $('doc-titulo').value.trim();
    const mes = $('doc-mes').value;
    const file = $('doc-file').files[0];

    if (!titulo || !mes || !file) {
        showError($('form-error-doc'), 'Completa título, mes y selecciona un PDF');
        return;
    }

    if (file.size > MAX_PDF_MB * 1024 * 1024) {
        showError($('form-error-doc'), `Máximo ${MAX_PDF_MB} MB por PDF`);
        return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('mes', mes);
    formData.append('doc', file);

    const btn = $('btn-enviar-doc');
    btn.disabled = true;
    btn.textContent = 'Subiendo…';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/docs');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const porc = Math.round((e.loaded / e.total) * 100);
            $('progress-doc').value = porc;
            $('progress-text-doc').textContent = `${porc}%`;
        }
    };

    xhr.onload = () => {
        btn.disabled = false;
        btn.textContent = 'Subir documento';

        if (xhr.status === 200) {
            showSuccess($('form-success-doc'), `✅ PDF "${titulo}" subido correctamente.`);
            $('doc-form').reset();
            $('progress-doc').value = 0;
            $('progress-text-doc').textContent = '0%';

            // Actualizar label del input
            document.querySelector('#doc-file + .file-input-label').textContent = 'Haz clic para seleccionar archivo PDF';

            // Recargar estadísticas
            loadStats();
        } else {
            const err = JSON.parse(xhr.responseText).error || 'Error al subir';
            showError($('form-error-doc'), '❌ ' + err);
        }
    };

    xhr.onerror = () => {
        btn.disabled = false;
        btn.textContent = 'Subir documento';
        showError($('form-error-doc'), '❌ Falló la conexión');
    };

    xhr.send(formData);
});

// ---------- MODAL REUTILIZABLE ----------
const confirmModal = document.getElementById('confirm-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalHint = document.getElementById('modal-hint');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

let modalConfirmAction = null;

function showModal(title, message, hint, confirmText, onConfirm) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalHint.textContent = hint;
    modalConfirm.textContent = confirmText;
    modalConfirmAction = onConfirm;
    confirmModal.classList.add('active');
}

function hideModal() {
    confirmModal.classList.remove('active');
    modalConfirmAction = null;
}

// Cancelar - cerrar modal
modalCancel.addEventListener('click', hideModal);

// Confirmar - ejecutar acción
modalConfirm.addEventListener('click', () => {
    if (modalConfirmAction) {
        modalConfirmAction();
    }
    hideModal();
});

// Cerrar modal al hacer click fuera
confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        hideModal();
    }
});

// Cerrar modal con tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && confirmModal.classList.contains('active')) {
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
    const container = $('albums-list');
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/albums', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) throw new Error('Error al cargar álbumes');

        const albums = await response.json();

        if (albums.length === 0) {
            container.innerHTML = '<p class="empty-list">No hay álbumes publicados.</p>';
            return;
        }

        container.innerHTML = '';
        albums.forEach(album => {
            const item = document.createElement('div');
            item.className = 'content-item';

            const date = new Date(album.fecha);
            const formattedDate = date.toLocaleDateString('es-SV');

            item.innerHTML = `
                <div class="content-info">
                    <h4>${album.titulo}</h4>
                    <div class="content-meta">
                        <span>📅 ${formattedDate}</span>
                        <span>📸 ${album.fotos.length} fotos</span>
                    </div>
                </div>
                <button class="btn-delete" data-album-id="${album.id}">🗑️ Eliminar</button>
            `;

            container.appendChild(item);
        });

        // Agregar event listeners a botones de eliminar
        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const albumId = btn.dataset.albumId;
                const albumTitle = btn.closest('.content-item').querySelector('h4').textContent;
                const photoCount = albums.find(a => a.id === albumId).fotos.length;

                showModal(
                    '🗑️ Eliminar Álbum',
                    `¿Estás seguro de eliminar "${albumTitle}"?`,
                    `Se eliminarán ${photoCount} fotos. Esta acción no se puede deshacer.`,
                    'Eliminar',
                    () => deleteAlbum(albumId)
                );
            });
        });

    } catch (error) {
        console.error('Error al cargar álbumes:', error);
        container.innerHTML = '<p class="error-content">Error al cargar álbumes.</p>';
    }
}

// Cargar lista de documentos
async function loadDocsList() {
    const container = $('docs-list');
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/docs', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) throw new Error('Error al cargar documentos');

        const docs = await response.json();

        if (docs.length === 0) {
            container.innerHTML = '<p class="empty-list">No hay documentos publicados.</p>';
            return;
        }

        container.innerHTML = '';
        docs.forEach(doc => {
            const item = document.createElement('div');
            item.className = 'content-item';

            const [year, month] = doc.mes.split('-');
            const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const monthName = monthNames[parseInt(month) - 1];

            item.innerHTML = `
                <div class="content-info">
                    <h4>${doc.titulo}</h4>
                    <div class="content-meta">
                        <span>📅 ${monthName} ${year}</span>
                        <span>📄 PDF</span>
                    </div>
                </div>
                <button class="btn-delete" data-doc-id="${doc.id}">🗑️ Eliminar</button>
            `;

            container.appendChild(item);
        });

        // Agregar event listeners a botones de eliminar
        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const docId = btn.dataset.docId;
                const docTitle = btn.closest('.content-item').querySelector('h4').textContent;

                showModal(
                    '🗑️ Eliminar Documento',
                    `¿Estás seguro de eliminar "${docTitle}"?`,
                    'Esta acción no se puede deshacer.',
                    'Eliminar',
                    () => deleteDocument(docId)
                );
            });
        });

    } catch (error) {
        console.error('Error al cargar documentos:', error);
        container.innerHTML = '<p class="error-content">Error al cargar documentos.</p>';
    }
}

// Eliminar álbum
async function deleteAlbum(albumId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/albums/${albumId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) throw new Error('Error al eliminar álbum');

        // Recargar lista
        loadAlbumsList();
        loadStats();
    } catch (error) {
        console.error('Error al eliminar álbum:', error);
        alert('Error al eliminar el álbum. Por favor, intenta nuevamente.');
    }
}

// Eliminar documento
async function deleteDocument(docId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/docs/${docId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) throw new Error('Error al eliminar documento');

        // Recargar lista
        loadDocsList();
        loadStats();
    } catch (error) {
        console.error('Error al eliminar documento:', error);
        alert('Error al eliminar el documento. Por favor, intenta nuevamente.');
    }
}

// Cargar listas cuando se abre la pestaña de gestión
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.tab === 'gestionar') {
            loadAlbumsList();
            loadDocsList();
        }
    });
});