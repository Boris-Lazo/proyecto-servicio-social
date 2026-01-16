// lightbox.js - Lógica compartida para el visor de imágenes

// Variables Globales (o módulo si usáramos módulos ES6, pero usaremos global para simplicidad)
let _lightbox_currentAlbum = null;
let _lightbox_currentIndex = 0;

// Elementos DOM (se inicializan al llamar openLightbox por si se cargan dinámicamente)
let _el_lightbox = null;
let _el_image = null;
let _el_counter = null;
let _el_info = null;
let _el_sidebar = null; // Container de thumbnails

function initLightboxElements() {
    _el_lightbox = document.getElementById('lightbox');
    _el_image = document.getElementById('lightbox-image');
    _el_counter = document.getElementById('lightbox-counter');
    _el_info = document.getElementById('lightbox-info');
    _el_sidebar = document.querySelector('.lightbox-sidebar');

    // Event listeners globales (solo una vez)
    if (_el_lightbox && !_el_lightbox.dataset.initialized) {
        document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
        document.getElementById('lightbox-prev').addEventListener('click', showPreviousPhoto);
        document.getElementById('lightbox-next').addEventListener('click', showNextPhoto);

        // Cerrar con Escape y navegar con flechas
        document.addEventListener('keydown', (e) => {
            if (!_el_lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPreviousPhoto();
            if (e.key === 'ArrowRight') showNextPhoto();
        });

        _el_lightbox.dataset.initialized = 'true';
    }
}

window.openLightbox = function (album, index) {
    _lightbox_currentAlbum = album;
    _lightbox_currentIndex = index;

    initLightboxElements();

    if (!_el_lightbox) {
        console.error('Lightbox HTML structure not found in DOM');
        return;
    }

    updateLightboxContent();
    _el_lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Bloquear scroll
};

window.closeLightbox = function () {
    if (_el_lightbox) _el_lightbox.classList.remove('active');
    document.body.style.overflow = '';
    _lightbox_currentAlbum = null;
};

function updateLightboxContent() {
    if (!_lightbox_currentAlbum) return;

    const foto = _lightbox_currentAlbum.fotos[_lightbox_currentIndex];
    const imageUrl = `/api/uploads/${_lightbox_currentAlbum.id}/${foto}`;

    // 1. Imagen Principal
    _el_image.style.opacity = '0.5'; // Efecto de transición simple
    setTimeout(() => {
        _el_image.src = imageUrl;
        _el_image.style.opacity = '1';
    }, 150);

    // 2. Info y Contador
    const total = _lightbox_currentAlbum.fotos.length;
    if (_el_counter) _el_counter.textContent = `${_lightbox_currentIndex + 1} / ${total}`;

    if (_el_info) {
        const date = new Date(_lightbox_currentAlbum.fecha).toLocaleDateString();
        _el_info.innerHTML = `
            <h3>${sanitizeHTML(_lightbox_currentAlbum.titulo)}</h3>
            <p>📅 ${date} • 📸 Foto ${_lightbox_currentIndex + 1} de ${total}</p>
        `;
    }

    // 3. Renderizar Sidebar de Thumbnails
    renderThumbnails();
}

function renderThumbnails() {
    if (!_el_sidebar) return;

    // Limpiar y regenerar solo si cambió el álbum o si está vacío
    // (Optimizacion: Si ya tiene los hijos correctos, solo actualizar clase 'active')
    const currentThumbsId = _el_sidebar.dataset.albumId;

    if (currentThumbsId !== _lightbox_currentAlbum.id) {
        _el_sidebar.innerHTML = '';
        _el_sidebar.dataset.albumId = _lightbox_currentAlbum.id;

        _lightbox_currentAlbum.fotos.forEach((foto, idx) => {
            const img = document.createElement('img');
            img.src = `/api/uploads/${_lightbox_currentAlbum.id}/${foto}`;
            img.loading = 'lazy';

            const div = document.createElement('div');
            div.className = 'lightbox-thumb';
            div.appendChild(img);

            div.onclick = (e) => {
                e.stopPropagation();
                _lightbox_currentIndex = idx;
                updateLightboxContent();
            };

            _el_sidebar.appendChild(div);
        });
    }

    // Actualizar estado Active
    const thumbs = Array.from(_el_sidebar.children);
    thumbs.forEach((t, i) => {
        if (i === _lightbox_currentIndex) {
            t.classList.add('active');
            t.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            t.classList.remove('active');
        }
    });
}

function showNextPhoto() {
    if (!_lightbox_currentAlbum) return;
    if (_lightbox_currentIndex < _lightbox_currentAlbum.fotos.length - 1) {
        _lightbox_currentIndex++;
        updateLightboxContent();
    }
}

function showPreviousPhoto() {
    if (_lightbox_currentIndex > 0) {
        _lightbox_currentIndex--;
        updateLightboxContent();
    }
}

// Helper simple para evitar XSS básico si no existe
function sanitizeHTML(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
